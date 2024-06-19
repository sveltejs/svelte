import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { benchmarks } from './benchmarks.js';

const results = fileURLToPath(new URL('./.results', import.meta.url));

console.log(results);

const [
	a = execSync('git symbolic-ref --short -q HEAD || git rev-parse --short HEAD').toString().trim(),
	b = 'main'
] = process.argv.slice(2);

const a_hash = execSync(`git rev-parse ${a}`).toString().trim();
const b_hash = execSync(`git rev-parse ${b}`).toString().trim();

if (a_hash === b_hash) {
	console.log('Branches are the same');
	process.exit(0);
}

/** @type {TODO[]} */
let a_results;

/** @type {TODO[]} */
let b_results;

async function run() {
	const results = [];
	for (const benchmark of benchmarks) {
		const result = await benchmark();
		console.log(result.name);
		results.push(result);
	}
	return results;
}

// step 1 — run the benchmark on the current branch
{
	a_results = await run();
	console.log(a_results);

	fs.writeFileSync(`${results}/${a_hash.slice(0, 8)}.json`, JSON.stringify(a_results, null, '  '));
}

// step 2 — run the benchmark on the comparison branch (usually main)
{
	b_results = await run();
	console.log(b_results);

	fs.writeFileSync(`${results}/${b_hash.slice(0, 8)}.json`, JSON.stringify(b_results, null, '  '));
}

// step 3 — compare the results
{
	// TODO
}
