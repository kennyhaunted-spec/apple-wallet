import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Path, Rect, G } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;
const CARD_HEIGHT = 200;

interface CardPatternProps {
  pattern: 'dots' | 'waves' | 'lines' | 'circles' | 'none' | 'custom';
  color: string;
  cardWidth?: number;
  cardHeight?: number;
}

const CardPattern: React.FC<CardPatternProps> = ({ 
  pattern, 
  color, 
  cardWidth = CARD_WIDTH, 
  cardHeight = CARD_HEIGHT 
}) => {
  if (pattern === 'none') return null;

  const renderDots = () => {
    const dots = [];
    const cols = 20;
    const rows = 8;
    const spacingX = cardWidth / cols;
    const spacingY = cardHeight / rows;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const size = 2 + Math.random() * 3;
        const opacity = 0.05 + Math.random() * 0.1;
        dots.push(
          <Circle
            key={`${i}-${j}`}
            cx={i * spacingX + spacingX / 2}
            cy={j * spacingY + spacingY / 2}
            r={size}
            fill={color}
            opacity={opacity}
          />
        );
      }
    }
    return dots;
  };

  const renderWaves = () => {
    const waves = [];
    for (let i = 0; i < 5; i++) {
      const y = 30 + i * 35;
      const path = `M 0 ${y} Q ${cardWidth / 4} ${y - 15} ${cardWidth / 2} ${y} T ${cardWidth} ${y}`;
      waves.push(
        <Path
          key={i}
          d={path}
          stroke={color}
          strokeWidth="1.5"
          fill="none"
          opacity={0.08}
        />
      );
    }
    return waves;
  };

  const renderLines = () => {
    const lines = [];
    for (let i = 0; i < 15; i++) {
      const y = 10 + i * 14;
      lines.push(
        <Rect
          key={i}
          x="0"
          y={y}
          width={cardWidth}
          height="0.5"
          fill={color}
          opacity={0.06}
        />
      );
    }
    return lines;
  };

  const renderCircles = () => {
    const circles = [];
    const positions = [
      { cx: cardWidth * 0.2, cy: cardHeight * 0.3, r: 30 },
      { cx: cardWidth * 0.7, cy: cardHeight * 0.6, r: 45 },
      { cx: cardWidth * 0.5, cy: cardHeight * 0.2, r: 20 },
      { cx: cardWidth * 0.85, cy: cardHeight * 0.25, r: 15 },
      { cx: cardWidth * 0.15, cy: cardHeight * 0.7, r: 25 },
    ];

    positions.forEach((pos, i) => (
      circles.push(
        <Circle
          key={i}
          cx={pos.cx}
          cy={pos.cy}
          r={pos.r}
          stroke={color}
          strokeWidth="0.5"
          fill="none"
          opacity={0.08}
        />
      )
    ));
    return circles;
  };

  const getPattern = () => {
    switch (pattern) {
      case 'dots': return renderDots();
      case 'waves': return renderWaves();
      case 'lines': return renderLines();
      case 'circles': return renderCircles();
      default: return null;
    }
  };

  return (
    <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      <Svg width={cardWidth} height={cardHeight}>
        <G>
          {getPattern()}
        </G>
      </Svg>
    </View>
  );
};

export default CardPattern;
