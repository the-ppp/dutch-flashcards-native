import { useEffect, useState } from 'react'
import { Platform, StyleSheet, Text, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import * as AppleAuthentication from 'expo-apple-authentication'
import { colors } from '../theme/colors'
import { fonts } from '../theme/typography'
import { EdgeButton } from './EdgeButton'

type SocialSignInButtonsProps = {
  onGoogle: () => void
  onApple: () => void
  pressEffect?: 'edge' | 'shrink'
}

function GoogleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18">
      <Path
        fill="#4285F4"
        d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z"
      />
      <Path
        fill="#34A853"
        d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.8591-3.0477.8591-2.3441 0-4.3282-1.5831-5.036-3.7104H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z"
      />
      <Path
        fill="#FBBC05"
        d="M3.964 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2822-1.71V4.9582H.9573C.3477 6.1732 0 7.5477 0 9s.3477 2.8268.9573 4.0418L3.964 10.71z"
      />
      <Path
        fill="#EA4335"
        d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5814-2.5814C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795z"
      />
    </Svg>
  )
}

function AppleIcon() {
  return (
    <Svg width={17} height={22} viewBox="0 0 384 512">
      <Path
        fill={colors.white}
        d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"
      />
    </Svg>
  )
}

export function SocialSignInButtons({ onGoogle, onApple, pressEffect = 'edge' }: SocialSignInButtonsProps) {
  const [appleAvailable, setAppleAvailable] = useState(false)

  useEffect(() => {
    if (Platform.OS !== 'ios') return
    AppleAuthentication.isAvailableAsync().then(setAppleAvailable)
  }, [])

  return (
    <View style={styles.stack}>
      <EdgeButton
        onPress={onGoogle}
        depth={4}
        edgeColor={colors.accentDark}
        edgeRadius={24}
        pressEffect={pressEffect}
        style={styles.button}
        faceStyle={[styles.face, { backgroundColor: colors.accent }]}
      >
        <View style={styles.iconCircle}>
          <GoogleIcon />
        </View>
        <Text style={styles.label}>Continue with Google</Text>
      </EdgeButton>

      {appleAvailable && (
        <EdgeButton
          onPress={onApple}
          depth={4}
          edgeColor={colors.black}
          edgeRadius={24}
          pressEffect={pressEffect}
          style={styles.button}
          faceStyle={[styles.face, { backgroundColor: colors.black }]}
        >
          <AppleIcon />
          <Text style={styles.label}>Continue with Apple</Text>
        </EdgeButton>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
    width: '100%',
  },
  button: {
    width: '100%',
  },
  face: {
    height: 48,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 24,
  },
  iconCircle: {
    height: 24,
    width: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontFamily: fonts.extraBold,
    color: colors.white,
  },
})
