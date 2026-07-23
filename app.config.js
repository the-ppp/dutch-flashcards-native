module.exports = ({ config }) => ({
  ...config,
  ios: {
    ...config.ios,
    googleServicesFile: process.env.GOOGLE_SERVICES_INFO_PLIST ?? config.ios.googleServicesFile,
  },
})
