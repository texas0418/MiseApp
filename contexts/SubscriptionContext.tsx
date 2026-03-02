/**
 * contexts/SubscriptionContext.tsx
 * 
 * RevenueCat Subscription Provider for Mise App
 * 
 * Initializes RevenueCat SDK, tracks Pro subscription status,
 * and exposes purchase/restore functions to the rest of the app.
 * 
 * Entitlement: "Mise Film Director Suite Pro"
 * Product: com.mise.film_director_suite.pro_monthly ($4.99/month)
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';

// RevenueCat types — these match the SDK's exported types
// Using dynamic import pattern so the app doesn't crash if SDK isn't installed yet
let Purchases: any = null;
let LOG_LEVEL: any = null;

try {
  const rc = require('react-native-purchases');
  Purchases = rc.default || rc.Purchases;
  LOG_LEVEL = rc.LOG_LEVEL;
} catch (e) {
  console.log('[Subscription] RevenueCat SDK not installed yet — running in free mode');
}

// ─── Constants ──────────────────────────────────────────────────────────────
const REVENUECAT_IOS_KEY = 'appl_hDSIJdgEdYkPSIavpEfPgjEImCA';
const REVENUECAT_ANDROID_KEY = ''; // Add when Android is set up
const ENTITLEMENT_ID = 'Mise Film Director Suite Pro';

// ─── Types ──────────────────────────────────────────────────────────────────
interface SubscriptionState {
  /** Whether RevenueCat has been initialized */
  isInitialized: boolean;
  /** Whether the user has an active Pro subscription */
  isPro: boolean;
  /** Whether a purchase/restore operation is in progress */
  isLoading: boolean;
  /** Current offering packages available for purchase */
  packages: any[];
  /** Error message from last failed operation */
  error: string | null;
}

interface SubscriptionContextValue extends SubscriptionState {
  /** Purchase the Pro subscription */
  purchasePro: () => Promise<boolean>;
  /** Restore previous purchases */
  restorePurchases: () => Promise<boolean>;
  /** Refresh subscription status */
  refreshStatus: () => Promise<void>;
  /** Check if a specific feature requires Pro */
  requiresPro: (feature: ProFeature) => boolean;
}

export type ProFeature = 
  | 'spreadsheet_import'
  | 'ai_import'
  | 'unlimited_projects'
  | 'csv_templates'
  | 'import_history';

// Features that require Pro subscription
const PRO_FEATURES: Set<ProFeature> = new Set([
  'spreadsheet_import',
  'ai_import',
  'unlimited_projects',
  'csv_templates',
  'import_history',
]);

// Max free projects before Pro is required
export const FREE_PROJECT_LIMIT = 2;

// ─── Context ────────────────────────────────────────────────────────────────
const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────
export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SubscriptionState>({
    isInitialized: false,
    isPro: false,
    isLoading: false,
    packages: [],
    error: null,
  });

  const appState = useRef(AppState.currentState);

  // Initialize RevenueCat
  useEffect(() => {
    initializeRevenueCat();
  }, []);

  // Re-check subscription when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  const handleAppStateChange = useCallback(async (nextState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextState === 'active') {
      await checkSubscriptionStatus();
    }
    appState.current = nextState;
  }, []);

  const initializeRevenueCat = async () => {
    if (!Purchases) {
      // SDK not installed — run in free mode for development
      console.log('[Subscription] Running in free mode (SDK not installed)');
      setState(prev => ({ ...prev, isInitialized: true, isPro: false }));
      return;
    }

    try {
      const apiKey = Platform.OS === 'ios' ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;
      
      if (!apiKey) {
        console.log('[Subscription] No API key for platform:', Platform.OS);
        setState(prev => ({ ...prev, isInitialized: true }));
        return;
      }

      if (LOG_LEVEL) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }
      
      await Purchases.configure({ apiKey });
      console.log('[Subscription] RevenueCat initialized');

      // Check current subscription status
      await checkSubscriptionStatus();
      
      // Fetch available packages
      await fetchOfferings();

      setState(prev => ({ ...prev, isInitialized: true }));
    } catch (error: any) {
      console.log('[Subscription] Init error:', error?.message || error);
      setState(prev => ({ 
        ...prev, 
        isInitialized: true, 
        error: 'Failed to initialize purchases' 
      }));
    }
  };

  const checkSubscriptionStatus = async () => {
    if (!Purchases) return;

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const hasProEntitlement = customerInfo?.entitlements?.active?.[ENTITLEMENT_ID] !== undefined;
      
      setState(prev => ({ ...prev, isPro: hasProEntitlement, error: null }));
      console.log('[Subscription] Pro status:', hasProEntitlement);
    } catch (error: any) {
      console.log('[Subscription] Status check error:', error?.message || error);
    }
  };

  const fetchOfferings = async () => {
    if (!Purchases) return;

    try {
      const offerings = await Purchases.getOfferings();
      const currentOffering = offerings?.current;
      
      if (currentOffering?.availablePackages?.length > 0) {
        setState(prev => ({ ...prev, packages: currentOffering.availablePackages }));
        console.log('[Subscription] Found', currentOffering.availablePackages.length, 'packages');
      }
    } catch (error: any) {
      console.log('[Subscription] Offerings error:', error?.message || error);
    }
  };

  const purchasePro = useCallback(async (): Promise<boolean> => {
    if (!Purchases) {
      setState(prev => ({ ...prev, error: 'Purchase not available in development mode' }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Get the monthly package from offerings
      const offerings = await Purchases.getOfferings();
      const monthlyPackage = offerings?.current?.availablePackages?.find(
        (pkg: any) => pkg.packageType === 'MONTHLY'
      ) || offerings?.current?.availablePackages?.[0];

      if (!monthlyPackage) {
        setState(prev => ({ ...prev, isLoading: false, error: 'No subscription package available' }));
        return false;
      }

      const { customerInfo } = await Purchases.purchasePackage(monthlyPackage);
      const hasProEntitlement = customerInfo?.entitlements?.active?.[ENTITLEMENT_ID] !== undefined;

      setState(prev => ({ 
        ...prev, 
        isPro: hasProEntitlement, 
        isLoading: false,
        error: hasProEntitlement ? null : 'Purchase completed but entitlement not found'
      }));

      return hasProEntitlement;
    } catch (error: any) {
      const userCancelled = error?.userCancelled || error?.code === '1';
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: userCancelled ? null : (error?.message || 'Purchase failed')
      }));

      return false;
    }
  }, []);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    if (!Purchases) {
      setState(prev => ({ ...prev, error: 'Restore not available in development mode' }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const customerInfo = await Purchases.restorePurchases();
      const hasProEntitlement = customerInfo?.entitlements?.active?.[ENTITLEMENT_ID] !== undefined;

      setState(prev => ({ 
        ...prev, 
        isPro: hasProEntitlement, 
        isLoading: false,
        error: hasProEntitlement ? null : 'No active subscription found'
      }));

      return hasProEntitlement;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error?.message || 'Restore failed'
      }));

      return false;
    }
  }, []);

  const refreshStatus = useCallback(async () => {
    await checkSubscriptionStatus();
    await fetchOfferings();
  }, []);

  const requiresPro = useCallback((feature: ProFeature): boolean => {
    if (state.isPro) return false;
    return PRO_FEATURES.has(feature);
  }, [state.isPro]);

  const value: SubscriptionContextValue = {
    ...state,
    purchasePro,
    restorePurchases,
    refreshStatus,
    requiresPro,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────
export function useSubscription(): SubscriptionContextValue {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

export default SubscriptionContext;
