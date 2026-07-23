import { ReactNode, useEffect } from 'react'
import { StyleSheet } from 'react-native'
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

export function SlideLayer({
  from,
  to,
  onSettled,
  interactive,
  children,
}: {
  from: number
  to: number
  onSettled?: () => void
  interactive: boolean
  children: ReactNode
}) {
  const translateX = useSharedValue(from)

  useEffect(() => {
    translateX.value = withTiming(to, { duration: 200, easing: Easing.out(Easing.ease) }, (finished) => {
      if (finished && onSettled) runOnJS(onSettled)()
    })
    // Runs once per mount (this layer is remounted via `key` on every new slide).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const style = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }))

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, style]}
      pointerEvents={interactive ? 'auto' : 'none'}
    >
      {children}
    </Animated.View>
  )
}
