// ---------------------------------------------------------------------------
// contexts/DeviceLicenseContext.tsx — Device-based license gating
//
// Replaces RevenueCat as the source of truth for Pro access.
// Grandfathered RevenueCat subscribers auto-get a device license.
//
// Pricing: $4.99/mo base (1 device), $2.99/mo each additional device.
// ---------------------------------------------------------------------------

import { useEffect, useState, useCallback, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import {
  registerDevice,
  checkDeviceLicense,
  listUserDevices,
  activateDevice,
  deactivateDevice,
  removeDevice,
  getLicensedDeviceCount,
  getCurrentDeviceUuid,
  calculateMonthlyPrice,
  PRICING,
  type DeviceRecord,
} from '@/lib/deviceManager';

export const [DeviceLicenseProvider, useDeviceLicense] = createContextHook(() => {
  const { user, isAuthenticated } = useAuth();
  const { isPro: isRevenueCatPro } = useSubscription();

  const [isDeviceLicensed, setIsDeviceLicensed] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<DeviceRecord | null>(null);
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [currentDeviceUuid, setCurrentDeviceUuid] = useState<string | null>(null);
  const [licensedCount, setLicensedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLegacySubscriber, setIsLegacySubscriber] = useState(false);

  const userId = user?.id ?? null;

  // -----------------------------------------------------------------------
  // Initialize on auth
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (isAuthenticated && userId) {
      initialize(userId);
    } else {
      // Not authenticated — reset state
      setIsDeviceLicensed(false);
      setCurrentDevice(null);
      setDevices([]);
      setLicensedCount(0);
      setIsLoading(false);
    }
  }, [isAuthenticated, userId]);

  // -----------------------------------------------------------------------
  // Re-check on foreground
  // -----------------------------------------------------------------------
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s: AppStateStatus) => {
      if (s === 'active' && userId) refreshLicenseStatus(userId);
    });
    return () => sub.remove();
  }, [userId]);

  // -----------------------------------------------------------------------
  // RevenueCat bridge — if user has active RC subscription, auto-license device
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (isRevenueCatPro && userId && currentDevice && !currentDevice.isLicensed) {
      setIsLegacySubscriber(true);
      activateCurrentDevice();
    }
  }, [isRevenueCatPro, userId, currentDevice]);

  // -----------------------------------------------------------------------
  // Core initialization
  // -----------------------------------------------------------------------
  const initialize = useCallback(async (uid: string) => {
    setIsLoading(true);
    try {
      // Register device (or update existing)
      const device = await registerDevice(uid);
      setCurrentDevice(device);

      // Get current device UUID for highlighting
      const uuid = await getCurrentDeviceUuid();
      setCurrentDeviceUuid(uuid);

      // Check license
      const licensed = await checkDeviceLicense(uid);
      setIsDeviceLicensed(licensed);

      // Load all devices
      const allDevices = await listUserDevices(uid);
      setDevices(allDevices);

      // Count licensed
      const count = await getLicensedDeviceCount(uid);
      setLicensedCount(count);
    } catch (e: any) {
      console.warn('[DeviceLicense] Init error:', e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // -----------------------------------------------------------------------
  // Refresh (lightweight — no re-registration)
  // -----------------------------------------------------------------------
  const refreshLicenseStatus = useCallback(async (uid: string) => {
    try {
      const licensed = await checkDeviceLicense(uid);
      setIsDeviceLicensed(licensed);
      const count = await getLicensedDeviceCount(uid);
      setLicensedCount(count);
    } catch (e: any) {
      console.warn('[DeviceLicense] Refresh error:', e.message);
    }
  }, []);

  // -----------------------------------------------------------------------
  // Public: activate current device
  // -----------------------------------------------------------------------
  const activateCurrentDevice = useCallback(async () => {
    if (!currentDevice) return false;
    const success = await activateDevice(currentDevice.id);
    if (success) {
      setIsDeviceLicensed(true);
      setLicensedCount(prev => prev + 1);
      setCurrentDevice(prev => prev ? { ...prev, isLicensed: true } : null);
      // Refresh device list
      if (userId) {
        const allDevices = await listUserDevices(userId);
        setDevices(allDevices);
      }
    }
    return success;
  }, [currentDevice, userId]);

  // -----------------------------------------------------------------------
  // Public: deactivate a device by ID
  // -----------------------------------------------------------------------
  const deactivateDeviceById = useCallback(async (deviceId: string) => {
    const success = await deactivateDevice(deviceId);
    if (success && userId) {
      // If it was the current device, update local state
      if (currentDevice?.id === deviceId) {
        setIsDeviceLicensed(false);
        setCurrentDevice(prev => prev ? { ...prev, isLicensed: false } : null);
      }
      setLicensedCount(prev => Math.max(0, prev - 1));
      const allDevices = await listUserDevices(userId);
      setDevices(allDevices);
    }
    return success;
  }, [currentDevice, userId]);

  // -----------------------------------------------------------------------
  // Public: remove a device entirely
  // -----------------------------------------------------------------------
  const removeDeviceById = useCallback(async (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    const success = await removeDevice(deviceId);
    if (success && userId) {
      if (device?.isLicensed) setLicensedCount(prev => Math.max(0, prev - 1));
      if (currentDevice?.id === deviceId) {
        setIsDeviceLicensed(false);
        setCurrentDevice(null);
      }
      const allDevices = await listUserDevices(userId);
      setDevices(allDevices);
    }
    return success;
  }, [devices, currentDevice, userId]);

  // -----------------------------------------------------------------------
  // Public: refresh device list
  // -----------------------------------------------------------------------
  const refreshDevices = useCallback(async () => {
    if (!userId) return;
    const allDevices = await listUserDevices(userId);
    setDevices(allDevices);
    const count = await getLicensedDeviceCount(userId);
    setLicensedCount(count);
  }, [userId]);

  // -----------------------------------------------------------------------
  // Derived: is Pro (either device licensed OR legacy RevenueCat)
  // -----------------------------------------------------------------------
  const isPro = isDeviceLicensed || isRevenueCatPro;

  // Monthly price based on current licensed device count
  const monthlyPrice = calculateMonthlyPrice(licensedCount);
  const nextDevicePrice = licensedCount >= PRICING.baseDevices
    ? PRICING.additionalDeviceMonthly
    : PRICING.baseMonthly;

  return {
    // State
    isPro,
    isDeviceLicensed,
    isLegacySubscriber,
    currentDevice,
    currentDeviceUuid,
    devices,
    licensedCount,
    monthlyPrice,
    nextDevicePrice,
    isLoading,
    pricing: PRICING,

    // Actions
    activateCurrentDevice,
    deactivateDeviceById,
    removeDeviceById,
    refreshDevices,
    refreshLicenseStatus: () => userId ? refreshLicenseStatus(userId) : Promise.resolve(),
  };
});
