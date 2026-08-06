import { Pressable, StyleSheet } from 'react-native'
import Svg, { Path, Rect } from 'react-native-svg'
import { colors } from '../theme/colors'

type SettingsButtonProps = {
  onPress: () => void
}

const TEETH = [0, 45, 90, 135, 180, 225, 270, 315]

// Teeth overlap the body so the silhouette fuses; the body path uses evenodd to knock the hub
// out to transparent, letting the chip background show through.
function GearIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      {TEETH.map((angle) => (
        <Rect
          key={angle}
          x={10.2}
          y={1}
          width={3.6}
          height={4.8}
          rx={1.4}
          fill={colors.muted}
          transform={`rotate(${angle}, 12, 12)`}
        />
      ))}
      <Path
        d="M4.5 12A7.5 7.5 0 1 0 19.5 12A7.5 7.5 0 1 0 4.5 12ZM8.9 12A3.1 3.1 0 1 1 15.1 12A3.1 3.1 0 1 1 8.9 12Z"
        fill={colors.muted}
        fillRule="evenodd"
      />
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
