import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Circle, Path } from 'react-native-svg'
import { colors } from '../theme/colors'
import { fonts } from '../theme/typography'
import { BackButton } from './BackButton'
import { EdgeButton } from './EdgeButton'
import { FeedbackCategory, sendFeedback } from '../lib/feedback'

type FeedbackScreenProps = {
  onBack: () => void
}

const MESSAGE_MIN = 10
const MESSAGE_MAX = 5000

function GeneralIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path d="M4 5 H20 V16 H9 L5 20 V16 H4 Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" fill="none" />
    </Svg>
  )
}

function BugIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path d="M8 7 L10 4 M16 7 L14 4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path
        d="M7 10 C7 7.24 9.24 5 12 5 C14.76 5 17 7.24 17 10 V15 C17 17.76 14.76 20 12 20 C9.24 20 7 17.76 7 15 Z"
        stroke={color}
        strokeWidth={1.8}
        fill="none"
      />
      <Path d="M4 11 H7 M4 15 H7 M17 11 H20 M17 15 H20" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  )
}

function FeatureIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path d="M9 18 H15 M10 21 H14" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path
        d="M12 3 C8.5 3 6 5.5 6 9 C6 11.5 7.5 12.8 8.5 14 C9.2 14.8 9.5 15.3 9.5 16 H14.5 C14.5 15.3 14.8 14.8 15.5 14 C16.5 12.8 18 11.5 18 9 C18 5.5 15.5 3 12 3 Z"
        stroke={color}
        strokeWidth={1.8}
        fill="none"
      />
    </Svg>
  )
}

function OtherIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path d="M4 5 H20 V16 H9 L5 20 V16 H4 Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" fill="none" />
      <Circle cx={9} cy={10.5} r={1} fill={color} />
      <Circle cx={12} cy={10.5} r={1} fill={color} />
      <Circle cx={15} cy={10.5} r={1} fill={color} />
    </Svg>
  )
}

function SendIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path d="M3 11 L21 3 L13 21 L11 13 L3 11 Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" fill="none" />
    </Svg>
  )
}

const CATEGORIES: { key: FeedbackCategory; label: string; Icon: typeof GeneralIcon }[] = [
  { key: 'general', label: 'General feedback', Icon: GeneralIcon },
  { key: 'bug', label: 'Report a bug', Icon: BugIcon },
  { key: 'feature', label: 'Feature request', Icon: FeatureIcon },
  { key: 'other', label: 'Other', Icon: OtherIcon },
]

export function FeedbackScreen({ onBack }: FeedbackScreenProps) {
  const insets = useSafeAreaInsets()
  const [email, setEmail] = useState('')
  const [category, setCategory] = useState<FeedbackCategory>('general')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const canSubmit = email.trim().length > 0 && message.trim().length >= MESSAGE_MIN && !submitting

  async function handleSubmit() {
    if (!canSubmit) return
    setError(null)
    setSent(false)
    setSubmitting(true)
    try {
      await sendFeedback({ email: email.trim(), category, message: message.trim() })
      setSent(true)
      setMessage('')
    } catch {
      setError("Couldn't send feedback. Please try again.")
    } finally {
      setSubmitting(false)
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
        <View style={styles.header}>
          <BackButton onPress={onBack} />
          <Text style={styles.heading}>Support & Feedback</Text>
        </View>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="your@email.com"
          placeholderTextColor={colors.muted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryRow}>
          {CATEGORIES.map(({ key, label, Icon }) => {
            const selected = category === key
            return (
              <Pressable
                key={key}
                onPress={() => setCategory(key)}
                style={[styles.categoryPill, selected && styles.categoryPillSelected]}
              >
                <Icon color={selected ? colors.white : colors.ink} />
                <Text style={[styles.categoryLabel, selected && styles.categoryLabelSelected]}>{label}</Text>
              </Pressable>
            )
          })}
        </View>

        <Text style={styles.label}>Message</Text>
        <TextInput
          style={[styles.input, styles.messageInput]}
          placeholder="Describe the issue, request, or feedback."
          placeholderTextColor={colors.muted}
          multiline
          textAlignVertical="top"
          maxLength={MESSAGE_MAX}
          value={message}
          onChangeText={setMessage}
        />
        <View style={styles.messageFooter}>
          <Text style={styles.helper}>Minimum {MESSAGE_MIN} characters</Text>
          <Text style={styles.helper}>{MESSAGE_MAX - message.length} left</Text>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}
        {sent && !error && <Text style={styles.success}>Thanks! Your feedback has been sent.</Text>}

        <EdgeButton
          onPress={handleSubmit}
          disabled={!canSubmit}
          depth={4}
          edgeColor={colors.primaryDark}
          edgeRadius={16}
          style={styles.submitButton}
          faceStyle={styles.submitFace}
        >
          <SendIcon color={colors.white} />
          <Text style={styles.submitLabel}>Send feedback</Text>
        </EdgeButton>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heading: {
    fontSize: 22,
    fontFamily: fonts.extraBold,
    color: colors.ink,
  },
  label: {
    fontSize: 12,
    fontFamily: fonts.extraBold,
    color: colors.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 24,
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.track,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.ink,
  },
  messageInput: {
    minHeight: 140,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  helper: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.muted,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: colors.track,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
  },
  categoryPillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryLabel: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  categoryLabelSelected: {
    color: colors.white,
  },
  error: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.danger,
    marginTop: 16,
  },
  success: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.primaryDark,
    marginTop: 16,
  },
  submitButton: {
    marginTop: 24,
  },
  submitFace: {
    height: 56,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  submitLabel: {
    fontSize: 18,
    fontFamily: fonts.extraBold,
    color: colors.white,
  },
})
