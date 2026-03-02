/**
 * app/paywall.tsx
 * 
 * Mise Pro Paywall Screen
 * 
 * A modal screen that displays the Pro subscription offering.
 * Shows feature list, price, and purchase/restore buttons.
 * Follows Mise's gold/dark theme.
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Linking, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Crown, Upload, Sparkles, FolderOpen, FileSpreadsheet,
  History, X, Shield, ExternalLink, RotateCcw
} from 'lucide-react-native';
import { useSubscription } from '@/contexts/SubscriptionContext';
import Colors from '@/constants/colors';

const PRO_FEATURES = [
  {
    icon: Upload,
    title: 'Spreadsheet Import',
    description: 'Import crew lists, budgets, and shot lists from CSV & Excel files',
  },
  {
    icon: Sparkles,
    title: 'AI Import',
    description: 'Describe your data in plain language or photograph handwritten sheets',
  },
  {
    icon: FolderOpen,
    title: 'Unlimited Projects',
    description: 'Manage as many productions as you need simultaneously',
  },
  {
    icon: FileSpreadsheet,
    title: 'CSV Templates',
    description: 'Download pre-formatted templates for every data type',
  },
  {
    icon: History,
    title: 'Import History & Undo',
    description: 'Track and reverse bulk imports with one tap',
  },
];

export default function PaywallScreen() {
  const router = useRouter();
  const { isPro, isLoading, purchasePro, restorePurchases, error } = useSubscription();
  const [restoring, setRestoring] = useState(false);

  // If already Pro, show success and go back
  if (isPro) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIconWrap}>
            <Crown color={Colors.accent.gold} size={48} />
          </View>
          <Text style={styles.successTitle}>You're a Pro!</Text>
          <Text style={styles.successSubtitle}>
            All premium features are unlocked. Thank you for supporting Mise.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handlePurchase = async () => {
    const success = await purchasePro();
    if (success) {
      Alert.alert('Welcome to Pro!', 'All premium features are now unlocked.', [
        { text: 'Continue', onPress: () => router.back() }
      ]);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    const success = await restorePurchases();
    setRestoring(false);
    
    if (success) {
      Alert.alert('Restored!', 'Your Pro subscription has been restored.', [
        { text: 'Continue', onPress: () => router.back() }
      ]);
    } else {
      Alert.alert('No Subscription Found', 'No active Pro subscription was found for this Apple ID.');
    }
  };

  const openTerms = () => {
    Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/');
  };

  const openPrivacy = () => {
    Linking.openURL('https://texas0418.github.io/MiseApp/');
  };

  return (
    <View style={styles.container}>
      {/* Close Button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <X color={Colors.text.secondary} size={24} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.crownContainer}>
            <View style={styles.crownGlow} />
            <Crown color={Colors.accent.gold} size={40} />
          </View>
          <Text style={styles.title}>Mise Pro</Text>
          <Text style={styles.subtitle}>Unlock the full power of your director's toolkit</Text>
        </View>

        {/* Feature List */}
        <View style={styles.featureList}>
          {PRO_FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <View key={index} style={styles.featureRow}>
                <View style={styles.featureIconWrap}>
                  <Icon color={Colors.accent.gold} size={20} />
                </View>
                <View style={styles.featureTextWrap}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDesc}>{feature.description}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Pricing */}
        <View style={styles.pricingCard}>
          <Text style={styles.priceAmount}>$4.99</Text>
          <Text style={styles.pricePeriod}>per month</Text>
          <View style={styles.priceDivider} />
          <Text style={styles.priceNote}>Cancel anytime. No long-term commitment.</Text>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Purchase Button */}
        <TouchableOpacity
          style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
          onPress={handlePurchase}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.text.inverse} size="small" />
          ) : (
            <>
              <Crown color={Colors.text.inverse} size={18} />
              <Text style={styles.primaryButtonText}>Subscribe to Mise Pro</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Restore Button */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          activeOpacity={0.7}
          disabled={restoring || isLoading}
        >
          {restoring ? (
            <ActivityIndicator color={Colors.text.secondary} size="small" />
          ) : (
            <>
              <RotateCcw color={Colors.text.secondary} size={14} />
              <Text style={styles.restoreButtonText}>Restore Purchases</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Legal Footer */}
        <View style={styles.legalFooter}>
          <Text style={styles.legalText}>
            Payment will be charged to your Apple ID account at confirmation of purchase. 
            Subscription automatically renews unless it is canceled at least 24 hours before 
            the end of the current period. Your account will be charged for renewal within 
            24 hours prior to the end of the current period. You can manage and cancel your 
            subscriptions in your App Store account settings.
          </Text>
          <View style={styles.legalLinks}>
            <TouchableOpacity onPress={openTerms} style={styles.legalLink}>
              <Text style={styles.legalLinkText}>Terms of Use</Text>
              <ExternalLink color={Colors.text.tertiary} size={10} />
            </TouchableOpacity>
            <Text style={styles.legalDot}>•</Text>
            <TouchableOpacity onPress={openPrivacy} style={styles.legalLink}>
              <Text style={styles.legalLinkText}>Privacy Policy</Text>
              <ExternalLink color={Colors.text.tertiary} size={10} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bg.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  // Header
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  crownContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent.goldBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  crownGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.accent.gold + '08',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.accent.gold,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Features
  featureList: {
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border.subtle,
    gap: 14,
  },
  featureIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.accent.goldBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  featureTextWrap: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 3,
  },
  featureDesc: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  // Pricing
  pricingCard: {
    alignItems: 'center',
    backgroundColor: Colors.bg.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.accent.gold + '30',
  },
  priceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.accent.gold,
  },
  pricePeriod: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  priceDivider: {
    width: 40,
    height: 1,
    backgroundColor: Colors.border.subtle,
    marginVertical: 16,
  },
  priceNote: {
    fontSize: 13,
    color: Colors.text.tertiary,
  },
  // Error
  errorContainer: {
    backgroundColor: Colors.status.error + '15',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: Colors.status.error,
    textAlign: 'center',
  },
  // Buttons
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accent.gold,
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.inverse,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    marginBottom: 24,
  },
  restoreButtonText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  // Legal
  legalFooter: {
    paddingTop: 16,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border.subtle,
  },
  legalText: {
    fontSize: 10,
    color: Colors.text.tertiary,
    lineHeight: 15,
    textAlign: 'center',
    marginBottom: 12,
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  legalLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  legalLinkText: {
    fontSize: 11,
    color: Colors.text.tertiary,
    textDecorationLine: 'underline',
  },
  legalDot: {
    color: Colors.text.tertiary,
    fontSize: 10,
  },
  // Success State
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  successIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.accent.goldBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.accent.gold,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 15,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
});
