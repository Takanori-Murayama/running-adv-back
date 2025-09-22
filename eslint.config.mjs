// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      "no-unused-vars": "off", // TypeScript版を使用するため無効化
      "@typescript-eslint/no-unused-vars": [
        "error",
        { 
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "destructuredArrayIgnorePattern": "^_",
          // TypeScriptのコンストラクタパラメータプロパティを考慮
          "ignoreRestSiblings": true,
          // パラメータプロパティ（constructor parameter properties）を正しく処理
          "args": "after-used",
          // クラスのコンストラクタでDIされたプロパティを無視しない
          "caughtErrors": "none"
        }
      ],
      // TypeScriptのパラメータプロパティを強制的に許可
      "@typescript-eslint/parameter-properties": "off"
    },
  },
);