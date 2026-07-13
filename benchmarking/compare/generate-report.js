import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export function generate_report(outdir) {
	const result_files = fs
		.readdirSync(outdir)
		.filter((file) => file.endsWith('.json'))
		.sort((a, b) => a.localeCompare(b));

	const branches = result_files.map((file) => file.slice(0, -5));
	const results = result_files.map((file) =>
		JSON.parse(fs.readFileSync(`${outdir}/${file}`, 'utf-8'))
	);

	if (results.length === 0) {
		console.error(`No result files found in ${outdir}`);
		process.exit(1);
	}

	const report_file = path.join(outdir, 'report.txt');

	fs.writeFileSync(report_file, '');

	const write = (str) => {
		fs.appendFileSync(report_file, str + '\n');
		console.log(str);
	};

	for (let i = 0; i < branches.length; i += 1) {
		write(`${char(i)}: ${branches[i]}`);
	}

	write('');

	// match results by benchmark name — branches may have different benchmark
	// lists (e.g. a benchmark that only exists on one of the branches), so
	// pairing by array index would misattribute results
	const by_name = results.map((result) => new Map(result.map((r) => [r.benchmark, r])));

	/** @type {string[]} */
	const names = [];

	for (const result of results) {
		for (const { benchmark } of result) {
			if (!names.includes(benchmark)) {
				names.push(benchmark);
			}
		}
	}

	for (const name of names) {
		const entries = by_name.map((map) => map.get(name));
		const missing = entries
			.map((entry, b) => (entry === undefined ? branches[b] : null))
			.filter((branch) => branch !== null);

		write(`${name}`);

		if (missing.length > 0) {
			write(`  skipped (missing on ${missing.join(', ')})`);
			write('');
			continue;
		}

		for (const metric of ['time', 'gc_time']) {
			const times = entries.map((entry) => +entry[metric]);
			let min = Infinity;
			let max = -Infinity;
			let min_index = -1;

			for (let b = 0; b < times.length; b += 1) {
				const time = times[b];

				if (time < min) {
					min = time;
					min_index = b;
				}

				if (time > max) {
					max = time;
				}
			}

			if (min !== 0) {
				write(`  ${metric}: fastest is ${char(min_index)} (${branches[min_index]})`);
				times.forEach((time, b) => {
					const SIZE = 20;
					const n = Math.round(SIZE * (time / max));

					write(`    ${char(b)}: ${'◼'.repeat(n)}${' '.repeat(SIZE - n)} ${time.toFixed(2)}ms`);
				});
			}
		}

		write('');
	}
}

function char(i) {
	return String.fromCharCode(97 + i);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
	const outdir = path.resolve(process.argv[1], '../.results');

	generate_report(outdir);
}
