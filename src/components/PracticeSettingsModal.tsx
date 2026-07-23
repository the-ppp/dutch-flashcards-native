import { useState } from 'react'
import { Modal, Pressable, StyleSheet, Text } from 'react-native'
import Slider from '@react-native-community/slider'
import { colors } from '../theme/colors'
import { fonts } from '../theme/typography'
import { EdgeButton } from './EdgeButton'

const MIN_SIZE = 10
const STEP = 10

type PracticeSettingsModalProps = {
  totalWords: number
  currentSize: number
  onConfirm: (size: number) => void
  onClose: () => void
}

export function PracticeSettingsModal({ totalWords, currentSize, onConfirm, onClose }: PracticeSettingsModalProps) {
  const maxSize = Math.max(MIN_SIZE, Math.floor(totalWords / STEP) * STEP)
  const [size, setSize] = useState(Math.min(currentSize, maxSize))

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.dialog} onPress={(e) => e.stopPropagation()}>
          <Pressable style={styles.closeButton} onPress={onClose} accessibilityLabel="Close">
            <Text style={styles.closeGlyph}>✕</Text>
          </Pressable>

          <Text style={styles.heading}>I just want to practice</Text>
          <Text style={styles.sizeRow}>
            <Text style={styles.sizeValue}>{size}</Text>
            <Text style={styles.sizeLabel}> words</Text>
          </Text>

          <Slider
            style={styles.slider}
            minimumValue={MIN_SIZE}
            maximumValue={maxSize}
            step={STEP}
            value={size}
            onValueChange={setSize}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.track}
            thumbTintColor={colors.primary}
          />

          <EdgeButton
            onPress={() => onConfirm(size)}
            depth={4}
            edgeColor={colors.primaryDark}
            edgeRadius={16}
            style={styles.confirmButton}
            faceStyle={styles.confirmFace}
          >
            <Text style={styles.confirmLabel}>Let's go</Text>
          </EdgeButton>
        </Pressable>
      </Pressable>
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
  closeButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    height: 44,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  closeGlyph: {
    fontSize: 20,
    color: colors.muted,
  },
  heading: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.ink,
    marginTop: 2,
    marginBottom: 0,
  },
  sizeRow: {
    marginTop: 4,
  },
  sizeValue: {
    fontSize: 48,
    fontFamily: fonts.extraBold,
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  sizeLabel: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  slider: {
    marginTop: 6,
    width: '100%',
  },
  confirmButton: {
    marginTop: 24,
    width: '100%',
  },
  confirmFace: {
    height: 56,
    width: '100%',
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  confirmLabel: {
    fontSize: 18,
    fontFamily: fonts.extraBold,
    color: colors.white,
  },
})
