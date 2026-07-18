import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { colors } from '../theme/colors'
import { fonts } from '../theme/typography'
import { EdgeButton } from './EdgeButton'

const RING_SIZE = 140
const RING_STROKE = 14
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

type ResultsModalProps = {
  correctCount: number
  wrongCount: number
  onRepeat: () => void
  onNewCards: () => void
}

export function ResultsModal({ correctCount, wrongCount, onRepeat, onNewCards }: ResultsModalProps) {
  const judged = correctCount + wrongCount
  const pct = judged === 0 ? 0 : Math.round((correctCount / judged) * 100)
  const dashOffset = RING_CIRCUMFERENCE * (1 - pct / 100)

  return (
    <Modal transparent animationType="fade" visible>
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <View style={styles.ringWrap}>
            <Svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                strokeWidth={RING_STROKE}
                stroke={colors.track}
                fill="none"
              />
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                strokeWidth={RING_STROKE}
                stroke={colors.primary}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                rotation={-90}
                origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
              />
            </Svg>
            <View style={styles.ringCenter} pointerEvents="none">
              <Text style={styles.pctText}>{pct}%</Text>
            </View>
          </View>

          <View style={styles.footerRow}>
            <Pressable style={styles.repeatButton} onPress={onRepeat}>
              <Text style={styles.repeatLabel}>Repeat cards</Text>
            </Pressable>
            <EdgeButton
              onPress={onNewCards}
              depth={4}
              edgeColor={colors.primaryDark}
              edgeRadius={16}
              style={styles.newButton}
              faceStyle={styles.newFace}
            >
              <Text style={styles.newLabel}>New cards</Text>
            </EdgeButton>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.modalBackdrop,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  dialog: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    backgroundColor: colors.white,
    padding: 24,
    alignItems: 'center',
  },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pctText: {
    fontSize: 32,
    fontFamily: fonts.extraBold,
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  footerRow: {
    marginTop: 24,
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  repeatButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.track,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repeatLabel: {
    fontSize: 16,
    fontFamily: fonts.extraBold,
    color: colors.ink,
  },
  newButton: {
    flex: 1,
  },
  newFace: {
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  newLabel: {
    fontSize: 16,
    fontFamily: fonts.extraBold,
    color: colors.white,
  },
})
