import { useState } from 'react'
import { Pressable, StyleSheet, TextInput, TextInputProps, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { colors } from '../theme/colors'
import { fonts } from '../theme/typography'

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M2 12 C4.5 6.5 8 4 12 4 C16 4 19.5 6.5 22 12 C19.5 17.5 16 20 12 20 C8 20 4.5 17.5 2 12 Z"
        stroke={colors.muted}
        strokeWidth={1.8}
        fill="none"
      />
      <Path d="M12 9 A3 3 0 1 0 12 15 A3 3 0 1 0 12 9 Z" stroke={colors.muted} strokeWidth={1.8} fill="none" />
      {hidden && <Path d="M4 4 L20 20" stroke={colors.muted} strokeWidth={1.8} strokeLinecap="round" />}
    </Svg>
  )
}

export function EmailInput(props: TextInputProps) {
  return (
    <TextInput
      style={styles.input}
      placeholder="Email"
      placeholderTextColor={colors.muted}
      keyboardType="email-address"
      autoCapitalize="none"
      autoCorrect={false}
      textContentType="emailAddress"
      {...props}
    />
  )
}

export function PasswordInput(props: TextInputProps) {
  const [hidden, setHidden] = useState(true)

  return (
    <View style={styles.passwordWrap}>
      <TextInput
        style={[styles.input, styles.passwordInput]}
        placeholder="Password"
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="password"
        secureTextEntry={hidden}
        {...props}
      />
      <Pressable
        onPress={() => setHidden((h) => !h)}
        style={styles.eyeButton}
        accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
      >
        <EyeIcon hidden={hidden} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
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
  passwordWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    height: 24,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
