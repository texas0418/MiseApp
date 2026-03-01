/**
 * utils/onboarding.ts
 * 
 * Onboarding state management.
 * Tracks whether the user has completed the first-launch walkthrough.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'mise_onboarding_complete';
const ONBOARDING_VERSION = '1'; // Bump this to re-show onboarding after major updates

/**
 * Check if onboarding has been completed.
 */
export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === ONBOARDING_VERSION;
  } catch {
    return false;
  }
}

/**
 * Mark onboarding as completed.
 */
export async function completeOnboarding(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, ONBOARDING_VERSION);
}

/**
 * Reset onboarding (for testing or if you want to show it again).
 */
export async function resetOnboarding(): Promise<void> {
  await AsyncStorage.removeItem(ONBOARDING_KEY);
}
