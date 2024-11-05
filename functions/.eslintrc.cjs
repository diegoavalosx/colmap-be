module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json", // Adjust the path if needed
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
  ],
  rules: {
    quotes: ["error", "double"],
    "object-curly-spacing": ["error", "always"],
    indent: ["error", 2],
  },
  ignorePatterns: [".eslintrc.cjs", "lib/"], // Optional: ignore the config file itself
};
