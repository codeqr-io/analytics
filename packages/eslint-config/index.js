module.exports = {
  root: true,
  extends: [
    require.resolve('@vercel/style-guide/eslint/browser'),
    require.resolve('@vercel/style-guide/eslint/react'),
    require.resolve('@vercel/style-guide/eslint/typescript'),
    require.resolve('@vercel/style-guide/eslint/jest'),
  ],
  env: {
    jest: true,
  },
  rules: {
    'jest/no-deprecated-functions': 'off',

    // The published package falls back on an empty string on purpose. In
    // packages/web/src/generic.ts, `props.scriptProps?.src || <cdn url>` has to
    // treat `src: ''` as "not provided": `??` would accept it, and
    // `<script src="">` re-fetches the current page as a script while the
    // `src*=""` guard next to it would match every script on the page.
    //
    // `ignorePrimitives.string` is the option the rule ships for exactly this,
    // and it belongs here rather than as an inline disable -- tsup does not
    // strip comments, so a justification written in src/ is shipped to every
    // consumer of @codeqr/analytics.
    '@typescript-eslint/prefer-nullish-coalescing': [
      'error',
      { ignorePrimitives: { string: true } },
    ],
  },
  parserOptions: {
    project: './tsconfig.json',
  },
  ignorePatterns: ['*.config.js', 'dist/'],
};
