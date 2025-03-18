import type { OptionsFiles, OptionsOverrides, OptionsTypeScriptParserOptions, OptionsTypeScriptWithTypes, TypedFlatConfigItem } from '@antfu/eslint-config';

import { GLOB_ASTRO_TS, GLOB_MARKDOWN, GLOB_SRC, GLOB_TS, GLOB_TSX } from '@antfu/eslint-config';
import pluginReact from '@eslint-react/eslint-plugin';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReactRefresh from 'eslint-plugin-react-refresh';
import { isPackageExists } from 'local-pkg';

// react refresh
const ReactRefreshAllowConstantExportPackages = [
	'vite',
];

const NextJsPackages = [
	'next',
];

export function reactConfig(
	options: OptionsTypeScriptParserOptions & OptionsTypeScriptWithTypes & OptionsOverrides & OptionsFiles = {},
): TypedFlatConfigItem[] {
	const {
		files = [GLOB_SRC],
		filesTypeAware = [GLOB_TS, GLOB_TSX],
		ignoresTypeAware = [
			`${GLOB_MARKDOWN}/**`,
			GLOB_ASTRO_TS,
		],
		overrides = {},
		tsconfigPath,
	} = options;

	const isTypeAware = !!tsconfigPath;

	const typeAwareRules: TypedFlatConfigItem['rules'] = {
		'react/no-leaked-conditional-rendering': 'warn',
	};

	const isAllowConstantExport = ReactRefreshAllowConstantExportPackages.some((i) => isPackageExists(i));
	const isUsingNext = NextJsPackages.some((i) => isPackageExists(i));

	const plugins = pluginReact.configs.all.plugins;

	return [
		{
			name: 'antfu/react/setup',
			plugins: {
				'react': plugins['@eslint-react'],
				'react-dom': plugins['@eslint-react/dom'],
				'react-hooks': pluginReactHooks,
				'react-hooks-extra': plugins['@eslint-react/hooks-extra'],
				'react-naming-convention': plugins['@eslint-react/naming-convention'],
				'react-refresh': pluginReactRefresh,
				'react-web-api': plugins['@eslint-react/web-api'],
			},
		},
		{
			files,
			languageOptions: {
				parserOptions: {
					ecmaFeatures: {
						jsx: true,
					},
				},
				sourceType: 'module',
			},
			name: 'antfu/react/rules',
			rules: {
				// recommended rules from @eslint-react/dom
				'react-dom/no-dangerously-set-innerhtml': 'warn',
				'react-dom/no-dangerously-set-innerhtml-with-children': 'error',
				'react-dom/no-find-dom-node': 'error',
				'react-dom/no-missing-button-type': 'warn',
				'react-dom/no-missing-iframe-sandbox': 'warn',
				'react-dom/no-namespace': 'error',
				'react-dom/no-render-return-value': 'error',
				'react-dom/no-script-url': 'warn',
				'react-dom/no-unsafe-iframe-sandbox': 'warn',
				'react-dom/no-unsafe-target-blank': 'warn',
				'react-dom/no-void-elements-with-children': 'warn',

				// recommended rules from @eslint-react/hooks-extra
				'react-hooks-extra/prefer-use-state-lazy-initialization': 'warn',

				// recommended rules react-hooks
				'react-hooks/exhaustive-deps': 'warn',
				'react-hooks/rules-of-hooks': 'error',

				// react refresh
				'react-refresh/only-export-components': [
					'warn',
					{
						allowConstantExport: isAllowConstantExport,
						allowExportNames: [
							...(isUsingNext
								? [
										'dynamic',
										'dynamicParams',
										'revalidate',
										'fetchCache',
										'runtime',
										'preferredRegion',
										'maxDuration',
										'config',
										'generateStaticParams',
										'metadata',
										'generateMetadata',
										'viewport',
										'generateViewport',
									]
								: []),
						],
					},
				],
				// recommended rules from @eslint-react/web-api
				'react-web-api/no-leaked-event-listener': 'warn',
				'react-web-api/no-leaked-interval': 'warn',
				'react-web-api/no-leaked-resize-observer': 'warn',
				'react-web-api/no-leaked-timeout': 'warn',

				// recommended rules from @eslint-react
				'react/no-access-state-in-setstate': 'error',
				'react/no-array-index-key': 'warn',
				'react/no-children-count': 'warn',
				'react/no-children-for-each': 'warn',
				'react/no-children-map': 'warn',
				'react/no-children-only': 'warn',
				'react/no-children-to-array': 'warn',
				'react/no-clone-element': 'warn',
				'react/no-comment-textnodes': 'warn',
				'react/no-component-will-mount': 'error',
				'react/no-component-will-receive-props': 'error',
				'react/no-component-will-update': 'error',
				'react/no-context-provider': 'warn',
				'react/no-create-ref': 'error',
				'react/no-default-props': 'error',
				'react/no-direct-mutation-state': 'error',
				'react/no-duplicate-jsx-props': 'warn',
				'react/no-duplicate-key': 'error',
				'react/no-forward-ref': 'warn',
				'react/no-implicit-key': 'warn',
				'react/no-missing-key': 'error',
				'react/no-nested-component-definitions': 'error',
				'react/no-prop-types': 'error',
				'react/no-redundant-should-component-update': 'error',
				'react/no-set-state-in-component-did-mount': 'warn',
				'react/no-set-state-in-component-did-update': 'warn',
				'react/no-set-state-in-component-will-update': 'warn',
				'react/no-string-refs': 'error',
				'react/no-unsafe-component-will-mount': 'warn',
				'react/no-unsafe-component-will-receive-props': 'warn',
				'react/no-unsafe-component-will-update': 'warn',
				'react/no-unstable-context-value': 'warn',
				'react/no-unstable-default-props': 'warn',
				'react/no-unused-class-component-members': 'warn',
				'react/no-unused-state': 'warn',
				'react/no-useless-forward-ref': 'warn',
				'react/prefer-destructuring-assignment': 'warn',
				'react/prefer-shorthand-boolean': 'warn',
				'react/prefer-shorthand-fragment': 'warn',
				'react/use-jsx-vars': 'warn',

				// overrides
				...overrides,
			},
		},
		...isTypeAware
			? [{
					files: filesTypeAware,
					ignores: ignoresTypeAware,
					name: 'antfu/react/type-aware-rules',
					rules: {
						...typeAwareRules,
					},
				}]
			: [],
	];
}
