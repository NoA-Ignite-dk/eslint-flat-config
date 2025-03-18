import fs from 'node:fs/promises';
import { join, resolve } from 'node:path';

import type { OptionsConfig, TypedFlatConfigItem } from '@antfu/eslint-config';

import { execa } from 'execa';
import { glob } from 'tinyglobby';
import { afterAll, beforeAll, it } from 'vitest';

beforeAll(async () => {
	await fs.rm('_fixtures', { recursive: true, force: true });
});
afterAll(async () => {
	await fs.rm('_fixtures', { recursive: true, force: true });
});

runWithConfig('js', {
	typescript: false,
	react: false,
	jsx: false,
});
runWithConfig('all', {
	typescript: {
		tsconfigPath: './tsconfig.json',
	},
});
runWithConfig('no-style', {
	typescript: {
		tsconfigPath: './tsconfig.json',
	},
	stylistic: false,
});
runWithConfig('double-quotes', {
	typescript: {
		tsconfigPath: './tsconfig.json',
	},
	stylistic: {
		quotes: 'double',
	},
});

runWithConfig('space-indent', {
	typescript: {
		tsconfigPath: './tsconfig.json',
	},
	stylistic: {
		indent: 2,
	},
});

// https://github.com/antfu/eslint-config/issues/255
runWithConfig(
	'ts-override',
	{
		typescript: {
			tsconfigPath: './tsconfig.json',
		},
		react: false,
	},
	{
		rules: {
			'ts/consistent-type-definitions': ['error', 'type'],
		},
	},
);

function runWithConfig(name: string, configs: OptionsConfig, ...items: TypedFlatConfigItem[]) {
	it.concurrent(name, async ({ expect }) => {
		const from = resolve('fixtures/input');
		const output = resolve('fixtures/output', name);
		const target = resolve('_fixtures', name);

		await fs.cp(from, target, {
			recursive: true,
			filter: (src) => {
				if (src.includes('tsconfig.json') && !configs.typescript) {
					return false;
				}

				return !src.includes('node_modules');
			},
		});
		await fs.writeFile(join(target, 'eslint.config.js'), `
// @eslint-disable
import configure from '@noaignite-dk/eslint-flat-config'

export default configure(
  ${JSON.stringify(configs)},
  ...${JSON.stringify(items) ?? []},
)
  `);

		await execa('npx', ['eslint', '.', '--fix'], {
			cwd: target,
			stdio: 'pipe',
		});

		const files = await glob('**/*', {
			ignore: [
				'node_modules',
				'eslint.config.js',
			],
			cwd: target,
		});

		await Promise.all(files.map(async (file) => {
			const content = await fs.readFile(join(target, file), 'utf-8');
			const source = await fs.readFile(join(from, file), 'utf-8');
			const outputPath = join(output, file);
			if (content === source) {
				await fs.rm(outputPath, { force: true });
				return;
			}
			await expect.soft(content).toMatchFileSnapshot(join(output, file));
		}));
	}, 30_000);
}
