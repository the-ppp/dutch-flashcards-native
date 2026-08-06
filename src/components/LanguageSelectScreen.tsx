import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LANGUAGES } from '../data/languages'
import { GameProgress } from '../lib/gameProgress'
import { colors } from '../theme/colors'
import { fonts } from '../theme/typography'
import { FLAGS } from './Flags'

type LanguageSelectScreenProps = {
  onSelect: (code: string) => void
  onLogOut: () => void
  onOpenFeedback: () => void
  gameProgress: Record<string, GameProgress>
}

export function LanguageSelectScreen({ onSelect, onLogOut, onOpenFeedback, gameProgress }: LanguageSelectScreenProps) {
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
        <Text style={styles.subheading}>Learn the 1000 most common words of any language</Text>

        <View style={styles.list}>
          {LANGUAGES.map((language) => {
            const Flag = FLAGS[language.code]
            const progress = gameProgress[language.code]
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
                {progress && (
                  <View style={styles.continueBox}>
                    <Text style={styles.continueLabel}>Continue &gt;</Text>
                    <Text style={styles.continueFraction}>
                      {progress.results.filter((r) => r !== null).length}/{progress.order.length}
                    </Text>
                  </View>
                )}
              </Pressable>
            )
          })}
        </View>

        <Pressable onPress={onOpenFeedback} style={styles.feedbackLink} accessibilityLabel="Support & Feedback">
          <Text style={styles.footerLinkLabel}>Support & Feedback</Text>
        </Pressable>

        <Pressable onPress={onLogOut} style={styles.logOut} accessibilityLabel="Log out">
          <Text style={styles.logOutLabel}>Log out</Text>
        </Pressable>
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
  feedbackLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  logOut: {
    marginTop: 12,
    alignItems: 'center',
  },
  footerLinkLabel: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.muted,
  },
  logOutLabel: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.danger,
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
  continueBox: {
    alignItems: 'flex-end',
  },
  continueLabel: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.accent,
  },
  continueFraction: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.muted,
    marginTop: 2,
  },
})
