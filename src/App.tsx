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
