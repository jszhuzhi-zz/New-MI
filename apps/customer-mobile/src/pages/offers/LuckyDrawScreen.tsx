import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
  ScrollView,
} from 'react-native';
import { useLocale } from '../../hooks/useLocale';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  primary: '#00694B',
  primaryLight: '#E8F5EF',
  accent: '#C4A962',
  accentDark: '#A68B42',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E0E0E0',
  red: '#D32F2F',
};

type GameMode = 'wheel' | 'scratch';

const prizes = [
  { id: 1, name: { 'zh-TW': 'HK$100 現金券', 'zh-CN': 'HK$100 现金券', en: 'HK$100 Voucher' }, color: COLORS.accent },
  { id: 2, name: { 'zh-TW': '免費泊車券', 'zh-CN': '免费停车券', en: 'Free Parking' }, color: COLORS.primary },
  { id: 3, name: { 'zh-TW': '雙倍印花', 'zh-CN': '双倍印花', en: 'Double Stamps' }, color: '#1976D2' },
  { id: 4, name: { 'zh-TW': 'Starbucks 咖啡券', 'zh-CN': 'Starbucks 咖啡券', en: 'Starbucks Voucher' }, color: '#2E7D32' },
  { id: 5, name: { 'zh-TW': '50印花', 'zh-CN': '50印花', en: '50 Stamps' }, color: '#7B1FA2' },
  { id: 6, name: { 'zh-TW': '謝謝參與', 'zh-CN': '谢谢参与', en: 'Try Again' }, color: '#9E9E9E' },
];

