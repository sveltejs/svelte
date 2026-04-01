import fs from 'node:fs';
import path from 'node:path';

const [benchmark, baseBranch = 'main', candidateBranch] = process.argv.slice(2);

if (!benchmark || !candidateBranch) {
	console.error('Usage: node benchmarking/compare/profile-diff.mjs <benchmark> <base-branch> <candidate-branch>');
	process.exit(1);
}

const root = path.resolve('benchmarking/compare/.profiles');

function read_profile(branch, bench) {
	const file = path.join(root, branch, `${bench}.cpuprofile`);
	const profile = JSON.parse(fs.readFileSync(file, 'utf8'));
	const nodes = Array.isArray(profile.nodes) ? profile.nodes : [];
	const samples = Array.isArray(profile.samples) ? profile.samples : [];

	const id_to_node = new Map(nodes.map((node) => [node.id, node]));
	const self_counts = new Map();

	for (const sample of samples) {
		if (typeof sample !== 'number') continue;
		self_counts.set(sample, (self_counts.get(sample) ?? 0) + 1);
	}

	const total = samples.length || 1;
	const by_fn = new Map();

	for (const [id, count] of self_counts) {
		const node = id_to_node.get(id);
		if (!node || typeof node !== 'object') continue;

		const frame = node.callFrame ?? {};
		const function_name = frame.functionName || '(anonymous)';
		const url = frame.url || '';
		const line = typeof frame.lineNumber === 'number' ? frame.lineNumber + 1 : 0;

		const label = url
			? `${function_name} @ ${url.replace(/^.*packages\//, 'packages/')}:${line}`
			: function_name;

		by_fn.set(label, (by_fn.get(label) ?? 0) + count);
	}

	return { by_fn, total };
}

const base = read_profile(baseBranch, benchmark);
const candidate = read_profile(candidateBranch, benchmark);

const keys = new Set([...base.by_fn.keys(), ...candidate.by_fn.keys()]);
const rows = [...keys]
	.map((key) => {
		const base_pct = ((base.by_fn.get(key) ?? 0) * 100) / base.total;
		const candidate_pct = ((candidate.by_fn.get(key) ?? 0) * 100) / candidate.total;
		return {
			key,
			delta: candidate_pct - base_pct,
			base_pct,
			candidate_pct
		};
	})
	.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
	.slice(0, 20);

console.log(`Benchmark: ${benchmark}`);
console.log(`Base: ${baseBranch}`);
console.log(`Candidate: ${candidateBranch}`);
console.log('');

for (const row of rows) {
	const sign = row.delta >= 0 ? '+' : '';
	console.log(
		`${sign}${row.delta.toFixed(2).padStart(6)}pp  candidate ${row.candidate_pct.toFixed(2).padStart(6)}%  base ${row.base_pct.toFixed(2).padStart(6)}%  ${row.key}`
	);
}
