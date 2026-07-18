import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme/colors'
import { fonts } from '../theme/typography'

type Direction = 'nl-en' | 'en-nl'

type ModeBarProps = {
  direction: Direction
  onToggleDirection: () => void
}

export function ModeBar({ direction, onToggleDirection }: ModeBarProps) {
  const label =
    direction === 'nl-en'
      ? 'Switch to English to Dutch'
      : 'Switch to Dutch to English'

  return (
    <Pressable onPress={onToggleDirection} style={styles.pill} accessibilityLabel={label}>
      <View accessible={false} style={styles.row}>
        <Text style={styles.flag}>{direction === 'nl-en' ? '🇳🇱' : '🇬🇧'}</Text>
        <Text style={styles.arrow}>→</Text>
        <Text style={styles.flag}>{direction === 'nl-en' ? '🇬🇧' : '🇳🇱'}</Text>
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
  flag: {
    fontSize: 14,
  },
  arrow: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.muted,
  },
})
