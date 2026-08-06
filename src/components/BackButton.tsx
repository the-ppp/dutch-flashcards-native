import { Pressable, StyleSheet } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { colors } from '../theme/colors'

type BackButtonProps = {
  onPress: () => void
}

export function BackButton({ onPress }: BackButtonProps) {
  return (
    <Pressable onPress={onPress} style={styles.button} accessibilityLabel="Go back">
      <Svg width={18} height={18} viewBox="0 0 24 24">
        <Path d="M15 5 L8 12 L15 19" stroke={colors.muted} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </Svg>
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
