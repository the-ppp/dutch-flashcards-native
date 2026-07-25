import { Pressable, StyleSheet, Text, View } from 'react-native'
import Svg, { Line, Rect } from 'react-native-svg'
import { colors } from '../theme/colors'
import { fonts } from '../theme/typography'

type Direction = 'nl-en' | 'en-nl'

type ModeBarProps = {
  direction: Direction
  onToggleDirection: () => void
}

const FLAG_WIDTH = 20
const FLAG_HEIGHT = 14

function NlFlag() {
  return (
    <Svg width={FLAG_WIDTH} height={FLAG_HEIGHT} viewBox="0 0 30 20">
      <Rect x={0} y={0} width={30} height={20} rx={2} fill="#ffffff" />
      <Rect x={0} y={0} width={30} height={6.67} fill="#ae1c28" />
      <Rect x={0} y={13.33} width={30} height={6.67} fill="#21468b" />
    </Svg>
  )
}

function GbFlag() {
  return (
    <Svg width={FLAG_WIDTH} height={FLAG_HEIGHT} viewBox="0 0 30 20">
      <Rect x={0} y={0} width={30} height={20} rx={2} fill="#00247d" />
      <Line x1={0} y1={0} x2={30} y2={20} stroke="#ffffff" strokeWidth={4} />
      <Line x1={30} y1={0} x2={0} y2={20} stroke="#ffffff" strokeWidth={4} />
      <Line x1={0} y1={0} x2={30} y2={20} stroke="#cf142b" strokeWidth={1.6} />
      <Line x1={30} y1={0} x2={0} y2={20} stroke="#cf142b" strokeWidth={1.6} />
      <Rect x={0} y={7} width={30} height={6} fill="#ffffff" />
      <Rect x={12} y={0} width={6} height={20} fill="#ffffff" />
      <Rect x={0} y={8.5} width={30} height={3} fill="#cf142b" />
      <Rect x={13.5} y={0} width={3} height={20} fill="#cf142b" />
    </Svg>
  )
}

export function ModeBar({ direction, onToggleDirection }: ModeBarProps) {
  const label =
    direction === 'nl-en'
      ? 'Switch to English to Dutch'
      : 'Switch to Dutch to English'

  return (
    <Pressable onPress={onToggleDirection} style={styles.pill} accessibilityLabel={label}>
      <View accessible={false} style={styles.row}>
        {direction === 'nl-en' ? <NlFlag /> : <GbFlag />}
        <Text style={styles.arrow}>→</Text>
        {direction === 'nl-en' ? <GbFlag /> : <NlFlag />}
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
