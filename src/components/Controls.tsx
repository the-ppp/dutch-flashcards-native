import { Pressable, StyleSheet, Text, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import Svg, { Line, Path } from 'react-native-svg'
import { colors } from '../theme/colors'
import { fonts } from '../theme/typography'
import { EdgeButton } from './EdgeButton'

type Mark = 'correct' | 'wrong' | null

function ArrowIcon({ direction, color }: { direction: 'left' | 'right'; color: string }) {
  const d = direction === 'left' ? 'M15 5 L8 12 L15 19' : 'M9 5 L16 12 L9 19'
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path d={d} stroke={color} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  )
}

function XIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Line x1={7} y1={7} x2={17} y2={17} stroke={color} strokeWidth={3.5} strokeLinecap="round" />
      <Line x1={17} y1={7} x2={7} y2={17} stroke={color} strokeWidth={3.5} strokeLinecap="round" />
    </Svg>
  )
}

function CheckIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path d="M6 13 L10 17 L18 7" stroke={color} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  )
}

type ControlsProps = {
  onPrev: () => void
  onNext: () => void
  hasPrev: boolean
  hasNext: boolean
  onMarkWrong: () => void
  onMarkCorrect: () => void
  wrongCount: number
  correctCount: number
  currentMark: Mark
  settledMark: Mark
}

const EDGE_DEPTH = 4

export function Controls({
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  onMarkWrong,
  onMarkCorrect,
  wrongCount,
  correctCount,
  currentMark,
  settledMark,
}: ControlsProps) {
  const wrongFlush = settledMark === 'correct'
  const correctFlush = settledMark === 'wrong'

  function handlePrev() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPrev()
  }

  function handleNext() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onNext()
  }

  function handleMarkWrong() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onMarkWrong()
  }

  function handleMarkCorrect() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onMarkCorrect()
  }

  return (
    <View style={styles.row}>
      <EdgeButton
        onPress={handlePrev}
        disabled={!hasPrev}
        depth={EDGE_DEPTH}
        edgeColor={colors.track}
        style={styles.navButton}
        faceStyle={[styles.navFace, styles.navFaceBorder]}
      >
        <ArrowIcon direction="left" color={colors.muted} />
      </EdgeButton>

      <Pressable onPress={handleMarkWrong} style={styles.judgeContainer}>
        <View
          style={[
            StyleSheet.absoluteFill,
            { top: EDGE_DEPTH, backgroundColor: colors.danger, borderRadius: 16 },
          ]}
        />
        <View
          style={[
            styles.judgeFace,
            { borderColor: colors.danger },
            currentMark === 'wrong' ? { backgroundColor: colors.dangerLight } : { backgroundColor: colors.white },
            wrongFlush ? { transform: [{ translateY: EDGE_DEPTH }] } : { transform: [{ translateY: 0 }] },
          ]}
        >
          <XIcon color={colors.danger} />
          <Text style={[styles.judgeCount, { color: colors.danger }]}>{wrongCount}</Text>
        </View>
      </Pressable>

      <Pressable onPress={handleMarkCorrect} style={styles.judgeContainer}>
        <View
          style={[
            StyleSheet.absoluteFill,
            { top: EDGE_DEPTH, backgroundColor: colors.primary, borderRadius: 16 },
          ]}
        />
        <View
          style={[
            styles.judgeFace,
            { borderColor: colors.primary },
            currentMark === 'correct' ? { backgroundColor: colors.primaryLight } : { backgroundColor: colors.white },
            correctFlush ? { transform: [{ translateY: EDGE_DEPTH }] } : { transform: [{ translateY: 0 }] },
          ]}
        >
          <Text style={[styles.judgeCount, { color: colors.primary }]}>{correctCount}</Text>
          <CheckIcon color={colors.primary} />
        </View>
      </Pressable>

      <EdgeButton
        onPress={handleNext}
        disabled={!hasNext}
        depth={EDGE_DEPTH}
        edgeColor={colors.accent}
        style={styles.navButton}
        faceStyle={[styles.navFace, { borderColor: colors.accent }]}
      >
        <ArrowIcon direction="right" color={colors.accent} />
      </EdgeButton>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navButton: {
    height: 56,
    width: 56,
  },
  navFace: {
    height: 56 - EDGE_DEPTH,
    width: 56,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navFaceBorder: {
    borderColor: colors.track,
  },
  judgeContainer: {
    position: 'relative',
    flex: 1,
    height: 56,
  },
  judgeFace: {
    height: 56 - EDGE_DEPTH,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 16,
    borderWidth: 2,
  },
  judgeCount: {
    fontSize: 16,
    fontFamily: fonts.extraBold,
    fontVariant: ['tabular-nums'],
  },
})
