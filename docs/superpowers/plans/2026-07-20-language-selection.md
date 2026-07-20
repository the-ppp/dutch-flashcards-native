# Language Selection Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a language-picker screen in front of the existing single-language (Dutch) flashcard practice screen, so the user can practice any of the 8 languages now present in `src/data/`, with the practice screen behaving identically to today for whichever language is active.

**Architecture:** No navigation library — `src/App.tsx` becomes a thin `useState`-driven router (matches the project's existing zero-router, modal-based style) choosing between a new `LanguageSelectScreen` and a `PracticeScreen` extracted verbatim from the current `src/App.tsx` body. A new `src/data/languages.ts` registry normalizes all 8 language JSON files behind one shared shape; a new `src/components/Flags.tsx` centralizes the hand-drawn SVG flags (extending the existing `NlFlag`/`GbFlag` pattern) used by both the picker and the direction-toggle pill.

**Tech Stack:** React Native / Expo SDK 57, TypeScript (strict), `react-native-svg`, `@react-native-async-storage/async-storage` (new dependency, added via `npx expo install`).

## Global Constraints

- Design spec: `docs/superpowers/specs/2026-07-20-language-selection-design.md` — read it if anything below is ambiguous.
- No navigation library is introduced. Screen switching is a plain `useState` value in `src/App.tsx`.
- Root `App.tsx` (project root, not `src/App.tsx`) — font loading + `SplashScreen` — is out of scope. Do not modify it.
- `PracticeScreen` must be behaviorally identical to the current practice flow for every language — this plan achieves that by lifting the existing implementation unchanged and only parameterizing the data source and labels, never rewriting logic.
- Target JSON schema (all 8 files, after Task 1): `{ languageCode: string, languageName: string, languageNativeName: string, words: { rank: number, targetWord: string, englishWord: string }[] }`.
- No test framework exists in this repo (no `jest`, no `"test"` script in `package.json`) — `npx tsc --noEmit` is the automated correctness gate for every task. Do not add a test framework; it's out of scope for this feature.
- New dependency is limited to `@react-native-async-storage/async-storage`, installed with `npx expo install` (keeps it pinned to the Expo SDK 57–compatible version, matching how every other native dependency in this project was added).
- Out of scope (do not build): per-language visual theming, search/filter on the language list, a confirmation dialog before abandoning an in-progress session when changing language.
- Every task must leave the app in a working, `tsc`-clean state runnable in the iOS simulator — this plan is ordered as an incremental migration for exactly that reason. Do not reorder tasks.

---

### Task 1: Normalize `nl.json` schema

**Files:**
- Modify: `src/data/nl.json`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces: `src/data/nl.json` now has the shape `{ languageCode: "nl", languageName: "Dutch", languageNativeName: "Nederlands", words: [{ rank, targetWord, englishWord }, ...] }` (1000 entries) — this is the shape every other language file (`de.json`, `es.json`, `fr.json`, `it.json`, `pl.json`, `pt.json`, `sv.json`) already has. Task 4's `languages.ts` depends on this.

- [ ] **Step 1: Transform the file**

Run from the project root:

```bash
python3 -c "
import json

with open('src/data/nl.json', encoding='utf-8') as f:
    old = json.load(f)

words = [
    {'rank': i + 1, 'targetWord': entry['dutch'], 'englishWord': entry['english']}
    for i, entry in enumerate(old)
]

new = {
    'languageCode': 'nl',
    'languageName': 'Dutch',
    'languageNativeName': 'Nederlands',
    'words': words,
}

with open('src/data/nl.json', 'w', encoding='utf-8') as f:
    json.dump(new, f, ensure_ascii=False, indent=2)
    f.write('\n')

assert len(words) == 1000, f'expected 1000 words, got {len(words)}'
print('OK', len(words))
"
```

Expected output: `OK 1000`

- [ ] **Step 2: Verify the transform**

```bash
python3 -c "
import json
d = json.load(open('src/data/nl.json'))
print(sorted(d.keys()))
print(len(d['words']))
print(d['words'][0])
print(d['words'][-1])
"
```

Expected output:
```
['languageCode', 'languageName', 'languageNativeName', 'words']
1000
{'rank': 1, 'targetWord': 'ik', 'englishWord': 'I'}
{'rank': 1000, 'targetWord': 'wit', 'englishWord': 'white'}
```

- [ ] **Step 3: Patch `src/App.tsx` to read the new shape**

`src/App.tsx` currently imports the raw array as `words` and reads `.dutch`/`.english`. Make these 3 edits:

Replace:
```ts
import words from './data/nl.json'
```
with:
```ts
import nlData from './data/nl.json'
```

Replace:
```ts
import { ResultsModal } from './components/ResultsModal'

type Direction = 'nl-en' | 'en-nl'
```
with:
```ts
import { ResultsModal } from './components/ResultsModal'

const words = nlData.words

type Direction = 'nl-en' | 'en-nl'
```

Replace:
```ts
  const front = direction === 'nl-en' ? card.dutch : card.english
  const back = direction === 'nl-en' ? card.english : card.dutch
```
with:
```ts
  const front = direction === 'nl-en' ? card.targetWord : card.englishWord
  const back = direction === 'nl-en' ? card.englishWord : card.targetWord
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```
Expected: no output (success).

- [ ] **Step 5: Manual smoke check**

Launch the app in the iOS simulator (use the `run` skill, or `npx expo run:ios --device <udid>` as used earlier in this project). Confirm the card front/back still show Dutch/English words exactly as before — this task changes only the data shape, not behavior.

- [ ] **Step 6: Commit**

```bash
git add src/data/nl.json src/App.tsx
git commit -m "feat: normalize nl.json to shared language-file schema"
```

---

### Task 2: Extract shared `Flags.tsx`

**Files:**
- Create: `src/components/Flags.tsx`
- Modify: `src/components/ModeBar.tsx` (only to remove now-duplicated flag code is deferred to Task 3 — this task only adds the new file; `ModeBar.tsx` is untouched here)

**Interfaces:**
- Produces: `FLAG_WIDTH`, `FLAG_HEIGHT` (numbers), `NlFlag`, `GbFlag`, `DeFlag`, `EsFlag`, `FrFlag`, `ItFlag`, `PlFlag`, `PtFlag`, `SvFlag` (zero-prop components), and `FLAGS: Record<string, ComponentType>` keyed by language code (`"nl" | "de" | "es" | "fr" | "it" | "pl" | "pt" | "sv"`). Consumed by Task 3 (`ModeBar.tsx`) and Task 6 (`LanguageSelectScreen.tsx`).

- [ ] **Step 1: Create the file**

```tsx
import { ComponentType } from 'react'
import Svg, { Line, Rect } from 'react-native-svg'

export const FLAG_WIDTH = 20
export const FLAG_HEIGHT = 14

export function NlFlag() {
  return (
    <Svg width={FLAG_WIDTH} height={FLAG_HEIGHT} viewBox="0 0 30 20">
      <Rect x={0} y={0} width={30} height={20} rx={2} fill="#ffffff" />
      <Rect x={0} y={0} width={30} height={6.67} fill="#ae1c28" />
      <Rect x={0} y={13.33} width={30} height={6.67} fill="#21468b" />
    </Svg>
  )
}

export function GbFlag() {
  return (
    <Svg width={FLAG_WIDTH} height={FLAG_HEIGHT} viewBox="0 0 30 20">
      <Rect x={0} y={0} width={30} height={20} rx={2} fill="#00247d" />
      <Line x1={0} y1={0} x2={30} y2={20} stroke="#ffffff" strokeWidth={4} />
      <Line x1={30} y1={0} x2={0} y2={20} stroke="#ffffff" strokeWidth={4} />
      <Line x1={0} y1={0} x2={30} y2={20} stroke="#cf142b" strokeWidth={1.6} />
      <Line x1={30} y1={0} x2={0} y2={20} stroke="#cf142b" strokeWidth={1.6} />
      <Rect x={0} y={7} width={30} height={6} fill="#ffffff" />
      <Rect x={12} y={0} width={6} height={20} fill="#ffffff" />
      <Rect x={0} y={8.5} width={30} height={3} fill="#cf142b" />
      <Rect x={13.5} y={0} width={3} height={20} fill="#cf142b" />
    </Svg>
  )
}

export function DeFlag() {
  return (
    <Svg width={FLAG_WIDTH} height={FLAG_HEIGHT} viewBox="0 0 30 20">
      <Rect x={0} y={0} width={30} height={20} rx={2} fill="#ffce00" />
      <Rect x={0} y={0} width={30} height={6.67} fill="#000000" />
      <Rect x={0} y={6.67} width={30} height={6.67} fill="#dd0000" />
    </Svg>
  )
}

export function EsFlag() {
  return (
    <Svg width={FLAG_WIDTH} height={FLAG_HEIGHT} viewBox="0 0 30 20">
      <Rect x={0} y={0} width={30} height={20} rx={2} fill="#aa151b" />
      <Rect x={0} y={5} width={30} height={10} fill="#f1bf00" />
    </Svg>
  )
}

export function FrFlag() {
  return (
    <Svg width={FLAG_WIDTH} height={FLAG_HEIGHT} viewBox="0 0 30 20">
      <Rect x={0} y={0} width={30} height={20} rx={2} fill="#ffffff" />
      <Rect x={0} y={0} width={10} height={20} fill="#0055a4" />
      <Rect x={20} y={0} width={10} height={20} fill="#ef4135" />
    </Svg>
  )
}

export function ItFlag() {
  return (
    <Svg width={FLAG_WIDTH} height={FLAG_HEIGHT} viewBox="0 0 30 20">
      <Rect x={0} y={0} width={30} height={20} rx={2} fill="#ffffff" />
      <Rect x={0} y={0} width={10} height={20} fill="#008c45" />
      <Rect x={20} y={0} width={10} height={20} fill="#cd212a" />
    </Svg>
  )
}

export function PlFlag() {
  return (
    <Svg width={FLAG_WIDTH} height={FLAG_HEIGHT} viewBox="0 0 30 20">
      <Rect x={0} y={0} width={30} height={20} rx={2} fill="#ffffff" />
      <Rect x={0} y={10} width={30} height={10} fill="#dc143c" />
    </Svg>
  )
}

export function PtFlag() {
  return (
    <Svg width={FLAG_WIDTH} height={FLAG_HEIGHT} viewBox="0 0 30 20">
      <Rect x={0} y={0} width={30} height={20} rx={2} fill="#da291c" />
      <Rect x={0} y={0} width={12} height={20} fill="#046a38" />
    </Svg>
  )
}

export function SvFlag() {
  return (
    <Svg width={FLAG_WIDTH} height={FLAG_HEIGHT} viewBox="0 0 30 20">
      <Rect x={0} y={0} width={30} height={20} rx={2} fill="#006aa7" />
      <Rect x={10} y={0} width={4} height={20} fill="#fecc02" />
      <Rect x={0} y={8} width={30} height={4} fill="#fecc02" />
    </Svg>
  )
}

export const FLAGS: Record<string, ComponentType> = {
  nl: NlFlag,
  de: DeFlag,
  es: EsFlag,
  fr: FrFlag,
  it: ItFlag,
  pl: PlFlag,
  pt: PtFlag,
  sv: SvFlag,
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: no output. (This is a new, unused-so-far file — nothing else imports it yet, so this only validates the file's own correctness.)

- [ ] **Step 3: Commit**

```bash
git add src/components/Flags.tsx
git commit -m "feat: add shared flag SVG components for all 8 practice languages"
```

---

### Task 3: Generalize `ModeBar.tsx`

**Files:**
- Modify: `src/components/ModeBar.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `FLAGS`, `GbFlag` from `./Flags` (Task 2).
- Produces: `export type Direction = 'target-en' | 'en-target'` and `ModeBar` now takes `{ direction: Direction; languageCode: string; languageName: string; onToggleDirection: () => void }`. Consumed by Task 5 (`PracticeScreen.tsx` imports `Direction` from here instead of redeclaring it) and this task's own `App.tsx` update.

- [ ] **Step 1: Replace `src/components/ModeBar.tsx` entirely**

```tsx
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme/colors'
import { fonts } from '../theme/typography'
import { FLAGS, GbFlag } from './Flags'

export type Direction = 'target-en' | 'en-target'

type ModeBarProps = {
  direction: Direction
  languageCode: string
  languageName: string
  onToggleDirection: () => void
}

export function ModeBar({ direction, languageCode, languageName, onToggleDirection }: ModeBarProps) {
  const TargetFlag = FLAGS[languageCode]
  const label =
    direction === 'target-en'
      ? `Switch to English to ${languageName}`
      : `Switch to ${languageName} to English`

  return (
    <Pressable onPress={onToggleDirection} style={styles.pill} accessibilityLabel={label}>
      <View accessible={false} style={styles.row}>
        {direction === 'target-en' ? <TargetFlag /> : <GbFlag />}
        <Text style={styles.arrow}>→</Text>
        {direction === 'target-en' ? <GbFlag /> : <TargetFlag />}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  pill: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 16,
    backgroundColor: colors.track,
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  arrow: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.muted,
  },
})
```

- [ ] **Step 2: Update `src/App.tsx`'s consumer of `ModeBar` and its own `Direction` type**

Replace:
```ts
type Direction = 'nl-en' | 'en-nl'
```
with:
```ts
type Direction = 'target-en' | 'en-target'
```

Replace:
```ts
  const [direction, setDirection] = useState<Direction>('nl-en')
```
with:
```ts
  const [direction, setDirection] = useState<Direction>('target-en')
```

Replace:
```ts
  const front = direction === 'nl-en' ? card.targetWord : card.englishWord
  const back = direction === 'nl-en' ? card.englishWord : card.targetWord
  const frontLabel = direction === 'nl-en' ? 'Dutch' : 'English'
  const backLabel = direction === 'nl-en' ? 'English' : 'Dutch'
```
with:
```ts
  const front = direction === 'target-en' ? card.targetWord : card.englishWord
  const back = direction === 'target-en' ? card.englishWord : card.targetWord
  const frontLabel = direction === 'target-en' ? 'Dutch' : 'English'
  const backLabel = direction === 'target-en' ? 'English' : 'Dutch'
```

Replace:
```ts
  function toggleDirection() {
    setDirection((d) => (d === 'nl-en' ? 'en-nl' : 'nl-en'))
    setFlipped(false)
  }
```
with:
```ts
  function toggleDirection() {
    setDirection((d) => (d === 'target-en' ? 'en-target' : 'target-en'))
    setFlipped(false)
  }
```

Replace:
```tsx
          <ModeBar direction={direction} onToggleDirection={toggleDirection} />
```
with:
```tsx
          <ModeBar
            direction={direction}
            languageCode="nl"
            languageName="Dutch"
            onToggleDirection={toggleDirection}
          />
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```
Expected: no output.

- [ ] **Step 4: Manual smoke check**

Launch in the simulator. Confirm the top pill still shows NL flag → GB flag (or reversed after tapping), and tapping it still toggles direction exactly as before.

- [ ] **Step 5: Commit**

```bash
git add src/components/ModeBar.tsx src/App.tsx
git commit -m "feat: generalize ModeBar to accept any language code/name"
```

---

### Task 4: Create the language registry and wire it in

**Files:**
- Create: `src/data/languages.ts`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: all 8 JSON files in `src/data/` (`nl.json` normalized by Task 1; the other 7 already match the target shape).
- Produces:
  ```ts
  export type WordEntry = { rank: number; targetWord: string; englishWord: string }
  export type Language = { code: string; name: string; nativeName: string; words: WordEntry[] }
  export const LANGUAGES: Language[]
  export function getLanguage(code: string): Language | undefined
  ```
  Consumed by Task 5 (`PracticeScreen.tsx`), Task 6 (`LanguageSelectScreen.tsx`), and Task 7 (`App.tsx` router).

- [ ] **Step 1: Create `src/data/languages.ts`**

```ts
import nl from './nl.json'
import de from './de.json'
import es from './es.json'
import fr from './fr.json'
import it from './it.json'
import pl from './pl.json'
import pt from './pt.json'
import sv from './sv.json'

export type WordEntry = {
  rank: number
  targetWord: string
  englishWord: string
}

export type Language = {
  code: string
  name: string
  nativeName: string
  words: WordEntry[]
}

type RawLanguageFile = {
  languageCode: string
  languageName: string
  languageNativeName: string
  words: WordEntry[]
}

function toLanguage(raw: RawLanguageFile): Language {
  return {
    code: raw.languageCode,
    name: raw.languageName,
    nativeName: raw.languageNativeName,
    words: raw.words,
  }
}

const RAW_FILES: RawLanguageFile[] = [nl, de, es, fr, it, pl, pt, sv]

export const LANGUAGES: Language[] = RAW_FILES.map(toLanguage).sort((a, b) => a.name.localeCompare(b.name))

export function getLanguage(code: string): Language | undefined {
  return LANGUAGES.find((language) => language.code === code)
}
```

- [ ] **Step 2: Verify the registry order and shape**

```bash
npx tsc --noEmit
```
Expected: no output.

Then check the runtime data directly (Metro isn't running a script host, so verify via `node` against the raw JSON files, mirroring exactly what `languages.ts` does):

```bash
node -e "
const files = ['nl','de','es','fr','it','pl','pt','sv'].map(c => require('./src/data/' + c + '.json'));
const names = files.map(f => f.languageName).sort((a,b) => a.localeCompare(b));
console.log(names);
console.log(files.every(f => f.words.length === 1000));
"
```

Expected output:
```
[ 'Dutch', 'French', 'German', 'Italian', 'Polish', 'Portuguese', 'Spanish', 'Swedish' ]
true
```

- [ ] **Step 3: Wire `src/App.tsx` to use the registry instead of the raw `nl.json` import**

Replace:
```ts
import nlData from './data/nl.json'
```
with:
```ts
import { getLanguage } from './data/languages'
```

Replace:
```ts
const words = nlData.words
```
with:
```ts
const language = getLanguage('nl')!
const words = language.words
```

Replace:
```tsx
          <ModeBar
            direction={direction}
            languageCode="nl"
            languageName="Dutch"
            onToggleDirection={toggleDirection}
          />
```
with:
```tsx
          <ModeBar
            direction={direction}
            languageCode={language.code}
            languageName={language.name}
            onToggleDirection={toggleDirection}
          />
```

Replace:
```ts
  const frontLabel = direction === 'target-en' ? 'Dutch' : 'English'
  const backLabel = direction === 'target-en' ? 'English' : 'Dutch'
```
with:
```ts
  const frontLabel = direction === 'target-en' ? language.name : 'English'
  const backLabel = direction === 'target-en' ? 'English' : language.name
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```
Expected: no output.

- [ ] **Step 5: Manual smoke check**

Launch in the simulator. App should behave exactly as before (still only Dutch, no picker yet) — this task only changes where the data comes from, not what's shown.

- [ ] **Step 6: Commit**

```bash
git add src/data/languages.ts src/App.tsx
git commit -m "feat: add language registry and wire App.tsx to use it"
```

---

### Task 5: Extract `PracticeScreen.tsx`

**Files:**
- Create: `src/components/PracticeScreen.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `Language` from `../data/languages` (Task 4); `ModeBar`, `Direction` from `./ModeBar` (Task 3); `FLAGS` from `./Flags` (Task 2); `shuffledIndices` from `../lib/shuffledIndices`; `CardStage`, `CardSnapshot`, `SlideTransition` from `./CardStage`; `ProgressBar`, `SettingsButton`, `Controls`, `PracticeSettingsModal`, `ResultsModal` (all unchanged, existing).
- Produces: `export function PracticeScreen({ language, onChangeLanguage }: { language: Language; onChangeLanguage: () => void })`. Consumed by Task 7's `App.tsx` router (this task's own `App.tsx` stub is temporary and gets replaced wholesale in Task 7).

- [ ] **Step 1: Create `src/components/PracticeScreen.tsx`**

This is the current `src/App.tsx` body, lifted unchanged except: `words` now comes from a `language` prop, card field access is already `targetWord`/`englishWord` (from Task 1), labels use `language.name` (from Task 4), and a new header button (rendering the current language's flag) calls `onChangeLanguage`.

```tsx
import { useRef, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
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
import { FLAGS } from './Flags'

type Judgment = 'correct' | 'wrong'

type PracticeScreenProps = {
  language: Language
  onChangeLanguage: () => void
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
  const ChangeLanguageFlag = FLAGS[language.code]

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
              accessibilityLabel="Change language"
            >
              <ChangeLanguageFlag />
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
```

- [ ] **Step 2: Replace `src/App.tsx` with a temporary stub that renders it**

This stub is intentionally minimal — it still hardcodes Dutch and has a no-op change-language button. Task 7 replaces this file entirely with the real router.

```tsx
import { getLanguage } from './data/languages'
import { PracticeScreen } from './components/PracticeScreen'

export default function App() {
  const language = getLanguage('nl')!
  return <PracticeScreen language={language} onChangeLanguage={() => {}} />
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```
Expected: no output.

- [ ] **Step 4: Manual smoke check**

Launch in the simulator. App should behave exactly as before. The new change-language icon (showing the Dutch flag) appears next to the settings gear but does nothing when tapped yet — that's expected and gets fixed in Task 7.

- [ ] **Step 5: Commit**

```bash
git add src/components/PracticeScreen.tsx src/App.tsx
git commit -m "refactor: extract PracticeScreen from App.tsx"
```

---

### Task 6: Create `LanguageSelectScreen.tsx`

**Files:**
- Create: `src/components/LanguageSelectScreen.tsx`

**Interfaces:**
- Consumes: `LANGUAGES` from `../data/languages` (Task 4); `FLAGS` from `./Flags` (Task 2).
- Produces: `export function LanguageSelectScreen({ onSelect }: { onSelect: (code: string) => void })`. Consumed by Task 7's `App.tsx` router.

- [ ] **Step 1: Create the file**

Layout is the approved vertical scrollable list: one bordered row per language (flag, English name, native name), tapping a row calls `onSelect`.

```tsx
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LANGUAGES } from '../data/languages'
import { colors } from '../theme/colors'
import { fonts } from '../theme/typography'
import { FLAGS } from './Flags'

type LanguageSelectScreenProps = {
  onSelect: (code: string) => void
}

export function LanguageSelectScreen({ onSelect }: LanguageSelectScreenProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}
      >
        <Text style={styles.heading}>Choose a language</Text>
        <Text style={styles.subheading}>1000 most common words, translated to English</Text>

        <View style={styles.list}>
          {LANGUAGES.map((language) => {
            const Flag = FLAGS[language.code]
            return (
              <Pressable
                key={language.code}
                onPress={() => onSelect(language.code)}
                style={styles.row}
                accessibilityLabel={`Practice ${language.name}`}
              >
                <Flag />
                <View style={styles.rowText}>
                  <Text style={styles.rowName}>{language.name}</Text>
                  <Text style={styles.rowNative}>{language.nativeName}</Text>
                </View>
              </Pressable>
            )
          })}
        </View>
      </ScrollView>
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
  content: {
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 24,
    fontFamily: fonts.extraBold,
    color: colors.ink,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 4,
  },
  list: {
    marginTop: 24,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 2,
    borderColor: colors.track,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowText: {
    flex: 1,
  },
  rowName: {
    fontSize: 16,
    fontFamily: fonts.extraBold,
    color: colors.ink,
  },
  rowNative: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.muted,
    marginTop: 2,
  },
})
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: no output. (Unused so far — nothing imports this file until Task 7.)

- [ ] **Step 3: Commit**

```bash
git add src/components/LanguageSelectScreen.tsx
git commit -m "feat: add LanguageSelectScreen"
```

---

### Task 7: Install AsyncStorage and finish the router

**Files:**
- Modify: `package.json` (via `npx expo install`)
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `getLanguage` from `./data/languages` (Task 4); `LanguageSelectScreen` from `./components/LanguageSelectScreen` (Task 6); `PracticeScreen` from `./components/PracticeScreen` (Task 5).
- Produces: the final `src/App.tsx` — no further tasks depend on it.

- [ ] **Step 1: Install the dependency**

```bash
npx expo install @react-native-async-storage/async-storage
```

Expected: command exits 0; `package.json` now lists `@react-native-async-storage/async-storage` under `"dependencies"`.

- [ ] **Step 2: Replace `src/App.tsx` with the full router**

```tsx
import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getLanguage } from './data/languages'
import { colors } from './theme/colors'
import { LanguageSelectScreen } from './components/LanguageSelectScreen'
import { PracticeScreen } from './components/PracticeScreen'

const STORAGE_KEY = 'selectedLanguageCode'

export default function App() {
  const [selectedCode, setSelectedCode] = useState<string | null | 'loading'>('loading')

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((code) => {
        setSelectedCode(code && getLanguage(code) ? code : null)
      })
      .catch(() => {
        setSelectedCode(null)
      })
  }, [])

  function selectLanguage(code: string) {
    AsyncStorage.setItem(STORAGE_KEY, code)
    setSelectedCode(code)
  }

  function changeLanguage() {
    setSelectedCode(null)
  }

  if (selectedCode === 'loading') {
    return <View style={styles.root} />
  }

  if (selectedCode === null) {
    return <LanguageSelectScreen onSelect={selectLanguage} />
  }

  const language = getLanguage(selectedCode)
  if (!language) {
    return <LanguageSelectScreen onSelect={selectLanguage} />
  }

  return <PracticeScreen language={language} onChangeLanguage={changeLanguage} />
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
})
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/App.tsx
git commit -m "feat: wire up language picker with AsyncStorage persistence"
```

---

### Task 8: Full manual verification

**Files:** none (verification only, no commit)

- [ ] **Step 1: Type-check the whole project one more time**

```bash
npx tsc --noEmit
```
Expected: no output.

- [ ] **Step 2: Fresh-state check**

Clear the app's storage (uninstall/reinstall in the simulator, or `xcrun simctl` equivalent), launch it. Expected: `LanguageSelectScreen` appears — 8 rows, alphabetically Dutch/French/German/Italian/Polish/Portuguese/Spanish/Swedish, each with a flag, English name, and native name.

- [ ] **Step 3: Per-language pass**

For each of the 8 languages: tap its row, and confirm:
- Card front shows a word in that language, back shows the English translation (and vice versa after tapping the direction pill).
- `ModeBar` shows that language's flag on one side and the GB flag on the other, and the accessibility label / toggle behavior is correct.
- `PracticeSettingsModal` (gear icon) shows "1000" as the max word count.
- Flip (tap card), swipe next/prev, mark correct/wrong, and the results screen at the end all behave exactly as they did for Dutch before this feature existed.

- [ ] **Step 4: Change-language flow**

Mid-session, tap the flag button next to the settings gear. Expected: returns to `LanguageSelectScreen`. Pick a different language: starts a fresh practice session for it (previous session's progress is discarded, matching existing `beginSession` behavior for "new cards").

- [ ] **Step 5: Persistence**

Force-quit the app and relaunch. Expected: skips the picker, opens directly into `PracticeScreen` for whichever language was picked last.
