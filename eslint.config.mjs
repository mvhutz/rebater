// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylistic,
  reactHooks.configs['recommended-latest'],
  {
    rules: {
      "@typescript-eslint/strict-boolean-expressions": "error",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: { attributes: false } }],
      "@typescript-eslint/no-invalid-void-type": ["error", { allowAsThisParameter: true }]
    }
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        // @ts-expect-error: febwegrewgwr
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);