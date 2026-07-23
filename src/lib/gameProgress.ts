import AsyncStorage from '@react-native-async-storage/async-storage'

export type Judgment = 'correct' | 'wrong'

export type GameProgress = {
  order: number[]
  results: (Judgment | null)[]
}

const KEY_PREFIX = 'gameProgress:'
const keyFor = (code: string) => `${KEY_PREFIX}${code}`

export function isValidGameProgress(progress: GameProgress, wordCount: number): boolean {
  return (
    progress.order.length > 0 &&
    progress.order.length === progress.results.length &&
    progress.order.every((index) => index >= 0 && index < wordCount)
  )
}

export async function loadAllGameProgress(codes: string[]): Promise<Record<string, GameProgress>> {
  try {
    const pairs = await AsyncStorage.multiGet(codes.map(keyFor))
    const result: Record<string, GameProgress> = {}
    for (const [key, raw] of pairs) {
      if (!raw) continue
      try {
        result[key.slice(KEY_PREFIX.length)] = JSON.parse(raw) as GameProgress
      } catch {
        continue
      }
    }
    return result
  } catch {
    return {}
  }
}

export function saveGameProgress(code: string, progress: GameProgress) {
  AsyncStorage.setItem(keyFor(code), JSON.stringify(progress)).catch(() => {})
}

export function clearGameProgress(code: string) {
  AsyncStorage.removeItem(keyFor(code)).catch(() => {})
}
