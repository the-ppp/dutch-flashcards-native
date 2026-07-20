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
