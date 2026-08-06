import { StyleSheet, View, useWindowDimensions } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { runOnJS } from 'react-native-reanimated'
import { FlashCard, FlashCardProps } from './FlashCard'
import { SlideLayer } from './SlideLayer'

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

const styles = StyleSheet.create({
  stage: {
    flex: 1,
  },
})
