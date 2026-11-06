module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel" // This MUST be inside presets, not plugins
    ],
    // Remove the plugins array entirely unless you are using react-native-reanimated
  };
};