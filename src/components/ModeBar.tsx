import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme/colors'
import { fonts } from '../theme/typography'
import { FLAGS, GbFlag } from './Flags'

export type Direction = 'target-en' | 'en-target'

type ModeBarProps = {
  direction: Direction
  languageCode: string
  languageName: string
  onToggleDirection: () => void
}

export function ModeBar({ direction, languageCode, languageName, onToggleDirection }: ModeBarProps) {
  const TargetFlag = FLAGS[languageCode]
  const label =
    direction === 'target-en'
      ? `Switch to English to ${languageName}`
      : `Switch to ${languageName} to English`

  return (
    <Pressable onPress={onToggleDirection} style={styles.pill} accessibilityLabel={label}>
      <View accessible={false} style={styles.row}>
        {direction === 'target-en' ? <TargetFlag /> : <GbFlag />}
        <Text style={styles.arrow}>→</Text>
        {direction === 'target-en' ? <GbFlag /> : <TargetFlag />}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  pill: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 16,
    backgroundColor: colors.track,
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  arrow: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.muted,
  },
})
