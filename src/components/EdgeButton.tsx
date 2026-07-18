import { ReactNode } from 'react'
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

type EdgeButtonProps = {
  onPress: () => void
  disabled?: boolean
  depth?: number
  edgeColor: string
  edgeRadius?: number
  faceStyle?: StyleProp<ViewStyle>
  style?: StyleProp<ViewStyle>
  children: ReactNode
}

// Reproduces the web app's flat "pressed 3D edge" convention (shadow-[0_Npx_0_0_<color>]
// collapsing via active:translate-y-[Npx]) — RN has no flat-shadow primitive, so this is a
// static colored edge behind a face that translates down to meet it on press.
export function EdgeButton({
  onPress,
  disabled,
  depth = 3,
  edgeColor,
  edgeRadius = 16,
  faceStyle,
  style,
  children,
}: EdgeButtonProps) {
  const pressed = useSharedValue(0)

  const animatedFaceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pressed.value * depth }],
  }))

  return (
    <View style={[styles.container, style, disabled && styles.disabled]}>
      <View style={[StyleSheet.absoluteFill, { top: depth, backgroundColor: edgeColor, borderRadius: edgeRadius }]} />
      <Animated.View style={animatedFaceStyle}>
        <Pressable
          onPress={onPress}
          disabled={disabled}
          onPressIn={() => {
            pressed.value = withTiming(1, { duration: 80 })
          }}
          onPressOut={() => {
            pressed.value = withTiming(0, { duration: 80 })
          }}
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
