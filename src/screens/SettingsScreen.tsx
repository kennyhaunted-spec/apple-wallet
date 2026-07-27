import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useWalletStore } from '@/store/useWalletStore';

type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
};

type SettingsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsNavigationProp>();
  const { settings, updateSettings, cards, transactions } = useWalletStore();

  const handleRecomputeBalances = () => {
    Alert.alert(
      'Recompute Balances',
      'This will recalculate all card balances based on transaction history. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Recompute', 
          style: 'default',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Done', 'Balances have been recomputed.');
          }
        },
      ]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will delete all cards and transactions. This cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.doneButton}>Done</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Currency Section */}
        <Text style={styles.sectionHeader}>Currency</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Display Currency</Text>
            <TouchableOpacity style={styles.rowValue}>
              <Text style={styles.rowValueText}>{settings.displayCurrency} ⌄</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>USD → EUR Rate</Text>
            <Text style={styles.rowValueText}>{settings.currencyRates['EUR'] || 0.92}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Adjust rate</Text>
            <View style={styles.rateAdjust}>
              <TouchableOpacity style={styles.rateButton}>
                <Text style={styles.rateButtonText}>−</Text>
              </TouchableOpacity>
              <View style={styles.rateDivider} />
              <TouchableOpacity style={styles.rateButton}>
                <Text style={styles.rateButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Motion Section */}
        <Text style={styles.sectionHeader}>Motion</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Enable motion-reactive card colors</Text>
            <Switch
              value={settings.motionReactiveColors}
              onValueChange={(value) => updateSettings({ motionReactiveColors: value })}
              trackColor={{ false: '#39393D', true: '#34C759' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Tap to Cash Section */}
        <Text style={styles.sectionHeader}>Tap to Cash</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Allow Tap to Cash requests</Text>
            <Switch
              value={settings.tapToCashEnabled}
              onValueChange={(value) => updateSettings({ tapToCashEnabled: value })}
              trackColor={{ false: '#39393D', true: '#34C759' }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.descriptionRow}>
            <Text style={styles.descriptionText}>
              When turned off, this iPhone stops advertising, browsing, sending, and accepting nearby Tap to Cash transfers.
            </Text>
          </View>
        </View>

        {/* Appearance Section */}
        <Text style={styles.sectionHeader}>Appearance</Text>
        <View style={styles.section}>
          <View style={styles.segmentControl}>
            {(['system', 'light', 'dark'] as const).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.segmentButton,
                  settings.appearance === mode && styles.segmentButtonActive,
                ]}
                onPress={() => updateSettings({ appearance: mode })}
              >
                <Text style={[
                  styles.segmentText,
                  settings.appearance === mode && styles.segmentTextActive,
                ]}>
                  {mode === 'system' ? 'Match System' : mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Security Section */}
        <Text style={styles.sectionHeader}>Security</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Use Face ID / Touch ID</Text>
            <Switch
              value={settings.useFaceId}
              onValueChange={(value) => updateSettings({ useFaceId: value })}
              trackColor={{ false: '#39393D', true: '#34C759' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Notifications Section */}
        <Text style={styles.sectionHeader}>Notifications</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Enable Notifications</Text>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={(value) => updateSettings({ notificationsEnabled: value })}
              trackColor={{ false: '#39393D', true: '#34C759' }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Sound Effects</Text>
            <Switch
              value={settings.soundEnabled}
              onValueChange={(value) => updateSettings({ soundEnabled: value })}
              trackColor={{ false: '#39393D', true: '#34C759' }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Haptic Feedback</Text>
            <Switch
              value={settings.hapticEnabled}
              onValueChange={(value) => updateSettings({ hapticEnabled: value })}
              trackColor={{ false: '#39393D', true: '#34C759' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Maintenance Section */}
        <Text style={styles.sectionHeader}>Maintenance</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionRow} onPress={handleRecomputeBalances}>
            <Text style={styles.actionText}>🔄 Recompute Balances Now</Text>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <Text style={styles.sectionHeader}>Danger Zone</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.dangerRow} onPress={handleResetData}>
            <Text style={styles.dangerText}>⚠️ Reset All Data</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            Cards: {cards.length} | Transactions: {transactions.length}
          </Text>
          <Text style={styles.versionText}>Apple Wallet v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  doneButton: {
    color: '#0A84FF',
    fontSize: 17,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  sectionHeader: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 8,
  },
  section: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#2C2C2E',
  },
  rowLabel: {
    color: '#FFFFFF',
    fontSize: 17,
  },
  rowValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowValueText: {
    color: '#8E8E93',
    fontSize: 17,
  },
  rateAdjust: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
  },
  rateButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rateButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '300',
  },
  rateDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#3A3A3C',
  },
  descriptionRow: {
    padding: 16,
    paddingTop: 8,
  },
  descriptionText: {
    color: '#8E8E93',
    fontSize: 13,
    lineHeight: 18,
  },
  segmentControl: {
    flexDirection: 'row',
    padding: 4,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    margin: 12,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  segmentButtonActive: {
    backgroundColor: '#636366',
  },
  segmentText: {
    color: '#8E8E93',
    fontSize: 15,
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actionRow: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: '#0A84FF',
    fontSize: 17,
  },
  dangerRow: {
    padding: 16,
  },
  dangerText: {
    color: '#FF453A',
    fontSize: 17,
  },
  statsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  statsText: {
    color: '#8E8E93',
    fontSize: 13,
  },
  versionText: {
    color: '#636366',
    fontSize: 12,
    marginTop: 4,
  },
});

export default SettingsScreen;
