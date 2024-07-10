import type { ConfigNames, OptionsConfig, OptionsOverrides, Rules, TypedFlatConfigItem } from '@antfu/eslint-config';
import type { FlatConfigComposer } from 'eslint-flat-config-utils';

import { antfu } from '@antfu/eslint-config';
import { fixupPluginRules } from '@eslint/compat';
import nextPlugin from '@next/eslint-plugin-next';
import { isPackageExists } from 'local-pkg';

import { reactConfig } from './configs/react';
import { getTsConfigFromOptions, getTsConfigPaths } from './utils';

const reactPackages = [
	'react',
	'react-dom',
];

const nextPackages = [
	'next',
];

export type ConfigureOptions = OptionsConfig & {
	/**
	 * Enable next rules.
	 *
	 * @default true
	 */
	next?: boolean;
};

export default function configure(options?: ConfigureOptions & TypedFlatConfigItem, ...userConfigs: (TypedFlatConfigItem | TypedFlatConfigItem[])[]): FlatConfigComposer<TypedFlatConfigItem, ConfigNames> {
	const enableReact = reactPackages.some((i) => isPackageExists(i));
	const enableNext = nextPackages.some((i) => isPackageExists(i));
	const enableTypescript = isPackageExists('typescript');

	const {
		next = enableNext,
		plugins = {},
		react = enableReact,
		rules = {},
		stylistic = true,
		typescript = enableTypescript,
		...remainingOptions
	} = options || {
		next: enableNext,
		react: enableReact,
		stylistic: true,
		typescript: enableTypescript,
	};

	const indent = stylistic && typeof stylistic !== 'boolean'
		? typeof stylistic?.indent === 'number'
			? stylistic.indent
			: 'tab'
		: 'tab';

	const tsConfigPaths = getTsConfigPaths(typescript);

	const customStyleRules = {
		'style/arrow-parens': ['error', 'always'],
		'style/brace-style': ['error', '1tbs'],
		'style/jsx-curly-brace-presence': ['off'],
		'style/jsx-one-expression-per-line': ['warn', { allow: 'single-line' }],
	} satisfies Partial<Rules>;

	const typescriptRules = {
		'ts/consistent-type-definitions': ['off'],
		'ts/no-explicit-any': ['warn'],
	} satisfies Partial<Rules>;

	const customReactRules = {
		'react/prefer-destructuring-assignment': ['off'],
	} satisfies Partial<Rules>;

	const response = antfu({
		plugins: {
			...(next
				? {
						'@next/next': fixupPluginRules(nextPlugin),
					}
				: {}),
			...plugins,
		},
		// We custom handle this to get around the dependency mess from antfu
		react: false,
		rules: {
			...(next ? nextPlugin.configs.recommended.rules : {}),
			...(next ? nextPlugin.configs['core-web-vitals'].rules : {}),
			...(next
				? {
						'@next/next/no-img-element': 'error',
						'node/no-process-env': 'error',
						'node/prefer-global/buffer': ['error', 'always'],
						'node/prefer-global/process': 'off',
					}
				: {}),
			'perfectionist/sort-imports': ['error', {
				'groups': [
					'side-effect',
					'builtin',
					'type',
					['external'],
					['internal-type', 'internal'],
					['parent-type', 'sibling-type', 'index-type'],
					['parent', 'sibling', 'index'],
					'style',
					'object',
					'unknown',
				],
				'internal-pattern': tsConfigPaths,
				'newlines-between': 'always',
				'order': 'asc',
				'type': 'natural',
			}],
			'perfectionist/sort-jsx-props': [
				'error',
				{
					'custom-groups': {
						ids: ['key', 'id'],
					},
					'groups': ['ids', 'multiline', 'unknown', 'shorthand'],
					'order': 'asc',
					'type': 'natural',
				},
			],
			'unicorn/template-indent': ['warn', {
				indent: indent === 'tab'
					? '\t'
					: indent,
				tags: [
					'groq',
					'gql',
					'sql',
					'html',
					'styled',
				],
			}],
			...rules,
		},
		stylistic: extendOptions({ indent: 'tab', overrides: customStyleRules, quotes: 'single', semi: true }, stylistic),
		typescript: extendOptions({ overrides: typescriptRules }, typescript),
		vue: false,
		...remainingOptions,
	});

	if (react) {
		const tsconfigPath = getTsConfigFromOptions(typescript);

		response.append(reactConfig({
			overrides: customReactRules,
			tsconfigPath: tsconfigPath?.path,
		}));
	}

	return response
		.append(
			...userConfigs,
		);
}

function extendOptions<T extends OptionsOverrides>(defaultOptions: T, input: boolean | T | undefined): T | false {
	if (typeof input === 'boolean') {
		return input ? defaultOptions : false;
	}

	return {
		...defaultOptions,
		overrides: {
			...defaultOptions.overrides,
			...input?.overrides,
		},
	};
}
