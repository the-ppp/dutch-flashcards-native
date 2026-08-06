import { useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '../theme/colors'
import { fonts } from '../theme/typography'
import { BackButton } from './BackButton'
import { EdgeButton } from './EdgeButton'
import { EmailInput, PasswordInput } from './AuthFields'
import { SocialSignInButtons } from './SocialSignInButtons'
import { formatAuthError, signInWithApple, signInWithGoogle, signUpWithEmail } from '../lib/auth'

type SignUpScreenProps = {
  onBack: () => void
}

export function SignUpScreen({ onBack }: SignUpScreenProps) {
  const insets = useSafeAreaInsets()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = email.trim().length > 0 && password.length > 0 && !submitting

  async function handleSignUp() {
    if (!canSubmit) return
    setError(null)
    setSubmitting(true)
    try {
      await signUpWithEmail(email.trim(), password)
    } catch (err) {
      setError(formatAuthError(err))
    } finally {
      setSubmitting(false)
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
        <Text style={styles.heading}>Sign up</Text>

        <View style={styles.fields}>
          <EmailInput value={email} onChangeText={setEmail} />
          <PasswordInput value={password} onChangeText={setPassword} />
        </View>
        <Text style={styles.hint}>Use at least 6 characters.</Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <EdgeButton
          onPress={handleSignUp}
          disabled={!canSubmit}
          depth={4}
          edgeColor={colors.primaryDark}
          edgeRadius={16}
          pressEffect="shrink"
          style={styles.submitButton}
          faceStyle={styles.submitFace}
        >
          <Text style={styles.submitLabel}>Sign up</Text>
        </EdgeButton>

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
  hint: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.muted,
    marginTop: 8,
  },
  error: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.danger,
    marginTop: 12,
  },
  submitButton: {
    marginTop: 20,
  },
  submitFace: {
    height: 56,
    width: '100%',
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  submitLabel: {
    fontSize: 18,
    fontFamily: fonts.extraBold,
    color: colors.white,
  },
  social: {
    marginTop: 40,
  },
})
