module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier", // must be last — disables conflicting rules
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ["react", "react-hooks"],
  rules: {
    "no-unused-vars": "warn", // warn on unused variables
    "no-console": "warn", // remind you to remove console.logs
    "react/prop-types": "off", // we'll use TypeScript later for this
    "react/react-in-jsx-scope": "off", // not needed in React 17+
  },
  settings: {
    react: {
      version: "detect", // auto-detect your React version
    },
  },
};
