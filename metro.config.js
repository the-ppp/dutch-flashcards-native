const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

// Firebase's package-exports layout resolves to a build that's missing the
// React Native AsyncStorage persistence under Metro's default exports
// resolution. Falling back to main/browser fields fixes it.
config.resolver.unstable_enablePackageExports = false

module.exports = config
