import { useState } from 'react'
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '../theme/colors'
import { fonts } from '../theme/typography'
import { EdgeButton } from './EdgeButton'
import { SocialSignInButtons } from './SocialSignInButtons'
import { formatAuthError, signInWithApple, signInWithGoogle } from '../lib/auth'

const TERMS_URL = 'https://applingoflip.com/terms'
const PRIVACY_URL = 'https://applingoflip.com/privacy'

type WelcomeScreenProps = {
  onNavigateToLogin: () => void
  onNavigateToSignUp: () => void
}

export function WelcomeScreen({ onNavigateToLogin, onNavigateToSignUp }: WelcomeScreenProps) {
  const insets = useSafeAreaInsets()
  const [error, setError] = useState<string | null>(null)

  async function handleGoogle() {
    setError(null)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(formatAuthError(err))
    }
  }

  async function handleApple() {
    setError(null)
    try {
      await signInWithApple()
    } catch (err) {
      setError(formatAuthError(err))
    }
  }

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}
      >
        <View style={styles.hero}>
          <Image source={require('../../assets/icon.png')} style={styles.heroImage} />
        </View>

        <Text style={styles.heading}>Learn any language.{'\n'}Sign up for free.</Text>
        <Text style={styles.subheading}>
          By signing up, you accept our{' '}
          <Text style={styles.subheadingLink} onPress={() => Linking.openURL(TERMS_URL)}>
            Terms of Service
          </Text>{' '}
          and{' '}
          <Text style={styles.subheadingLink} onPress={() => Linking.openURL(PRIVACY_URL)}>
            Privacy Policy
          </Text>
        </Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.buttons}>
          <SocialSignInButtons onGoogle={handleGoogle} onApple={handleApple} pressEffect="shrink" />

          <EdgeButton
            onPress={onNavigateToSignUp}
            depth={3}
            edgeColor={colors.track}
            edgeRadius={16}
            pressEffect="shrink"
            style={styles.emailButton}
            faceStyle={styles.emailFace}
          >
            <Text style={styles.emailLabel}>Sign up with email</Text>
          </EdgeButton>
        </View>

        <View style={styles.loginRow}>
          <Text style={styles.loginPrompt}>Have an account? </Text>
          <Pressable onPress={onNavigateToLogin}>
            <Text style={styles.loginLink}>Log in</Text>
          </Pressable>
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
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    height: 180,
    width: 180,
  },
  heading: {
    marginTop: 12,
    fontSize: 24,
    fontFamily: fonts.extraBold,
    color: colors.ink,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 12,
  },
  subheadingLink: {
    color: colors.accent,
    textDecorationLine: 'underline',
  },
  error: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.danger,
    textAlign: 'center',
    marginTop: 16,
  },
  buttons: {
    marginTop: 28,
    width: '100%',
    gap: 12,
  },
  emailButton: {
    width: '100%',
  },
  emailFace: {
    height: 48,
    width: '100%',
    borderRadius: 16,
    backgroundColor: colors.track,
  },
  emailLabel: {
    fontSize: 16,
    fontFamily: fonts.extraBold,
    color: colors.ink,
  },
  loginRow: {
    flexDirection: 'row',
    marginTop: 24,
  },
  loginPrompt: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.ink,
  },
  loginLink: {
    fontSize: 14,
    fontFamily: fonts.extraBold,
    color: colors.accent,
  },
})
