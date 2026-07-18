import { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { colors } from '../theme/colors'
import { fonts } from '../theme/typography'

type ProgressBarProps = {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = total === 0 ? 0 : ((current + 1) / total) * 100
  const width = useSharedValue(pct)

  useEffect(() => {
    width.value = withTiming(pct, { duration: 300 })
  }, [pct, width])

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }))

  return (
    <View
      style={styles.track}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: total, now: current + 1 }}
    >
      <Animated.View style={[styles.fill, fillStyle]} />
      <View style={styles.overlay} pointerEvents="none">
        <Text style={styles.counter}>
          {current + 1} / {total}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  track: {
    height: 32,
    width: '100%',
    overflow: 'hidden',
    backgroundColor: colors.track,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counter: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.white,
    fontVariant: ['tabular-nums'],
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
})
