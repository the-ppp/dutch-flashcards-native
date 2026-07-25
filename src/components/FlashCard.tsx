import { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated'
import { colors } from '../theme/colors'
import { fonts } from '../theme/typography'

export type FlashCardProps = {
  front: string
  back: string
  frontLabel: string
  backLabel: string
  flipped: boolean
  number: number
}

// Purely presentational — owns the flip animation only. Tap-to-flip and swipe
// navigation are handled one level up by CardStage's GestureDetector.
export function FlashCard({ front, back, frontLabel, backLabel, flipped, number }: FlashCardProps) {
  const rotation = useSharedValue(flipped ? 180 : 0)

  useEffect(() => {
    rotation.value = withTiming(flipped ? 180 : 0, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    })
  }, [flipped, rotation])

  // Each face gets its own rotateY (offset 180° apart) rather than sharing one
  // parent rotation + a static compensating rotation on the back face. That way
  // whichever face is actually visible at rest always lands on a true rotateY(0)
  // identity transform (crisp), instead of the back face permanently carrying a
  // residual 3D transform that iOS renders through a blurrier compositing path.
  const frontFaceStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateY: `${rotation.value}deg` }],
    opacity: rotation.value < 90 ? 1 : 0,
  }))
  const backFaceStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateY: `${rotation.value - 180}deg` }],
    opacity: rotation.value >= 90 ? 1 : 0,
  }))

  return (
    <View style={styles.flipContainer}>
      <Animated.View style={[styles.face, styles.front, frontFaceStyle]}>
        <Text style={styles.badge}>{number}</Text>
        <Text style={styles.label}>{frontLabel}</Text>
        <Text style={styles.word}>{front}</Text>
        <Text style={styles.hint}>Tap to reveal</Text>
      </Animated.View>
      <Animated.View style={[styles.face, styles.back, backFaceStyle]}>
        <Text style={styles.badge}>{number}</Text>
        <Text style={[styles.label, styles.backLabel]}>{backLabel}</Text>
        <Text style={styles.word}>{back}</Text>
        <Text style={[styles.hint, styles.backLabel]}>Tap to flip back</Text>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  flipContainer: {
    flex: 1,
    borderRadius: 24,
  },
  face: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 24,
    paddingHorizontal: 24,
  },
  front: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.track,
  },
  back: {
    backgroundColor: colors.accentLight,
    borderWidth: 1,
    borderColor: colors.accentBorder,
  },
  badge: {
    position: 'absolute',
    right: 16,
    top: 16,
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.muted,
    fontVariant: ['tabular-nums'],
  },
  label: {
    fontSize: 12,
    fontFamily: fonts.bold,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: colors.muted,
  },
  backLabel: {
    color: colors.accentDark,
  },
  word: {
    textAlign: 'center',
    fontSize: 34,
    fontFamily: fonts.extraBold,
    color: colors.ink,
  },
  hint: {
    marginTop: 16,
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.muted,
  },
})
