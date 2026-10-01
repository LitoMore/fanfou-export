import xoReact from 'eslint-config-xo-react';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import type {FlatXoConfig} from 'xo';

export default [
	{prettier: true},
	...xoReact({prettier: true}),
	{
		files: ['src/**/*.{ts,tsx}'],
		languageOptions: {globals: globals.browser},
	},
	{
		files: ['src/**/*.tsx'],
		...reactRefresh.configs.vite,
	},
	{
		files: ['src/utils/export-data.ts', 'src/utils/parser.ts'],
		rules: {
			// These properties are the public export schema, including snake_case and CSV's ID.
			'@typescript-eslint/naming-convention': 'off',
		},
	},
	{
		files: ['src/hooks/use-backup.ts', 'test/**/*.test.ts'],
		rules: {
			// Workers serialize their requests; retries and download mocks run in order.
			'no-await-in-loop': 'off',
		},
	},
	{
		files: ['test/**/*.test.ts'],
		rules: {
			// Each nested Node test uses its own conventional t context.
			'@typescript-eslint/no-shadow': ['error', {allow: ['t']}],
		},
	},
	{
		files: ['index.html'],
		rules: {
			'@html-eslint/require-open-graph-protocol': 'off',
			// Retain the existing theme color and web app manifest, even where unsupported.
			'@html-eslint/use-baseline': 'off',
		},
	},
	{
		files: ['package.json'],
		rules: {
			// Pin the SDK while its API is in beta.
			'package-json/dependency-version-range': [
				'error',
				{exceptions: ['fanfou-sdk']},
			],
		},
	},
] satisfies FlatXoConfig;
