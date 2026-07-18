import { ReactNode, useEffect } from 'react'
import { StyleSheet, View, useWindowDimensions } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { FlashCard, FlashCardProps } from './FlashCard'

export type CardSnapshot = FlashCardProps

export type SlideTransition = {
  id: number
  direction: 'forward' | 'backward'
  outgoing: CardSnapshot
} | null

const SWIPE_THRESHOLD = 60

type CardStageProps = {
  current: CardSnapshot
  currentKey: number
  slideTransition: SlideTransition
  onSlideEnd: () => void
  onFlip: () => void
  onSwipeNext: () => void
  onSwipePrev: () => void
}

export function CardStage({
  current,
  currentKey,
  slideTransition,
  onSlideEnd,
  onFlip,
  onSwipeNext,
  onSwipePrev,
}: CardStageProps) {
  const { width } = useWindowDimensions()

  const pan = Gesture.Pan().onEnd((e) => {
    const dx = e.translationX
    const dy = e.translationY
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) runOnJS(onSwipeNext)()
      else runOnJS(onSwipePrev)()
    }
  })

  const tap = Gesture.Tap().onEnd(() => {
    runOnJS(onFlip)()
  })

  const gesture = Gesture.Exclusive(pan, tap)

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.stage}>
        {slideTransition && (
          <SlideLayer
            key={`out-${slideTransition.id}`}
            from={0}
            to={slideTransition.direction === 'forward' ? -width : width}
            interactive={false}
          >
            <FlashCard {...slideTransition.outgoing} />
          </SlideLayer>
        )}
        <SlideLayer
          key={currentKey}
          from={slideTransition ? (slideTransition.direction === 'forward' ? width : -width) : 0}
          to={0}
          onSettled={slideTransition ? onSlideEnd : undefined}
          interactive
        >
          <FlashCard {...current} />
        </SlideLayer>
      </View>
    </GestureDetector>
  )
}

function SlideLayer({
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

const styles = StyleSheet.create({
  stage: {
    flex: 1,
  },
})
