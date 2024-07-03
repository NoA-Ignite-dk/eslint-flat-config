import path from 'node:path';

import type { OptionsTypeScriptParserOptions, OptionsTypeScriptWithTypes } from '@antfu/eslint-config';
import type { TsConfigResult } from 'get-tsconfig';

import { getTsconfig } from 'get-tsconfig';

export function getTsConfigFromOptions(typescriptOptions: boolean | OptionsTypeScriptWithTypes | OptionsTypeScriptParserOptions): TsConfigResult | null {
	if (!typescriptOptions) {
		return null;
	}

	if (typeof typescriptOptions === 'boolean') {
		return getTsconfig();
	} else if (typeof typescriptOptions === 'object' && ('tsconfigPath' in typescriptOptions) && typescriptOptions?.tsconfigPath) {
		const tsconfigPath = typescriptOptions.tsconfigPath;
		if (Array.isArray(tsconfigPath)) {
			const tsPath = path.parse(tsconfigPath[0]);
			return getTsconfig(tsconfigPath[0], tsPath.name + tsPath.ext);
		} else {
			const tsPath = path.parse(tsconfigPath);
			return getTsconfig(tsconfigPath, tsPath.name + tsPath.ext);
		}
	}

	return null;
}

export function getTsConfigPaths(typescriptOptions: boolean | OptionsTypeScriptWithTypes | OptionsTypeScriptParserOptions): string[] {
	const tsconfig: TsConfigResult | null = getTsConfigFromOptions(typescriptOptions);

	if (tsconfig && tsconfig.config.compilerOptions?.paths) {
		return Object.keys(tsconfig.config.compilerOptions.paths)
			.map((i) => i.replace('/*', '/**'));
	}

	return [];
}
