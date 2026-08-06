import { getAnalytics, logLogin, logScreenView, logSignUp } from '@react-native-firebase/analytics'

export function trackScreenView(screenName: string) {
  return logScreenView(getAnalytics(), { screen_name: screenName, screen_class: screenName })
}

export function trackLogin(method: string) {
  return logLogin(getAnalytics(), { method })
}

export function trackSignUp(method: string) {
  return logSignUp(getAnalytics(), { method })
}
