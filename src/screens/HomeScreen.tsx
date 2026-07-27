import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useWalletStore } from '@/store/useWalletStore';
import WalletCard from '@/components/cards/WalletCard';
import { Card } from '@/types';
import { formatCurrency } from '@/utils/formatters';

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = 200;
const CARD_SPACING = 12;

type RootStackParamList = {
  Home: undefined;
  CardDetail: { cardId: string };
  AddCard: undefined;
  Settings: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const cards = useWalletStore((state) => state.cards);
  const settings = useWalletStore((state) => state.settings);
  const [expanded, setExpanded] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleCardPress = useCallback((index: number) => {
    if (!expanded) {
      setExpanded(true);
      setSelectedIndex(index);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      if (selectedIndex === index) {
        navigation.navigate('CardDetail', { cardId: cards[index].id });
      } else {
        setSelectedIndex(index);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  }, [expanded, selectedIndex, cards, navigation]);

  const handleBackgroundPress = () => {
    if (expanded) {
      setExpanded(false);
      setSelectedIndex(null);
    }
  };

  const handleAddCard = () => {
    navigation.navigate('AddCard');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Wallet</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={handleSettings}
            activeOpacity={0.7}
          >
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>📦</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={handleAddCard}
            activeOpacity={0.7}
          >
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>+</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Cards Stack */}
      <View style={styles.cardsContainer}>
        {expanded && (
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1}
            onPress={handleBackgroundPress}
          />
        )}

        {cards.map((card, index) => (
          <View
            key={card.id}
            style={[
              styles.cardWrapper,
              {
                top: expanded ? index * (CARD_HEIGHT + 20) : index * CARD_SPACING,
                zIndex: cards.length - index,
              },
            ]}
          >
            <WalletCard
              card={card}
              index={index}
              isExpanded={expanded}
              isSelected={selectedIndex === index}
              onPress={() => handleCardPress(index)}
              totalCards={cards.length}
              motionEnabled={settings.motionReactiveColors}
            />
          </View>
        ))}
      </View>

      {/* Bottom info when collapsed */}
      {!expanded && cards.length > 0 && (
        <View style={styles.bottomInfo}>
          <Text style={styles.totalBalance}>
            Total: {formatCurrency(
              cards.reduce((sum, c) => sum + c.balance, 0),
              settings.displayCurrency
            )}
          </Text>
          <Text style={styles.hint}>Tap a card to expand</Text>
        </View>
      )}
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
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
    position: 'relative',
  },
  cardWrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
  },
  bottomInfo: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  totalBalance: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.8,
  },
  hint: {
    color: '#8E8E93',
    fontSize: 13,
    marginTop: 4,
  },
});

export default HomeScreen;
