import { useEffect, useRef, useState } from 'react'
import { StyleSheet, View, useWindowDimensions } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LANGUAGES, getLanguage } from './data/languages'
import { GameProgress, isValidGameProgress, loadAllGameProgress } from './lib/gameProgress'
import { colors } from './theme/colors'
import { useAuth } from './hooks/useAuth'
import { signOut } from './lib/auth'
import { trackScreenView } from './lib/analytics'
import { WelcomeScreen } from './components/WelcomeScreen'
import { LoginScreen } from './components/LoginScreen'
import { SignUpScreen } from './components/SignUpScreen'
import { LanguageSelectScreen } from './components/LanguageSelectScreen'
import { PracticeScreen } from './components/PracticeScreen'
import { FeedbackScreen } from './components/FeedbackScreen'
import { SlideLayer } from './components/SlideLayer'

const STORAGE_KEY = 'selectedLanguageCode'

export default function App() {
  const auth = useAuth()
  const [selectedCode, setSelectedCode] = useState<string | null | 'loading'>('loading')
  const [gameProgress, setGameProgress] = useState<Record<string, GameProgress> | 'loading'>('loading')
  const [transitioning, setTransitioning] = useState<'entering' | 'exiting' | null>(null)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackTransitioning, setFeedbackTransitioning] = useState<'entering' | 'exiting' | null>(null)
  const [authScreen, setAuthScreen] = useState<'welcome' | 'login' | 'signup'>('welcome')
  const [authTransitioning, setAuthTransitioning] = useState<'entering' | 'exiting' | null>(null)
  const [entering, setEntering] = useState(false)
  const prevAuthStatusRef = useRef(auth.status)
  const initialScreenTrackedRef = useRef(false)
  const { width } = useWindowDimensions()

  // Adjust `entering` synchronously during render (not in an effect) so the very
  // render where auth.status flips already reflects it — avoids a one-frame flash
  // of the unanimated app before the slide-in overlay appears.
  if (prevAuthStatusRef.current !== auth.status) {
    const prevStatus = prevAuthStatusRef.current
    prevAuthStatusRef.current = auth.status
    if (auth.status === 'signedIn' && prevStatus === 'signedOut') {
      setEntering(true)
    } else if (auth.status !== 'signedIn') {
      setEntering(false)
    }
  }

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((code) => {
        setSelectedCode(code && getLanguage(code) ? code : null)
      })
      .catch(() => {
        setSelectedCode(null)
      })
  }, [])

  useEffect(() => {
    refreshGameProgress()
  }, [])

  useEffect(() => {
    if (auth.status === 'signedIn') {
      setAuthScreen('welcome')
      setAuthTransitioning(null)
    }
  }, [auth.status])

  useEffect(() => {
    if (initialScreenTrackedRef.current) return
    if (auth.status === 'loading' || selectedCode === 'loading' || gameProgress === 'loading') return
    initialScreenTrackedRef.current = true
    if (auth.status !== 'signedIn') {
      trackScreenView('Welcome')
    } else if (selectedCode && getLanguage(selectedCode)) {
      trackScreenView('Practice')
    } else {
      trackScreenView('LanguageSelect')
    }
  }, [auth.status, selectedCode, gameProgress])

  async function refreshGameProgress() {
    const raw = await loadAllGameProgress(LANGUAGES.map((language) => language.code))
    const sanitized: Record<string, GameProgress> = {}
    for (const language of LANGUAGES) {
      const progress = raw[language.code]
      if (progress && isValidGameProgress(progress, language.words.length)) {
        sanitized[language.code] = progress
      }
    }
    setGameProgress(sanitized)
  }

  function updateGameProgress(code: string, progress: GameProgress | null) {
    setGameProgress((prev) => {
      if (prev === 'loading') return prev
      const next = { ...prev }
      if (progress) next[code] = progress
      else delete next[code]
      return next
    })
  }

  function selectLanguage(code: string) {
    AsyncStorage.setItem(STORAGE_KEY, code)
    setSelectedCode(code)
    setTransitioning('entering')
    trackScreenView('Practice')
  }

  function changeLanguage() {
    setTransitioning('exiting')
  }

  function finishExit() {
    setSelectedCode(null)
    setTransitioning(null)
    trackScreenView('LanguageSelect')
  }

  function openFeedback() {
    setFeedbackOpen(true)
    setFeedbackTransitioning('entering')
    trackScreenView('Feedback')
  }

  function closeFeedback() {
    setFeedbackTransitioning('exiting')
  }

  function finishFeedbackExit() {
    setFeedbackOpen(false)
    setFeedbackTransitioning(null)
    trackScreenView('LanguageSelect')
  }

  function openLogin() {
    setAuthScreen('login')
    setAuthTransitioning('entering')
    trackScreenView('Login')
  }

  function openSignUp() {
    setAuthScreen('signup')
    setAuthTransitioning('entering')
    trackScreenView('SignUp')
  }

  function closeAuthOverlay() {
    setAuthTransitioning('exiting')
  }

  function finishAuthExit() {
    setAuthScreen('welcome')
    setAuthTransitioning(null)
  }

  function logOut() {
    signOut()
    setSelectedCode(null)
    setTransitioning(null)
  }

  if (auth.status === 'loading' || selectedCode === 'loading' || gameProgress === 'loading') {
    return <View style={styles.root} />
  }

  const language = selectedCode ? getLanguage(selectedCode) : undefined
  const resume = language ? gameProgress[language.code] : undefined

  const appTree = (
    <View style={styles.root}>
      <LanguageSelectScreen
        onSelect={selectLanguage}
        onLogOut={logOut}
        onOpenFeedback={openFeedback}
        gameProgress={gameProgress}
      />
      {language && (
        <SlideLayer
          key={transitioning === 'exiting' ? `exit-${selectedCode}` : `enter-${selectedCode}`}
          from={transitioning === 'entering' ? width : 0}
          to={transitioning === 'exiting' ? width : 0}
          onSettled={transitioning === 'exiting' ? finishExit : undefined}
          interactive={transitioning !== 'exiting'}
        >
          <PracticeScreen
            language={language}
            onChangeLanguage={changeLanguage}
            resume={resume}
            onProgressChange={(progress) => updateGameProgress(language.code, progress)}
          />
        </SlideLayer>
      )}
      {feedbackOpen && (
        <SlideLayer
          key={feedbackTransitioning === 'exiting' ? 'exit-feedback' : 'enter-feedback'}
          from={feedbackTransitioning === 'entering' ? width : 0}
          to={feedbackTransitioning === 'exiting' ? width : 0}
          onSettled={feedbackTransitioning === 'exiting' ? finishFeedbackExit : undefined}
          interactive={feedbackTransitioning !== 'exiting'}
        >
          <FeedbackScreen onBack={closeFeedback} />
        </SlideLayer>
      )}
    </View>
  )

  if (auth.status === 'signedIn' && !entering) {
    return appTree
  }

  return (
    <View style={styles.root}>
      <View style={styles.root} pointerEvents={entering ? 'none' : 'auto'}>
        <WelcomeScreen onNavigateToLogin={openLogin} onNavigateToSignUp={openSignUp} />
        {authScreen !== 'welcome' && (
          <SlideLayer
            key={authTransitioning === 'exiting' ? `exit-${authScreen}` : `enter-${authScreen}`}
            from={authTransitioning === 'entering' ? width : 0}
            to={authTransitioning === 'exiting' ? width : 0}
            onSettled={authTransitioning === 'exiting' ? finishAuthExit : undefined}
            interactive={authTransitioning !== 'exiting'}
          >
            {authScreen === 'login' ? (
              <LoginScreen onBack={closeAuthOverlay} />
            ) : (
              <SignUpScreen onBack={closeAuthOverlay} />
            )}
          </SlideLayer>
        )}
      </View>
      {entering && (
        <SlideLayer key="app-enter" from={width} to={0} onSettled={() => setEntering(false)} interactive>
          {appTree}
        </SlideLayer>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
})
