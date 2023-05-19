import { mkdirSync, rmSync, writeFileSync } from "fs";

function create_shard_files() {
	let num_shards = +process.env.SVELTE_TEST_SUITE_SHARDS || 1;
	num_shards = Math.max(1, num_shards);

	const runtime_shards_dir = `${__dirname}/runtime/shards`;
	rmSync(runtime_shards_dir, { recursive: true, force: true });
	mkdirSync(runtime_shards_dir);

	for (let i = 1; i <= num_shards; i += 1) {
		writeFileSync(
			`${runtime_shards_dir}/runtime_${i}.test.js`,
			`// @vitest-environment jsdom
			import { run_shard } from '../runtime.shared.js';
			run_shard(${i}, ${num_shards});`.replaceAll('\t', ''),
		);
	}
}

export default function () {
    create_shard_files();    
}