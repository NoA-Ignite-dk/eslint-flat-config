import styleMigrate from '@stylistic/eslint-plugin-migrate';

import configure from './src';

export default configure(
	{
		react: true,
		typescript: {
			tsconfigPath: './tsconfig.json',
		},
		formatters: true,
		next: true,
		type: 'lib',
	},
	{
		ignores: [
			'fixtures',
			'_fixtures',
		],
	},
	{
		files: ['src/**/*.ts'],
		rules: {
			'perfectionist/sort-objects': 'error',
		},
	},
	{
		files: ['src/configs/*.ts'],
		plugins: {
			'style-migrate': styleMigrate,
		},
		rules: {
			'style-migrate/migrate': ['error', { namespaceTo: 'style' }],
		},
	},
);
