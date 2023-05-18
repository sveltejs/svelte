import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { configDefaults, defineConfig } from 'vitest/config';

let num_shards = +process.env.SVELTE_TEST_SUITE_SHARDS || 1;
num_shards = Math.max(1, num_shards);

const runtime_shards_dir = 'test/runtime/shards';
if (existsSync(runtime_shards_dir)) {
	rmSync(runtime_shards_dir, { recursive: true });
}
mkdirSync(runtime_shards_dir);

for (let i = 1; i <= num_shards; i += 1) {
	const file = `${runtime_shards_dir}/runtime_${i}.test.js`;
	writeFileSync(
		file,
		`// @vitest-environment jsdom
		
		import { run_shard } from '../runtime.shared.js';

		run_shard(${i}, ${num_shards});`.trim()
	);
}

export default defineConfig({
	plugins: [
		{
			name: 'resolve-svelte',
			resolveId(id) {
				if (id.startsWith('svelte')) {
					return id.replace(/^svelte(.*)\/?$/, `${__dirname}$1/index.mjs`);
				}
			}
		}
	],
	test: {
		dir: 'test',
		reporters: ['dot'],
		exclude: [...configDefaults.exclude, '**/samples/**']
	}
});
