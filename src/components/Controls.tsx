import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme/colors'
import { fonts } from '../theme/typography'
import { EdgeButton } from './EdgeButton'

type Mark = 'correct' | 'wrong' | null

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
}

const EDGE_DEPTH = 3

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
}: ControlsProps) {
  const wrongFlush = currentMark === 'correct'
  const correctFlush = currentMark === 'wrong'

  return (
    <View style={styles.row}>
      <EdgeButton
        onPress={onPrev}
        disabled={!hasPrev}
        edgeColor={colors.track}
        style={styles.navButton}
        faceStyle={[styles.navFace, styles.navFaceBorder]}
      >
        <Text style={[styles.navGlyph, { color: colors.muted }]}>←</Text>
      </EdgeButton>

      <Pressable onPress={onMarkWrong} style={styles.judgeContainer}>
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
          <Text style={[styles.judgeGlyph, { color: colors.danger }]}>✕</Text>
          <Text style={[styles.judgeCount, { color: colors.danger }]}>{wrongCount}</Text>
        </View>
      </Pressable>

      <Pressable onPress={onMarkCorrect} style={styles.judgeContainer}>
        <View
          style={[
            StyleSheet.absoluteFill,
            { top: EDGE_DEPTH, backgroundColor: colors.primaryDark, borderRadius: 16 },
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
          <Text style={[styles.judgeGlyph, { color: colors.primary }]}>✓</Text>
          <Text style={[styles.judgeCount, { color: colors.primary }]}>{correctCount}</Text>
        </View>
      </Pressable>

      <EdgeButton
        onPress={onNext}
        disabled={!hasNext}
        edgeColor={colors.accent}
        style={styles.navButton}
        faceStyle={[styles.navFace, { borderColor: colors.accent }]}
      >
        <Text style={[styles.navGlyph, { color: colors.accent }]}>→</Text>
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
    height: 56,
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
  navGlyph: {
    fontSize: 20,
    fontFamily: fonts.extraBold,
  },
  judgeContainer: {
    position: 'relative',
    flex: 1,
    height: 56,
  },
  judgeFace: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 16,
    borderWidth: 2,
  },
  judgeGlyph: {
    fontSize: 16,
    fontFamily: fonts.extraBold,
  },
  judgeCount: {
    fontSize: 16,
    fontFamily: fonts.extraBold,
    fontVariant: ['tabular-nums'],
  },
})