export default function LuckyDrawScreen() {
  const { locale } = useLocale();
  const [gameMode, setGameMode] = useState<GameMode>('wheel');
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<typeof prizes[0] | null>(null);
  const [chancesLeft, setChancesLeft] = useState(3);
  const [scratchRevealed, setScratchRevealed] = useState(false);

  const spinAngle = useRef(new Animated.Value(0)).current;

  const labels = {
    title: locale === 'en' ? 'Lucky Draw' : locale === 'zh-CN' ? '幸运大抽奖' : '幸運大抽獎',
    spin: locale === 'en' ? 'SPIN' : locale === 'zh-CN' ? '转！' : '轉！',
    chances: locale === 'en' ? 'Chances remaining' : locale === 'zh-CN' ? '剩余机会' : '剩餘機會',
    congratulations: locale === 'en' ? 'Congratulations!' : locale === 'zh-CN' ? '恭喜您！' : '恭喜您！',
    youWon: locale === 'en' ? 'You won:' : locale === 'zh-CN' ? '您获得了：' : '您獲得了：',
    noChances: locale === 'en' ? 'No chances remaining' : locale === 'zh-CN' ? '没有剩余机会' : '沒有剩餘機會',
    wheelSpin: locale === 'en' ? 'Wheel Spin' : locale === 'zh-CN' ? '幸运转盘' : '幸運轉盤',
    scratchCard: locale === 'en' ? 'Scratch Card' : locale === 'zh-CN' ? '刮刮卡' : '刮刮卡',
    scratch: locale === 'en' ? 'Tap to Scratch' : locale === 'zh-CN' ? '点击刮开' : '點擊刮開',
    prizeList: locale === 'en' ? 'Prize List' : locale === 'zh-CN' ? '奖品列表' : '獎品列表',
    playAgain: locale === 'en' ? 'Play Again' : locale === 'zh-CN' ? '再玩一次' : '再玩一次',
    collect: locale === 'en' ? 'Collect Prize' : locale === 'zh-CN' ? '领取奖品' : '領取獎品',
  };

  const handleSpin = () => {
    if (chancesLeft <= 0 || isSpinning) return;
    setIsSpinning(true);
    setResult(null);

    const winIndex = Math.floor(Math.random() * prizes.length);
    const targetAngle = 360 * 5 + (360 / prizes.length) * winIndex;

    Animated.timing(spinAngle, {
      toValue: targetAngle,
      duration: 4000,
      useNativeDriver: true,
    }).start(() => {
      setIsSpinning(false);
      setChancesLeft((prev) => prev - 1);
      setResult(prizes[winIndex]);
      spinAngle.setValue(targetAngle % 360);
    });
  };

  const handleScratch = () => {
    if (chancesLeft <= 0) return;
    setScratchRevealed(true);
    const winIndex = Math.floor(Math.random() * prizes.length);
    setResult(prizes[winIndex]);
    setChancesLeft((prev) => prev - 1);
  };

  const handlePlayAgain = () => {
    setResult(null);
    setScratchRevealed(false);
    spinAngle.setValue(0);
  };

  const spin = spinAngle.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Game Mode Selector */}
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeTab, gameMode === 'wheel' && styles.modeTabActive]}
          onPress={() => { setGameMode('wheel'); handlePlayAgain(); }}
        >
          <Text style={[styles.modeTabText, gameMode === 'wheel' && styles.modeTabTextActive]}>
            {labels.wheelSpin}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeTab, gameMode === 'scratch' && styles.modeTabActive]}
          onPress={() => { setGameMode('scratch'); handlePlayAgain(); }}
        >
          <Text style={[styles.modeTabText, gameMode === 'scratch' && styles.modeTabTextActive]}>
            {labels.scratchCard}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chances */}
      <View style={styles.chancesBar}>
        <Text style={styles.chancesText}>
          {labels.chances}: <Text style={styles.chancesCount}>{chancesLeft}</Text>
        </Text>
      </View>

      {/* Wheel Spin Game */}
      {gameMode === 'wheel' && (
        <View style={styles.gameSection}>
          <View style={styles.wheelContainer}>
            {/* Pointer */}
            <View style={styles.pointer}>
              <View style={styles.pointerTriangle} />
            </View>

            {/* Wheel */}
            <Animated.View style={[styles.wheel, { transform: [{ rotate: spin }] }]}>
              {prizes.map((prize, index) => {
                const rotation = (360 / prizes.length) * index;
                return (
                  <View
                    key={prize.id}
                    style={[
                      styles.wheelSegment,
                      {
                        transform: [{ rotate: `${rotation}deg` }],
                        backgroundColor: prize.color + '30',
                        borderColor: prize.color,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.wheelSegmentText, { color: prize.color }]}
                      numberOfLines={1}
                    >
                      {prize.name[locale as keyof typeof prize.name] || prize.name.en}
                    </Text>
                  </View>
                );
              })}
              <View style={styles.wheelCenter} />
            </Animated.View>
          </View>

          <TouchableOpacity
            style={[styles.spinButton, (isSpinning || chancesLeft <= 0) && styles.spinButtonDisabled]}
            onPress={handleSpin}
            disabled={isSpinning || chancesLeft <= 0}
            activeOpacity={0.8}
          >
            <Text style={styles.spinButtonText}>
              {chancesLeft <= 0 ? labels.noChances : labels.spin}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Scratch Card Game */}
      {gameMode === 'scratch' && (
        <View style={styles.gameSection}>
          <TouchableOpacity
            style={styles.scratchCard}
            onPress={handleScratch}
            disabled={scratchRevealed || chancesLeft <= 0}
            activeOpacity={0.9}
          >
            {!scratchRevealed ? (
              <View style={styles.scratchCover}>
                <View style={styles.scratchPattern}>
                  {Array.from({ length: 9 }).map((_, i) => (
                    <View key={i} style={styles.scratchDot} />
                  ))}
                </View>
                <Text style={styles.scratchHint}>
                  {chancesLeft <= 0 ? labels.noChances : labels.scratch}
                </Text>
              </View>
            ) : (
              <View style={styles.scratchResult}>
                <Text style={styles.scratchResultEmoji}>
                  {result && result.id !== 6 ? '!' : '-'}
                </Text>
                {result && (
                  <Text style={[styles.scratchResultText, { color: result.color }]}>
                    {result.name[locale as keyof typeof result.name] || result.name.en}
                  </Text>
                )}
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Result */}
      {result && (
        <View style={styles.resultSection}>
          <Text style={styles.resultTitle}>{labels.congratulations}</Text>
          <Text style={styles.resultSubtitle}>{labels.youWon}</Text>
          <View style={[styles.resultPrizeBadge, { backgroundColor: result.color + '15' }]}>
            <Text style={[styles.resultPrizeText, { color: result.color }]}>
              {result.name[locale as keyof typeof result.name] || result.name.en}
            </Text>
          </View>
          <View style={styles.resultActions}>
            {chancesLeft > 0 && (
              <TouchableOpacity style={styles.playAgainButton} onPress={handlePlayAgain}>
                <Text style={styles.playAgainButtonText}>{labels.playAgain}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.collectButton}>
              <Text style={styles.collectButtonText}>{labels.collect}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Prize List */}
      <View style={styles.prizeListSection}>
        <Text style={styles.prizeListTitle}>{labels.prizeList}</Text>
        {prizes.map((prize) => (
          <View key={prize.id} style={styles.prizeItem}>
            <View style={[styles.prizeDot, { backgroundColor: prize.color }]} />
            <Text style={styles.prizeName}>
              {prize.name[locale as keyof typeof prize.name] || prize.name.en}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 40 },
  modeSelector: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    marginHorizontal: 16, marginTop: 16, borderRadius: 12,
    padding: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  modeTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  modeTabActive: { backgroundColor: COLORS.primary },
  modeTabText: { fontSize: 14, fontWeight: '500', color: COLORS.textSecondary },
  modeTabTextActive: { color: '#FFFFFF', fontWeight: '600' },
  chancesBar: { alignItems: 'center', paddingVertical: 12 },
  chancesText: { fontSize: 14, color: COLORS.textSecondary },
  chancesCount: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  gameSection: { alignItems: 'center', paddingVertical: 16 },
  wheelContainer: { width: 280, height: 280, alignItems: 'center', justifyContent: 'center' },
  pointer: { position: 'absolute', top: -5, zIndex: 10 },
  pointerTriangle: {
    width: 0, height: 0, borderLeftWidth: 12, borderRightWidth: 12,
    borderTopWidth: 20, borderLeftColor: 'transparent',
    borderRightColor: 'transparent', borderTopColor: COLORS.red,
  },
  wheel: {
    width: 260, height: 260, borderRadius: 130,
    borderWidth: 4, borderColor: COLORS.accent,
    position: 'relative', overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  wheelSegment: {
    position: 'absolute', width: '50%', height: 40,
    left: '25%', top: '50%', marginTop: -20,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderRadius: 4,
  },
  wheelSegmentText: { fontSize: 10, fontWeight: '600', textAlign: 'center' },
  wheelCenter: {
    position: 'absolute', width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.accent, top: '50%', left: '50%',
    marginTop: -20, marginLeft: -20, borderWidth: 3, borderColor: '#FFFFFF',
  },
  spinButton: {
    width: 160, height: 52, backgroundColor: COLORS.accent,
    borderRadius: 26, justifyContent: 'center', alignItems: 'center',
    marginTop: 20, shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3,
    shadowRadius: 8, elevation: 4,
  },
  spinButtonDisabled: { backgroundColor: COLORS.border },
  spinButtonText: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', letterSpacing: 2 },
  scratchCard: {
    width: SCREEN_WIDTH - 64, height: 200, borderRadius: 16,
    overflow: 'hidden', marginHorizontal: 16,
  },
  scratchCover: {
    flex: 1, backgroundColor: COLORS.accent,
    justifyContent: 'center', alignItems: 'center',
  },
  scratchPattern: {
    flexDirection: 'row', flexWrap: 'wrap', width: 100, gap: 12,
    justifyContent: 'center', marginBottom: 16,
  },
  scratchDot: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  scratchHint: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  scratchResult: {
    flex: 1, backgroundColor: COLORS.surface,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: COLORS.accent, borderRadius: 16,
  },
  scratchResultEmoji: { fontSize: 48, marginBottom: 8, fontWeight: '800', color: COLORS.accent },
  scratchResultText: { fontSize: 20, fontWeight: '700' },
  resultSection: {
    alignItems: 'center', backgroundColor: COLORS.surface,
    marginHorizontal: 16, marginTop: 16, borderRadius: 16,
    padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  resultTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  resultSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 12 },
  resultPrizeBadge: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginBottom: 20 },
  resultPrizeText: { fontSize: 18, fontWeight: '700' },
  resultActions: { flexDirection: 'row', gap: 12 },
  playAgainButton: {
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  playAgainButtonText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  collectButton: {
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10,
    backgroundColor: COLORS.primary,
  },
  collectButtonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  prizeListSection: {
    backgroundColor: COLORS.surface, marginHorizontal: 16,
    marginTop: 16, borderRadius: 12, padding: 16,
  },
  prizeListTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
  prizeItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10 },
  prizeDot: { width: 10, height: 10, borderRadius: 5 },
  prizeName: { fontSize: 14, color: COLORS.textSecondary },
});
