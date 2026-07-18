import { Pressable, StyleSheet, Text } from 'react-native'
import { colors } from '../theme/colors'

type SettingsButtonProps = {
  onPress: () => void
}

export function SettingsButton({ onPress }: SettingsButtonProps) {
  return (
    <Pressable onPress={onPress} style={styles.button} accessibilityLabel="Practice settings">
      <Text style={styles.icon}>⚙️</Text>
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
  icon: {
    fontSize: 14,
  },
})
