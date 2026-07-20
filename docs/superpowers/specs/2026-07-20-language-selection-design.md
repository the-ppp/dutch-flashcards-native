# Language Selection Screen — Design

## Context

The app currently practices exactly one language (Dutch), hardcoded end-to-end: `src/App.tsx` imports `src/data/nl.json` directly, `ModeBar.tsx` hardcodes a Dutch flag and the `'nl-en' | 'en-nl'` direction type, and the practice UI's front/back labels are the literal strings `'Dutch'`/`'English'`.

`src/data/` now also contains 7 more language files (German, Spanish, French, Italian, Polish, Portuguese, Swedish), each with the 1000 most common words and English translations. The goal: add a language-selection screen in front of the existing practice flow, letting the user pick 1 of 8 languages before entering practice mode. The practice screen itself must behave identically to today — this is purely about parameterizing which word set and labels it uses.

The project has no navigation library, no persistence library, and no existing multi-screen pattern — it's a single `useState`-driven screen with modals (`PracticeSettingsModal`, `ResultsModal`). The design below stays consistent with that minimal-dependency style rather than introducing a router.

## Data Layer

### Schema mismatch

The 7 new files share one schema:

```json
{
  "languageCode": "de",
  "languageName": "German",
  "languageNativeName": "Deutsch",
  "words": [
    { "rank": 1, "targetWord": "wie", "englishWord": "as" },
    ...
  ]
}
```

(1000 entries each, verified.) `nl.json` is still the old flat shape: `[{ "dutch": "ik", "english": "I" }, ...]` (1000 entries).

### Change

Rewrite `src/data/nl.json` into the same envelope as the other 7:

```json
{
  "languageCode": "nl",
  "languageName": "Dutch",
  "languageNativeName": "Nederlands",
  "words": [
    { "rank": 1, "targetWord": "ik", "englishWord": "I" },
    ...
  ]
}
```

Pure field rename (`dutch` → `targetWord`, `english` → `englishWord`) plus added `rank` (1-indexed position) and the 3 envelope keys. No word content is added, removed, or reordered.

### Central registry

New `src/data/languages.ts`:

```ts
export type WordEntry = { rank: number; targetWord: string; englishWord: string }
export type Language = {
  code: string
  name: string
  nativeName: string
  words: WordEntry[]
}
```

Statically imports all 8 JSON files (Metro requires literal `import`/`require` paths — no dynamic path-by-variable loading) and maps each into a `Language`. Exports:
- `LANGUAGES: Language[]` — display order: alphabetical by `name` (Dutch, French, German, Italian, Polish, Portuguese, Spanish, Swedish).
- `getLanguage(code: string): Language | undefined` — used to validate/resolve a persisted code on launch.

## Screens & Routing

No navigation library added. `App.tsx` (the root file — font loading via `useFonts`, `SplashScreen`) is untouched.

`src/App.tsx` becomes a thin router:

```ts
const [selectedLanguage, setSelectedLanguage] = useState<string | null | 'loading'>('loading')

useEffect(() => {
  AsyncStorage.getItem(STORAGE_KEY).then((code) => {
    setSelectedLanguage(code && getLanguage(code) ? code : null)
  })
}, [])
```

- `'loading'` → render nothing (brief, near-instant AsyncStorage read; no spinner needed given the sub-frame duration).
- `null` → render `LanguageSelectScreen`.
- a valid code → render `PracticeScreen` with the resolved `Language`.

The current `src/App.tsx` body (all state and JSX from `wordIndex` through the closing `</View>`, i.e. the entire existing practice implementation) is lifted verbatim into new `src/components/PracticeScreen.tsx`, taking `language: Language` and `onChangeLanguage: () => void` props. This is a mechanical extraction, not a rewrite:

- `words` (the top-level import) → `language.words`
- `card.dutch` / `card.english` → `card.targetWord` / `card.englishWord`
- `frontLabel`/`backLabel` literals `'Dutch'`/`'English'` → `language.name`/`'English'`
- `Direction` type renamed `'nl-en' | 'en-nl'` → `'target-en' | 'en-target'` (internal type name only; toggle behavior unchanged)
- Header row gains one more small button (next to `SettingsButton`) wired to `onChangeLanguage`

