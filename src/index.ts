import type { ConfigNames, OptionsConfig, OptionsOverrides, OptionsTypescript, Rules, TypedFlatConfigItem } from '@antfu/eslint-config';
import type { FlatConfigComposer } from 'eslint-flat-config-utils';

import { antfu, resolveSubOptions } from '@antfu/eslint-config';
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

export default async function configure(options: ConfigureOptions & TypedFlatConfigItem = {}, ...userConfigs: (TypedFlatConfigItem | TypedFlatConfigItem[])[]): Promise<FlatConfigComposer<TypedFlatConfigItem, ConfigNames>> {
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
	} = options;

	const typescriptOptions = resolveSubOptions(options, 'typescript');

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
		'import/consistent-type-specifier-style': ['off'],
		'ts/consistent-type-definitions': ['off'],
		'ts/consistent-type-imports': ['error', {
			disallowTypeAnnotations: false,
			fixStyle: 'inline-type-imports',
			prefer: 'type-imports',
		}],
		'ts/no-explicit-any': ['warn'],
	} satisfies Partial<Rules>;

	const typescriptTypeawareRules = {
		'ts/strict-boolean-expressions': ['off'],
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
				groups: [
					'side-effect',
					'builtin',
					'type',
					['external'],
					['internal-type', 'internal'],
					['parent-type', 'parent'],
					['sibling-type', 'sibling', 'index-type', 'index'],
					'style',
					'object',
					'unknown',
				],
				internalPattern: tsConfigPaths,
				newlinesBetween: 'always',
				order: 'asc',
				type: 'natural',
			}],
			'perfectionist/sort-jsx-props': [
				'error',
				{
					customGroups: {
						ids: ['^key$', '^id$'],
					},
					groups: ['ids', 'multiline', 'unknown', 'shorthand'],
					order: 'asc',
					type: 'natural',
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
		typescript: extendOptions<OptionsTypescript>({ ...typescriptOptions, overrides: typescriptRules, overridesTypeAware: typescriptTypeawareRules }, typescript),
		vue: false,
		...remainingOptions,
	});

	if (react) {
		const tsconfigPath = getTsConfigFromOptions(typescript);

		const reactConfigOptions = reactConfig({
			...typescriptOptions,
			overrides: customReactRules,
			tsconfigPath: tsconfigPath?.path,
		});

		await response.append(reactConfigOptions);
	}

	return response
		.append(
			...userConfigs,
		);
}

function extendOptions<T extends OptionsOverrides | OptionsTypescript>(defaultOptions: T, input: boolean | OptionsOverrides | T | undefined): T | false {
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
