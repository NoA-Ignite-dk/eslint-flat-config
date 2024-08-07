import styleMigrate from '@stylistic/eslint-plugin-migrate';
import JITI from 'jiti';

const jiti = JITI(import.meta.url);

/**
 * @type {import('./src').default}
 */
const configure = jiti('./src').default;

export default configure(
	{
		typescript: true,
		react: false,
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
