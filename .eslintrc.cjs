module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
    overrides: [
        {
            env: {
                node: true,
            },
            files: [".{eslintrc,prettierrc}.{cjs,js}"],
            parserOptions: {
                sourceType: "script",
            },
        },
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
            jsx: true,
        },
    },
    plugins: ["@typescript-eslint", "import"],
    rules: {
        // allow unused variables
        "@typescript-eslint/no-unused-vars": "off",
        // allow explicit any
        "@typescript-eslint/no-explicit-any": "off",
        // allow unsafe declaration merging
        "@typescript-eslint/no-unsafe-declaration-merging": "off",
        "no-constant-condition": "off",
        "linebreak-style": ["error", "unix"],
        // double quotes unless necessary
        quotes: ["error", "double", { avoidEscape: true }],
        semi: ["error", "always"],
        // use commas for multiline
        "comma-dangle": ["error", "always-multiline"],
        // don't quote object keys unless necessary
        "quote-props": ["error", "as-needed"],
        // require file extensions
        "import/extensions": "off",
        "@typescript-eslint/no-namespace": "off",
        "no-var": "off",
        "@typescript-eslint/no-misused-new": "off",
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/no-this-alias": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/no-var-requires": "off",
    },
    globals: {
        htmx: "readonly",
    },
    ignorePatterns: ["node_modules/", "public/"],
};
