// ---------------------------------------------------------------------------
// lib/deviceManager.ts — Device registration & license management
//
// Pricing model:
//   Base: $4.99/mo → 1 device
//   Each additional device: $2.99/mo
//
// The devices table was created in the Phase 1 migration.
// This module handles device registration, license checks, and management.
// ---------------------------------------------------------------------------

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { supabase } from '@/lib/supabase';

const DEVICE_ID_KEY = 'mise_device_id';

export interface DeviceRecord {
  id: string;
  userId: string;
  deviceUuid: string;
  platform: string;
  deviceName: string;
  deviceModel: string;
  appVersion: string;
  isLicensed: boolean;
  lastActiveAt: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Device UUID — stable identifier for this physical device
// ---------------------------------------------------------------------------

async function getOrCreateDeviceUuid(): Promise<string> {
  // Try to load existing device UUID
  const stored = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (stored) return stored;

  // Generate a new one based on platform identifiers + random fallback
  let uuid: string;
  try {
    if (Platform.OS === 'ios') {
      // identifierForVendor is stable per app-vendor pair
      uuid = (await Application.getIosIdForVendorAsync()) || '';
    } else {
      uuid = Application.androidId || '';
    }
  } catch {
    uuid = '';
  }

  // Fallback: generate a random UUID if platform ID not available
  if (!uuid) {
    uuid = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
  }

  await AsyncStorage.setItem(DEVICE_ID_KEY, uuid);
  return uuid;
}

// ---------------------------------------------------------------------------
// Get device info
// ---------------------------------------------------------------------------

function getDeviceInfo() {
  return {
    platform: Platform.OS,
    deviceName: Device.deviceName || `${Platform.OS} device`,
    deviceModel: Device.modelName || Device.modelId || 'Unknown',
    appVersion: Application.nativeApplicationVersion || '1.0.0',
  };
}

// ---------------------------------------------------------------------------
// Register this device (called on first launch after auth)
// ---------------------------------------------------------------------------

export async function registerDevice(userId: string): Promise<DeviceRecord | null> {
  const deviceUuid = await getOrCreateDeviceUuid();
  const info = getDeviceInfo();

  // Check if device already registered
  const { data: existing, error: fetchError } = await supabase
    .from('devices')
    .select('*')
    .eq('user_id', userId)
    .eq('device_uuid', deviceUuid)
    .maybeSingle();

  if (fetchError) {
    console.warn('[DeviceManager] Fetch error:', fetchError.message);
    return null;
  }

  if (existing) {
    // Update last active timestamp and device info
    const { data: updated, error: updateError } = await supabase
      .from('devices')
      .update({
        device_name: info.deviceName,
        device_model: info.deviceModel,
        app_version: info.appVersion,
        last_active_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (updateError) {
      console.warn('[DeviceManager] Update error:', updateError.message);
      return rowToDevice(existing);
    }
    return rowToDevice(updated);
  }

  // New device — register it
  const { data: inserted, error: insertError } = await supabase
    .from('devices')
    .insert({
      user_id: userId,
      device_uuid: deviceUuid,
      platform: info.platform,
      device_name: info.deviceName,
      device_model: info.deviceModel,
      app_version: info.appVersion,
      is_licensed: false,
      last_active_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    console.warn('[DeviceManager] Insert error:', insertError.message);
    return null;
  }

  return rowToDevice(inserted);
}

// ---------------------------------------------------------------------------
// Check if current device is licensed
// ---------------------------------------------------------------------------

export async function checkDeviceLicense(userId: string): Promise<boolean> {
  const deviceUuid = await getOrCreateDeviceUuid();

  const { data, error } = await supabase
    .from('devices')
    .select('is_licensed')
    .eq('user_id', userId)
    .eq('device_uuid', deviceUuid)
    .maybeSingle();

  if (error || !data) return false;
  return data.is_licensed === true;
}

// ---------------------------------------------------------------------------
// List all devices for a user
// ---------------------------------------------------------------------------

export async function listUserDevices(userId: string): Promise<DeviceRecord[]> {
  const { data, error } = await supabase
    .from('devices')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('last_active_at', { ascending: false });

  if (error || !data) return [];
  return data.map(rowToDevice);
}

// ---------------------------------------------------------------------------
// Get current device UUID (for highlighting in UI)
// ---------------------------------------------------------------------------

export async function getCurrentDeviceUuid(): Promise<string> {
  return getOrCreateDeviceUuid();
}

// ---------------------------------------------------------------------------
// Activate a device (set is_licensed = true)
// ---------------------------------------------------------------------------

export async function activateDevice(deviceId: string): Promise<boolean> {
  const { error } = await supabase
    .from('devices')
    .update({ is_licensed: true })
    .eq('id', deviceId);

  return !error;
}

// ---------------------------------------------------------------------------
// Deactivate a device (set is_licensed = false)
// ---------------------------------------------------------------------------

export async function deactivateDevice(deviceId: string): Promise<boolean> {
  const { error } = await supabase
    .from('devices')
    .update({ is_licensed: false })
    .eq('id', deviceId);

  return !error;
}

// ---------------------------------------------------------------------------
// Remove a device entirely (soft delete)
// ---------------------------------------------------------------------------

export async function removeDevice(deviceId: string): Promise<boolean> {
  const { error } = await supabase
    .from('devices')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', deviceId);

  return !error;
}

// ---------------------------------------------------------------------------
// Count licensed devices for a user
// ---------------------------------------------------------------------------

export async function getLicensedDeviceCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('devices')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_licensed', true)
    .is('deleted_at', null);

  if (error) return 0;
  return count ?? 0;
}

// ---------------------------------------------------------------------------
// Pricing helpers
// ---------------------------------------------------------------------------

export const PRICING = {
  baseMonthly: 4.99,
  additionalDeviceMonthly: 2.99,
  baseDevices: 1,
};

export function calculateMonthlyPrice(licensedDeviceCount: number): number {
  if (licensedDeviceCount <= PRICING.baseDevices) return PRICING.baseMonthly;
  const additionalDevices = licensedDeviceCount - PRICING.baseDevices;
  return PRICING.baseMonthly + additionalDevices * PRICING.additionalDeviceMonthly;
}

// ---------------------------------------------------------------------------
// Row mapping
// ---------------------------------------------------------------------------

function rowToDevice(row: any): DeviceRecord {
  return {
    id: row.id,
    userId: row.user_id,
    deviceUuid: row.device_uuid,
    platform: row.platform,
    deviceName: row.device_name,
    deviceModel: row.device_model,
    appVersion: row.app_version,
    isLicensed: row.is_licensed,
    lastActiveAt: row.last_active_at,
    createdAt: row.created_at,
  };
}
