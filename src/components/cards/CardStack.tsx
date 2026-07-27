import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import WalletCard from './WalletCard';
import { Card } from '@/types';

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = 200;
const CARD_SPACING = 12;

interface CardStackProps {
  cards: Card[];
  onCardSelect: (card: Card) => void;
  onAddCard: () => void;
}

const CardStack: React.FC<CardStackProps> = ({ cards, onCardSelect, onAddCard }) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const panY = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (!expanded) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (!expanded) {
          if (gestureState.dy < -50) {
            // Swipe up to expand
            expandCards();
          } else {
            // Snap back
            Animated.spring(panY, {
              toValue: 0,
              useNativeDriver: true,
              friction: 8,
            }).start();
          }
        }
      },
    })
  ).current;

  const expandCards = () => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setExpanded(true);
    Animated.spring(panY, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const collapseCards = () => {
    setExpanded(false);
    setSelectedIndex(null);
  };

  const handleCardPress = useCallback((index: number) => {
    if (!expanded) {
      expandCards();
      setSelectedIndex(index);
    } else {
      if (selectedIndex === index) {
        onCardSelect(cards[index]);
      } else {
        setSelectedIndex(index);
      }
    }
  }, [expanded, selectedIndex, cards, onCardSelect]);

  const handleBackgroundPress = () => {
    if (expanded) {
      collapseCards();
    }
  };

  return (
    <View style={styles.container}>
      {/* Background touch area to collapse */}
      {expanded && (
        <View
          style={StyleSheet.absoluteFill}
          onTouchEnd={handleBackgroundPress}
        />
      )}

      {/* Cards */}
      <Animated.View
        style={[
          styles.cardsContainer,
          {
            transform: [{ translateY: panY }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {cards.map((card, index) => (
          <WalletCard
            key={card.id}
            card={card}
            index={index}
            isExpanded={expanded}
            isSelected={selectedIndex === index}
            onPress={() => handleCardPress(index)}
            totalCards={cards.length}
          />
        ))}
      </Animated.View>

      {/* Add card button */}
      {!expanded && (
        <View style={styles.addButtonContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={onAddCard}
            activeOpacity={0.8}
          >
            <View style={styles.addButtonInner}>
              <Text style={styles.addButtonText}>+</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  cardsContainer: {
    width: width,
    height: CARD_HEIGHT + cards.length * CARD_SPACING + 100,
    alignItems: 'center',
    paddingTop: 20,
  },
  addButtonContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 28,
    fontWeight: '300',
    color: '#000',
    lineHeight: 32,
  },
});

export default CardStack;
