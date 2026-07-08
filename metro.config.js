const { getDefaultConfig } = require("expo/metro-config");
const { withSentryConfig } = require("@sentry/react-native/metro");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
const nativeWindConfig = withNativeWind(config, { input: "./global.css" });
const isNativeEasBuild = ["android", "ios"].includes(
  process.env.EAS_BUILD_PLATFORM ?? "",
);

// Sentry's serializer currently conflicts with NativeWind during Expo web exports.
// Native EAS builds still receive debug IDs and automatic source-map uploads.
module.exports = isNativeEasBuild
  ? withSentryConfig(nativeWindConfig)
  : nativeWindConfig;
