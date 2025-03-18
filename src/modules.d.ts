declare module '@next/eslint-plugin-next' {
	import type { RuleDefinition } from '@eslint/core';

	type Config = {
		configs: {
			'core-web-vitals': {
				extends: [
					'plugin:@next/next/recommended',
				];
				plugins: [
					'@next/next',
				];
				rules: {
					'@next/next/no-html-link-for-pages': 'error';
					'@next/next/no-sync-scripts': 'error';
				};
			};
			'recommended': {
				plugins: [
					'@next/next',
				];
				rules: {
					// warnings
					'@next/next/google-font-display': 'warn';
					'@next/next/google-font-preconnect': 'warn';
					// errors
					'@next/next/inline-script-id': 'error';
					'@next/next/next-script-for-ga': 'warn';
					'@next/next/no-assign-module-variable': 'error';
					'@next/next/no-async-client-component': 'warn';
					'@next/next/no-before-interactive-script-outside-document': 'warn';
					'@next/next/no-css-tags': 'warn';
					'@next/next/no-document-import-in-page': 'error';
					'@next/next/no-duplicate-head': 'error';
					'@next/next/no-head-element': 'warn';
					'@next/next/no-head-import-in-document': 'error';
					'@next/next/no-html-link-for-pages': 'warn';
					'@next/next/no-img-element': 'warn';
					'@next/next/no-page-custom-font': 'warn';
					'@next/next/no-script-component-in-head': 'error';
					'@next/next/no-styled-jsx-in-document': 'warn';
					'@next/next/no-sync-scripts': 'warn';
					'@next/next/no-title-in-document-head': 'warn';
					'@next/next/no-typos': 'warn';
					'@next/next/no-unwanted-polyfillio': 'warn';
				};
			};
		};
		rules: {
			'google-font-display': RuleDefinition;
			'google-font-preconnect': RuleDefinition;
			'inline-script-id': RuleDefinition;
			'next-script-for-ga': RuleDefinition;
			'no-assign-module-variable': RuleDefinition;
			'no-async-client-component': RuleDefinition;
			'no-before-interactive-script-outside-document': RuleDefinition;
			'no-css-tags': RuleDefinition;
			'no-document-import-in-page': RuleDefinition;
			'no-duplicate-head': RuleDefinition;
			'no-head-element': RuleDefinition;
			'no-head-import-in-document': RuleDefinition;
			'no-html-link-for-pages': RuleDefinition;
			'no-img-element': RuleDefinition;
			'no-page-custom-font': RuleDefinition;
			'no-script-component-in-head': RuleDefinition;
			'no-styled-jsx-in-document': RuleDefinition;
			'no-sync-scripts': RuleDefinition;
			'no-title-in-document-head': RuleDefinition;
			'no-typos': RuleDefinition;
			'no-unwanted-polyfillio': RuleDefinition;
		};
	};

	export default {} as Config;
};
