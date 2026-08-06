import { useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '../theme/colors'
import { fonts } from '../theme/typography'
import { BackButton } from './BackButton'
import { EdgeButton } from './EdgeButton'
import { EmailInput, PasswordInput } from './AuthFields'
import { SocialSignInButtons } from './SocialSignInButtons'
import { formatAuthError, resetPassword, signInWithApple, signInWithEmail, signInWithGoogle } from '../lib/auth'

type LoginScreenProps = {
  onBack: () => void
}

export function LoginScreen({ onBack }: LoginScreenProps) {
  const insets = useSafeAreaInsets()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = email.trim().length > 0 && password.length > 0 && !submitting

  async function handleLogin() {
    if (!canSubmit) return
    setError(null)
    setSubmitting(true)
    try {
      await signInWithEmail(email.trim(), password)
    } catch (err) {
      setError(formatAuthError(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      setError('Enter your email above first.')
      return
    }
    setError(null)
    try {
      await resetPassword(email.trim())
      setResetSent(true)
    } catch (err) {
      setError(formatAuthError(err))
    }
  }

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
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 },
        ]}
      >
        <BackButton onPress={onBack} />
        <Text style={styles.heading}>Log in</Text>

        <View style={styles.fields}>
          <EmailInput value={email} onChangeText={setEmail} />
          <PasswordInput value={password} onChangeText={setPassword} />
        </View>

        {error && <Text style={styles.error}>{error}</Text>}
        {resetSent && !error && <Text style={styles.success}>Password reset email sent.</Text>}

        <EdgeButton
          onPress={handleLogin}
          disabled={!canSubmit}
          depth={4}
          edgeColor={colors.primaryDark}
          edgeRadius={16}
          pressEffect="shrink"
          style={styles.loginButton}
          faceStyle={styles.loginFace}
        >
          <Text style={styles.loginLabel}>Log in</Text>
        </EdgeButton>

        <Text style={styles.forgot} onPress={handleForgotPassword}>
          Forgot password
        </Text>

        <View style={styles.social}>
          <SocialSignInButtons onGoogle={handleGoogle} onApple={handleApple} pressEffect="shrink" />
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
    marginTop: 20,
    fontSize: 28,
    fontFamily: fonts.extraBold,
    color: colors.ink,
  },
  fields: {
    marginTop: 24,
    gap: 12,
  },
  error: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.danger,
    marginTop: 12,
  },
  success: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.primaryDark,
    marginTop: 12,
  },
  loginButton: {
    marginTop: 20,
  },
  loginFace: {
    height: 56,
    width: '100%',
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  loginLabel: {
    fontSize: 18,
    fontFamily: fonts.extraBold,
    color: colors.white,
  },
  forgot: {
    fontSize: 14,
    fontFamily: fonts.extraBold,
    color: colors.accent,
    textAlign: 'center',
    marginTop: 16,
  },
  social: {
    marginTop: 40,
  },
})
