// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'eslint.config.mjs',
      'dist/**',
      'node_modules/**',
      '.git/**',
      '*.md', // Bỏ qua file Markdown
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node, // Chỉ giữ globals cho Node.js
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
      'prettier/prettier': 'error', // Bật quy tắc Prettier thành error
      '@typescript-eslint/no-explicit-any': 'off', // Giữ nguyên
      '@typescript-eslint/no-floating-promises': 'warn', // Giữ nguyên
      '@typescript-eslint/no-unsafe-argument': 'error', // Đặt thành error để bắt lỗi nghiêm ngặt
      '@typescript-eslint/no-unsafe-assignment': 'error', // Thêm để bắt lỗi không an toàn
      '@typescript-eslint/no-unnecessary-type-assertion': 'error', // Đảm bảo bắt lỗi ép kiểu không cần thiết
    },
  },
);