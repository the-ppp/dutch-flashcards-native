import { useRef, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Language } from '../data/languages'
import { shuffledIndices } from '../lib/shuffledIndices'
import { colors } from '../theme/colors'
import { CardStage, CardSnapshot, SlideTransition } from './CardStage'
import { ProgressBar } from './ProgressBar'
import { ModeBar, Direction } from './ModeBar'
import { SettingsButton } from './SettingsButton'
import { Controls } from './Controls'
import { PracticeSettingsModal } from './PracticeSettingsModal'
import { ResultsModal } from './ResultsModal'

type Judgment = 'correct' | 'wrong'

type PracticeScreenProps = {
  language: Language
  onChangeLanguage: () => void
}

function BackArrowIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path d="M15 5 L8 12 L15 19" stroke={color} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  )
}

export function PracticeScreen({ language, onChangeLanguage }: PracticeScreenProps) {
  const insets = useSafeAreaInsets()
  const transitionIdRef = useRef(0)
  const words = language.words

  const [order, setOrder] = useState<number[]>(() => shuffledIndices(words.length))
  const [pos, setPos] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [slideTransition, setSlideTransition] = useState<SlideTransition>(null)
  const [direction, setDirection] = useState<Direction>('target-en')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [results, setResults] = useState<(Judgment | null)[]>(() => Array(order.length).fill(null))
  const [showResults, setShowResults] = useState(false)

  const wordIndex = order[pos]
  const card = words[wordIndex]
  const front = direction === 'target-en' ? card.targetWord : card.englishWord
  const back = direction === 'target-en' ? card.englishWord : card.targetWord
  const frontLabel = direction === 'target-en' ? language.name : 'English'
  const backLabel = direction === 'target-en' ? 'English' : language.name

  const correctCount = results.filter((r) => r === 'correct').length
  const wrongCount = results.filter((r) => r === 'wrong').length
  const answeredCount = results.filter((r) => r !== null).length
  const hasNext = pos < answeredCount
  const hasPrev = pos > 0
  const currentMark = results[pos]

  function beginSlide(dir: 'forward' | 'backward') {
    transitionIdRef.current += 1
    setSlideTransition({
      id: transitionIdRef.current,
      direction: dir,
      outgoing: { front, back, frontLabel, backLabel, number: pos + 1, flipped },
    })
  }

  function beginSession(newOrder: number[]) {
    setOrder(newOrder)
    setPos(0)
    setFlipped(false)
    setResults(Array(newOrder.length).fill(null))
    setShowResults(false)
  }

  function goNext() {
    if (pos >= answeredCount) return
    beginSlide('forward')
    setFlipped(false)
    setPos((p) => p + 1)
  }

  function goPrev() {
    beginSlide('backward')
    setFlipped(false)
    setPos((p) => Math.max(0, p - 1))
  }

  function toggleDirection() {
    setDirection((d) => (d === 'target-en' ? 'en-target' : 'target-en'))
    setFlipped(false)
  }

  function mark(judgment: Judgment) {
    setResults((r) => {
      const next = [...r]
      next[pos] = judgment
      return next
    })
    setFlipped(false)
    beginSlide('forward')
    if (pos + 1 >= order.length) setShowResults(true)
    else setPos((p) => p + 1)
  }

  function markWrong() {
    mark('wrong')
  }

  function markCorrect() {
    mark('correct')
  }

  function startPractice(size: number) {
    beginSession(shuffledIndices(words.length).slice(0, size))
    setSettingsOpen(false)
  }

  function handleRepeat() {
    beginSession(order)
  }

  function handleNewCards() {
    beginSession(shuffledIndices(words.length).slice(0, order.length))
  }

  function handleFlip() {
    setFlipped((f) => !f)
  }

  const current: CardSnapshot = { front, back, frontLabel, backLabel, number: pos + 1, flipped }

  return (
    <View style={styles.root}>
      <View style={{ paddingTop: insets.top }}>
        <ProgressBar current={pos} total={order.length} />
      </View>

      <View style={styles.body}>
        <View style={styles.header}>
          <ModeBar
            direction={direction}
            languageCode={language.code}
            languageName={language.name}
            onToggleDirection={toggleDirection}
          />
          <View style={styles.headerButtons}>
            <Pressable
              onPress={onChangeLanguage}
              style={styles.changeLanguageButton}
              accessibilityLabel="Back to language selection"
            >
              <BackArrowIcon color={colors.muted} />
            </Pressable>
            <SettingsButton onPress={() => setSettingsOpen(true)} />
          </View>
        </View>

        <View style={styles.stageWrap}>
          <View style={styles.cardBox}>
            <CardStage
              current={current}
              currentKey={pos}
              slideTransition={slideTransition}
              onSlideEnd={() => setSlideTransition(null)}
              onFlip={handleFlip}
              onSwipeNext={goNext}
              onSwipePrev={goPrev}
            />
          </View>
        </View>

        <View style={[styles.footer, { paddingBottom: Math.max(16, insets.bottom) }]}>
          <Controls
            onPrev={goPrev}
            onNext={goNext}
            hasPrev={hasPrev}
            hasNext={hasNext}
            onMarkWrong={markWrong}
            onMarkCorrect={markCorrect}
            wrongCount={wrongCount}
            correctCount={correctCount}
            currentMark={currentMark}
          />
        </View>
      </View>

      {settingsOpen && (
        <PracticeSettingsModal
          totalWords={words.length}
          currentSize={order.length}
          onConfirm={startPractice}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {showResults && (
        <ResultsModal
          correctCount={correctCount}
          wrongCount={wrongCount}
          onRepeat={handleRepeat}
          onNewCards={handleNewCards}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    maxWidth: 448,
    alignSelf: 'center',
    backgroundColor: colors.white,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  changeLanguageButton: {
    height: 32,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.track,
  },
  stageWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  cardBox: {
    width: '100%',
    maxWidth: 384,
    aspectRatio: 0.7,
  },
  footer: {
    paddingBottom: 16,
  },
})
