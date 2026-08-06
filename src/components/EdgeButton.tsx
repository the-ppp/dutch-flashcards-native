import { ReactNode } from 'react'
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

type EdgeButtonProps = {
  onPress: () => void
  disabled?: boolean
  depth?: number
  edgeColor: string
  edgeRadius?: number
  faceStyle?: StyleProp<ViewStyle>
  style?: StyleProp<ViewStyle>
  pressEffect?: 'edge' | 'shrink' | 'pulse'
  flush?: boolean
  children: ReactNode
}

const SHRINK_SCALE = 0.04

// 'edge' reproduces the web app's flat "pressed 3D edge" convention (shadow-[0_Npx_0_0_<color>]
// collapsing via active:translate-y-[Npx]) — RN has no flat-shadow primitive, so this is a
// static colored edge behind a face that translates down to meet it on press.
// 'shrink' drops the edge and scales the button down while held instead, springing back on release.
// 'pulse' ignores hold length: one press dips the face onto the edge and lifts it again, timed to
// overlap whatever transition the press kicked off. `flush` sets the resting offset — a button that
// rests flush is already down on the edge, and only rises when the flag clears.
export function EdgeButton({
  onPress,
  disabled,
  depth = 3,
  edgeColor,
  edgeRadius = 16,
  faceStyle,
  style,
  pressEffect = 'edge',
  flush = false,
  children,
}: EdgeButtonProps) {
  const pressed = useSharedValue(0)
  const shrink = pressEffect === 'shrink'
  const pulse = pressEffect === 'pulse'
  const base = flush ? depth : 0

  const animatedFaceStyle = useAnimatedStyle(() =>
    shrink
      ? { transform: [{ scale: 1 - pressed.value * SHRINK_SCALE }] }
      : { transform: [{ translateY: base + (depth - base) * pressed.value }] },
  )

  function handlePress() {
    if (pulse) {
      pressed.value = withSequence(withTiming(1, { duration: 90 }), withTiming(0, { duration: 150 }))
    }
    onPress()
  }

  return (
    <View style={[styles.container, style, disabled && styles.disabled]}>
      {!shrink && (
        <View style={[StyleSheet.absoluteFill, { top: depth, backgroundColor: edgeColor, borderRadius: edgeRadius }]} />
      )}
      <Animated.View style={animatedFaceStyle}>
        <Pressable
          onPress={handlePress}
          disabled={disabled}
          onPressIn={
            pulse
              ? undefined
              : () => {
                  pressed.value = withTiming(1, { duration: shrink ? 90 : 80 })
                }
          }
          onPressOut={
            pulse
              ? undefined
              : () => {
                  pressed.value = shrink
                    ? withSpring(0, { damping: 15, stiffness: 400, mass: 0.5 })
                    : withTiming(0, { duration: 80 })
                }
          }
          style={[styles.face, faceStyle]}
        >
          {children}
        </Pressable>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  disabled: {
    opacity: 0.4,
  },
  face: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
})
