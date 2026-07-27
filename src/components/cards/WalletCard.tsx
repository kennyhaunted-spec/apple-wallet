import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import CardPattern from './CardPattern';
import { Card } from '@/types';
import { formatCurrency, maskCardNumber, getCardNetworkLogo } from '@/utils/formatters';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;
const CARD_HEIGHT = 200;

interface WalletCardProps {
  card: Card;
  index: number;
  isExpanded: boolean;
  isSelected: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  totalCards: number;
  motionEnabled?: boolean;
}

const WalletCard: React.FC<WalletCardProps> = ({
  card,
  index,
  isExpanded,
  isSelected,
  onPress,
  onLongPress,
  totalCards,
  motionEnabled = true,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const rotateX = useRef(new Animated.Value(0)).current;
  const rotateY = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  // Stacked card offset
  const stackedOffset = isExpanded ? 0 : index * 12;
  const stackedScale = isExpanded ? 1 : 1 - (totalCards - 1 - index) * 0.02;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: isExpanded ? index * (CARD_HEIGHT + 20) : stackedOffset,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();

    Animated.spring(scaleAnim, {
      toValue: stackedScale,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [isExpanded, index]);

  // Shimmer effect
  useEffect(() => {
    if (isSelected && motionEnabled) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isSelected, motionEnabled]);

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const handleLongPress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onLongPress?.();
  };

  const getCardIcon = () => {
    switch (card.type) {
      case 'cash':
        return '🍎';
      case 'account':
        return '👤';
      default:
        return '💳';
    }
  };

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-CARD_WIDTH, CARD_WIDTH],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY },
            { scale: scaleAnim },
            { perspective: 1000 },
            { rotateX: rotateX.interpolate({ inputRange: [-1, 1], outputRange: ['-10deg', '10deg'] }) },
            { rotateY: rotateY.interpolate({ inputRange: [-1, 1], outputRange: ['-10deg', '10deg'] }) },
          ],
          zIndex: totalCards - index,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        onLongPress={handleLongPress}
        style={styles.touchable}
      >
        <LinearGradient
          colors={card.cardDesign.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, { borderRadius: 16 }]}
        >
          {/* Pattern overlay */}
          <CardPattern
            pattern={card.cardDesign.pattern}
            color={card.cardDesign.patternColor}
            cardWidth={CARD_WIDTH}
            cardHeight={CARD_HEIGHT}
          />

          {/* Shimmer overlay for selected card */}
          {isSelected && motionEnabled && (
            <Animated.View
              style={[
                styles.shimmer,
                {
                  transform: [{ translateX: shimmerTranslate }],
                },
              ]}
            >
              <LinearGradient
                colors={['transparent', 'rgba(255,255,255,0.1)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          )}

          {/* Card content */}
          <View style={styles.content}>
            {/* Top row */}
            <View style={styles.topRow}>
              <View style={styles.cardNameContainer}>
                {card.type === 'cash' || card.type === 'account' ? (
                  <Text style={[styles.appleLogo, { color: card.cardDesign.textColor }]}>
                    🍎
                  </Text>
                ) : null}
                <Text style={[styles.cardName, { color: card.cardDesign.textColor }]}>
                  {card.displayName}
                </Text>
              </View>
              <Text style={[styles.balance, { color: card.cardDesign.textColor }]}>
                {formatCurrency(card.balance, card.currency)}
              </Text>
            </View>

            {/* Middle - Card number (only on expanded) */}
            {isExpanded && (
              <View style={styles.middleRow}>
                <Text style={[styles.cardNumber, { color: card.cardDesign.textColor }]}>
                  {maskCardNumber(card.cardNumber)}
                </Text>
              </View>
            )}

            {/* Bottom row */}
            <View style={styles.bottomRow}>
              <View>
                <Text style={[styles.holderLabel, { color: card.cardDesign.textColor, opacity: 0.7 }]}>
                  CARD HOLDER
                </Text>
                <Text style={[styles.holderName, { color: card.cardDesign.textColor }]}>
                  {card.holderName.toUpperCase()}
                </Text>
              </View>
              <View style={styles.networkContainer}>
                <Text style={[styles.networkText, { color: card.cardDesign.textColor }]}>
                  {getCardNetworkLogo(card.cardNetwork)}
                </Text>
                {card.type === 'debit' && (
                  <Text style={[styles.debitLabel, { color: card.cardDesign.textColor, opacity: 0.7 }]}>
                    DEBIT
                  </Text>
                )}
              </View>
            </View>

            {/* Status indicators */}
            {card.isLocked && (
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>🔒 LOCKED</Text>
              </View>
            )}
            {card.isFrozen && (
              <View style={[styles.statusBadge, { backgroundColor: 'rgba(255,59,48,0.8)' }]}>
                <Text style={styles.statusText}>❄️ FROZEN</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 0,
  },
  touchable: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appleLogo: {
    fontSize: 20,
    marginRight: 6,
  },
  cardName: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  balance: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  middleRow: {
    marginTop: 20,
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  holderLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
  },
  holderName: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  networkContainer: {
    alignItems: 'flex-end',
  },
  networkText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  debitLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 2,
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    width: CARD_WIDTH * 0.5,
  },
  statusBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});

export default WalletCard;
