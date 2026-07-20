import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LANGUAGES } from '../data/languages'
import { colors } from '../theme/colors'
import { fonts } from '../theme/typography'
import { FLAGS } from './Flags'

type LanguageSelectScreenProps = {
  onSelect: (code: string) => void
}

export function LanguageSelectScreen({ onSelect }: LanguageSelectScreenProps) {
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
        <Text style={styles.subheading}>1000 most common words, translated to English</Text>

        <View style={styles.list}>
          {LANGUAGES.map((language) => {
            const Flag = FLAGS[language.code]
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
              </Pressable>
            )
          })}
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
})
