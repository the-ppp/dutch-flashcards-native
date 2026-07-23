import { Pressable, StyleSheet } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { colors } from '../theme/colors'

type SettingsButtonProps = {
  onPress: () => void
}

function GearIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Circle
        cx={12}
        cy={12}
        r={9}
        stroke={colors.muted}
        strokeWidth={3}
        strokeDasharray="2.2 2.2"
        fill="none"
      />
      <Circle cx={12} cy={12} r={4} stroke={colors.muted} strokeWidth={2} fill="none" />
    </Svg>
  )
}

export function SettingsButton({ onPress }: SettingsButtonProps) {
  return (
    <Pressable onPress={onPress} style={styles.button} accessibilityLabel="Practice settings">
      <GearIcon />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    height: 32,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.track,
  },
})
