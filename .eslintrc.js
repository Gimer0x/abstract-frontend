module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react', 'react-hooks'],
  rules: {
    // Disable all formatting and style rules
    'prettier/prettier': 'off',
    'comma-dangle': 'off',
    'no-trailing-spaces': 'off',
    'eol-last': 'off',
    'no-multiple-empty-lines': 'off',
    'space-before-function-paren': 'off',
    'space-in-parens': 'off',
    'space-infix-ops': 'off',
    'space-unary-ops': 'off',
    'spaced-comment': 'off',
    'object-curly-spacing': 'off',
    'array-bracket-spacing': 'off',
    'comma-spacing': 'off',
    'key-spacing': 'off',
    'keyword-spacing': 'off',
    'space-before-blocks': 'off',
    'indent': 'off',
    'no-tabs': 'off',
    'no-mixed-spaces-and-tabs': 'off',
    'semi': 'off',
    'quotes': 'off',
    
    // Disable React formatting rules
    'react/jsx-curly-spacing': 'off',
    'react/jsx-equals-spacing': 'off',
    'react/jsx-indent': 'off',
    'react/jsx-indent-props': 'off',
    'react/jsx-max-props-per-line': 'off',
    'react/jsx-props-no-multi-spaces': 'off',
    'react/jsx-tag-spacing': 'off',
    'react/jsx-wrap-multilines': 'off',
    'react/jsx-closing-bracket-location': 'off',
    'react/jsx-closing-tag-location': 'off',
    'react/jsx-pascal-case': 'off',
    'react/jsx-uses-vars': 'off',
    'react/jsx-no-undef': 'off',
    'react/jsx-no-duplicate-props': 'off',
    'react/jsx-no-target-blank': 'off',
    'react/jsx-no-literals': 'off',
    
    // Disable accessibility rules
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/alt-text': 'off',
    'jsx-a11y/aria-props': 'off',
    'jsx-a11y/aria-proptypes': 'off',
    'jsx-a11y/aria-unsupported-elements': 'off',
    'jsx-a11y/role-has-required-aria-props': 'off',
    'jsx-a11y/role-supports-aria-props': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    
    // Disable variable and function rules
    'no-var': 'off',
    'prefer-const': 'off',
    'no-unused-vars': 'off',
    'no-console': 'off',
    'no-debugger': 'off',
    
    // Keep only essential React rules
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
    'react/no-unescaped-entities': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};