Everything else in the body — swipe/flip animation, results tracking, controls, modals — is untouched, so "the flashcard screen should work exactly as it already does" holds by construction.

New `src/components/LanguageSelectScreen.tsx`:

- Takes `onSelect: (code: string) => void`.
- Renders a vertical scrollable list (approved layout: one row per language, full width, flag + English name + native name — e.g. "🇩🇪-style flag / German / Deutsch"), iterating `LANGUAGES`.
- Row styling follows the existing bordered-tile convention already used elsewhere (`colors.track` border, 16px radius — see `ResultsModal`'s `repeatButton` for the precedent), with `Pressable` tap handling (no need for the `EdgeButton` 3D-press treatment used by the control-row buttons; these are simple list rows, not game-feel action buttons).
- Tapping a row calls `onSelect(code)`.

## Flags

`NlFlag` and `GbFlag` move out of `src/components/ModeBar.tsx` into a new shared `src/components/Flags.tsx`, alongside 7 new components in the same hand-drawn `react-native-svg` style (`Rect`/`Line` primitives, no image assets) — `DeFlag`, `EsFlag`, `FrFlag`, `ItFlag`, `PlFlag`, `PtFlag`, `SvFlag`. A lookup map `FLAGS: Record<string, ComponentType>` keyed by language code lets both `ModeBar` and `LanguageSelectScreen` resolve a flag generically.

`ModeBar` changes from hardcoding `direction === 'nl-en' ? <NlFlag/> : <GbFlag/>` to accepting a `languageCode: string` prop, looking up `FLAGS[languageCode]` for the target-language side, and keeping `GbFlag` fixed on the English side (English is always one end of the pair, regardless of which of the 8 target languages is active).

## Persistence

New dependency: `@react-native-async-storage/async-storage`, added via `npx expo install @react-native-async-storage/async-storage` (keeps it aligned with the Expo SDK version, same install convention as the project's other native deps).

- Single storage key (e.g. `'selectedLanguageCode'`) holding the plain language code string.
- Written only at the moment a language is picked on `LanguageSelectScreen` (`AsyncStorage.setItem` alongside `setSelectedLanguage`).
- The `onChangeLanguage` button on `PracticeScreen` only resets in-memory state (`setSelectedLanguage(null)`) to return to the picker — it does **not** clear storage. This means force-quitting from the picker screen (without re-picking) still relaunches into the previously-remembered language next time, rather than resetting to "no language." Storage is only ever overwritten by an actual pick.

## Error Handling

- Missing storage key (first launch) → `null` → picker. Expected, not an error.
- Stored code no longer resolvable via `getLanguage()` (e.g. a future data file gets removed) → treated same as missing → picker. Never crashes on a stale/invalid stored value.
- `AsyncStorage.getItem` rejecting (rare on-device storage failure) → caught, falls back to `null` → picker. Fails open, never blocks app startup.

## Out of Scope

- No per-language visual theming (colors stay the app's existing green/blue palette regardless of language).
- No search/filter on the language list (8 items, a scroll is fine).
- No mid-session language switch confirmation dialog — tapping "change language" simply abandons the current practice session (matches how the app already discards session state on any `beginSession` call, e.g. picking new practice-size cards).

## Verification

- `npx tsc --noEmit` after each phase of the change.
- Manual pass in the iOS simulator:
  - Fresh install / cleared storage → picker shown, no crash.
  - Pick each of the 8 languages in turn → correct target words on the card front, correct English on the back, correct flag + name in `ModeBar`, correct total word count (1000) in `PracticeSettingsModal`.
  - Flip, swipe, mark correct/wrong, results screen, repeat/new-cards — all behave exactly as before, for every language.
  - Tap "change language" mid-session → returns to picker; picking a (possibly different) language starts a fresh session.
  - Force-quit and relaunch → last-picked language remembered, skips picker straight into practice.
