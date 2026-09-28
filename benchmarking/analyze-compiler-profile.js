import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(import.meta.url), '../..');
const compiler_path = 'packages/svelte/src/compiler/';

/**
 * Merge V8 profiles from a Vitest run into a compiler-only flame graph and hotspot summary.
 * Samples retain callees outside the compiler once execution has entered compiler code.
 * @param {string} run_dir
 */
export function analyze_compiler_profiles(run_dir) {
	const raw_dir = path.join(run_dir, 'raw');
	const profile_files = fs
		.readdirSync(raw_dir)
		.filter((file) => file.endsWith('.cpuprofile'))
		.sort();

	if (profile_files.length === 0) {
		throw new Error(`No CPU profiles found in ${raw_dir}`);
	}

	/** @type {Array<{ name: string, file?: string, line?: number, col?: number }>} */
	const frames = [];
	/** @type {Map<string, number>} */
	const frame_indices = new Map();
	/** @type {Map<string, { stack: number[], weight: number }>} */
	const stacks = new Map();
	/** @type {Map<string, Hotspot>} */
	const hotspots = new Map();
	/** @type {Map<string, Hotspot>} */
	const files = new Map();
	let total_time = 0;
	let compiler_time = 0;
	let garbage_collection_time = 0;
	let total_samples = 0;
	let compiler_samples = 0;

	for (const profile_file of profile_files) {
		let profile;
		try {
			profile = JSON.parse(fs.readFileSync(path.join(raw_dir, profile_file), 'utf8'));
		} catch (error) {
			throw new Error(`Could not parse CPU profile ${profile_file}`, { cause: error });
		}
		const nodes = Array.isArray(profile.nodes) ? profile.nodes : [];
		const samples = Array.isArray(profile.samples) ? profile.samples : [];
		const time_deltas = Array.isArray(profile.timeDeltas) ? profile.timeDeltas : [];
		const nodes_by_id = new Map(nodes.map((node) => [node.id, node]));
		const parents = new Map();

		for (const node of nodes) {
			for (const child of node.children || []) {
				parents.set(child, node.id);
			}
		}

		for (let i = 0; i < samples.length; i += 1) {
			const weight = typeof time_deltas[i] === 'number' ? time_deltas[i] : 1;
			const stack = get_stack(samples[i], nodes_by_id, parents);
			total_time += weight;
			total_samples += 1;

			if (stack.at(-1)?.function_name === '(garbage collector)') {
				garbage_collection_time += weight;
			}

			const compiler_index = stack.findIndex((frame) => frame.url.includes(compiler_path));
			if (compiler_index === -1) continue;

			const compiler_stack = stack.slice(compiler_index);
			const stack_indices = compiler_stack.map(get_frame_index);
			const stack_key = stack_indices.join(',');
			const existing_stack = stacks.get(stack_key);

			if (existing_stack) {
				existing_stack.weight += weight;
			} else {
				stacks.set(stack_key, { stack: stack_indices, weight });
			}

			compiler_time += weight;
			compiler_samples += 1;

			const leaf = compiler_stack.at(-1);
			if (leaf) {
				get_hotspot(hotspots, frame_key(leaf), leaf).self += weight;
				get_hotspot(files, leaf.url || '(native)', {
					...leaf,
					function_name: leaf.url || '(native)'
				}).self += weight;
			}

			const seen_frames = new Set();
			const seen_files = new Set();

			for (const frame of compiler_stack) {
				const key = frame_key(frame);
				if (!seen_frames.has(key)) {
					get_hotspot(hotspots, key, frame).inclusive += weight;
					seen_frames.add(key);
				}

				const file = frame.url || '(native)';
				if (!seen_files.has(file)) {
					get_hotspot(files, file, { ...frame, function_name: file }).inclusive += weight;
					seen_files.add(file);
				}
			}
		}
	}

	if (compiler_time === 0) {
		throw new Error('The CPU profiles contain no samples from packages/svelte/src/compiler');
	}

	const hotspot_rows = rank(hotspots, compiler_time);
	const file_rows = rank(files, compiler_time);
	const compact_stacks = [...stacks.values()];
	const summary = {
		profile_files: profile_files.length,
		total_samples,
		compiler_samples,
		total_time_microseconds: total_time,
		compiler_time_microseconds: compiler_time,
		garbage_collection_time_microseconds: garbage_collection_time,
		compiler_share_percent: (compiler_time * 100) / total_time,
		hotspots: hotspot_rows,
		files: file_rows
	};
	const speedscope = {
		$schema: 'https://www.speedscope.app/file-format-schema.json',
		name: `Svelte compiler: ${path.basename(run_dir)}`,
		exporter: 'Svelte compiler test profiler',
		activeProfileIndex: 0,
		shared: { frames },
		profiles: [
			{
				type: 'sampled',
				name: 'Compiler-active samples from pnpm test',
				unit: 'microseconds',
				startValue: 0,
				endValue: compiler_time,
				samples: compact_stacks.map((entry) => entry.stack),
				weights: compact_stacks.map((entry) => entry.weight)
			}
		]
	};

	fs.writeFileSync(
		path.join(run_dir, 'flamegraph.speedscope.json'),
		`${JSON.stringify(speedscope)}\n`
	);
	fs.writeFileSync(path.join(run_dir, 'summary.json'), `${JSON.stringify(summary, null, '\t')}\n`);
	fs.writeFileSync(path.join(run_dir, 'summary.md'), render_markdown(summary));

	return summary;

	/** @param {Frame} frame */
	function get_frame_index(frame) {
		const key = frame_key(frame);
		const existing = frame_indices.get(key);
		if (existing !== undefined) return existing;

		const index = frames.length;
		const location = frame.url ? ` (${frame.url}:${frame.line})` : '';
		frames.push({
			name: `${frame.function_name}${location}`,
			...(frame.url ? { file: frame.url, line: frame.line, col: frame.column } : {})
		});
		frame_indices.set(key, index);
		return index;
	}
}

/**
 * @param {number} leaf_id
 * @param {Map<number, any>} nodes_by_id
 * @param {Map<number, number>} parents
 * @returns {Frame[]}
 */
function get_stack(leaf_id, nodes_by_id, parents) {
	/** @type {Frame[]} */
	const stack = [];
	const seen = new Set();
	let id = leaf_id;

	while (typeof id === 'number' && !seen.has(id)) {
		seen.add(id);
		const node = nodes_by_id.get(id);
		if (!node) break;

		const call_frame = node.callFrame || {};
		stack.push({
			function_name: call_frame.functionName || '(anonymous)',
			url: normalize_url(call_frame.url || ''),
			line: typeof call_frame.lineNumber === 'number' ? call_frame.lineNumber + 1 : 0,
			column: typeof call_frame.columnNumber === 'number' ? call_frame.columnNumber + 1 : 0
		});
		id = parents.get(id);
	}

	return stack.reverse();
}

/** @param {string} url */
function normalize_url(url) {
	if (!url) return '';

	let pathname = url.replace(/^\/\@fs\//, '/').replace(/[?#].*$/, '');
	if (pathname.startsWith('file://')) {
		try {
			pathname = fileURLToPath(pathname);
		} catch {
			return url;
		}
	}

	if (path.isAbsolute(pathname)) {
		const relative = path.relative(root, pathname);
		if (!relative.startsWith('..') && !path.isAbsolute(relative)) {
			pathname = relative;
		}
	}

	return pathname.replaceAll(path.sep, '/');
}

/** @param {Frame} frame */
function frame_key(frame) {
	return `${frame.function_name}\0${frame.url}\0${frame.line}\0${frame.column}`;
}

/**
 * @param {Map<string, Hotspot>} collection
 * @param {string} key
 * @param {Frame} frame
 */
function get_hotspot(collection, key, frame) {
	let hotspot = collection.get(key);
	if (!hotspot) {
		hotspot = { ...frame, self: 0, inclusive: 0 };
		collection.set(key, hotspot);
	}
	return hotspot;
}

/**
 * @param {Map<string, Hotspot>} collection
 * @param {number} total
 */
function rank(collection, total) {
	return [...collection.values()]
		.map((hotspot) => ({
			function: hotspot.function_name,
			url: hotspot.url,
			line: hotspot.line,
			column: hotspot.column,
			self_microseconds: hotspot.self,
			self_percent: (hotspot.self * 100) / total,
			inclusive_microseconds: hotspot.inclusive,
			inclusive_percent: (hotspot.inclusive * 100) / total
		}))
		.sort(
			(a, b) =>
				b.self_microseconds - a.self_microseconds ||
				b.inclusive_microseconds - a.inclusive_microseconds
		);
}

/** @param {ReturnType<typeof analyze_compiler_profiles>} summary */
function render_markdown(summary) {
	const lines = [
		'# Svelte compiler CPU profile',
		'',
		'Open `flamegraph.speedscope.json` in [Speedscope](https://www.speedscope.app/) for the interactive flame graph.',
		'',
		'## Coverage',
		'',
		'| Metric | Value |',
		'| --- | ---: |',
		`| Raw profiles | ${summary.profile_files} |`,
		`| All profiled CPU time | ${format_time(summary.total_time_microseconds)} |`,
		`| Compiler-active CPU time | ${format_time(summary.compiler_time_microseconds)} |`,
		`| Compiler share | ${summary.compiler_share_percent.toFixed(2)}% |`,
		`| All-process garbage collection | ${format_time(summary.garbage_collection_time_microseconds)} |`,
		'',
		'Compiler-active time includes external callees while a compiler frame is on the stack. Garbage collection is reported for context but cannot be attributed to compiler stacks by V8.',
		'',
		'## Top Self Hotspots',
		'',
		'| Rank | Function | Location | Self | Self % | Inclusive | Inclusive % |',
		'| ---: | --- | --- | ---: | ---: | ---: | ---: |'
	];

	for (const [index, row] of summary.hotspots.slice(0, 50).entries()) {
		lines.push(render_row(index, row));
	}

	lines.push(
		'',
		'## Top Files',
		'',
		'| Rank | File | Self | Self % | Inclusive | Inclusive % |',
		'| ---: | --- | ---: | ---: | ---: | ---: |'
	);

	for (const [index, row] of summary.files.slice(0, 50).entries()) {
		lines.push(
			`| ${index + 1} | ${escape_cell(row.function)} | ${format_time(row.self_microseconds)} | ${row.self_percent.toFixed(2)}% | ${format_time(row.inclusive_microseconds)} | ${row.inclusive_percent.toFixed(2)}% |`
		);
	}

	return `${lines.join('\n')}\n`;
}

/** @param {number} index @param {ReturnType<typeof rank>[number]} row */
function render_row(index, row) {
	const location = row.url ? `${row.url}:${row.line}:${row.column}` : '(native)';
	return `| ${index + 1} | ${escape_cell(row.function)} | ${escape_cell(location)} | ${format_time(row.self_microseconds)} | ${row.self_percent.toFixed(2)}% | ${format_time(row.inclusive_microseconds)} | ${row.inclusive_percent.toFixed(2)}% |`;
}

/** @param {number} microseconds */
function format_time(microseconds) {
	return `${(microseconds / 1000).toFixed(1)} ms`;
}

/** @param {string} value */
function escape_cell(value) {
	return value.replaceAll('|', '\\|');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const run_dir = process.argv[2];
	if (!run_dir) {
		console.error('Usage: node benchmarking/analyze-compiler-profile.js <profile-run-directory>');
		process.exit(1);
	}
	analyze_compiler_profiles(path.resolve(run_dir));
}

/**
 * @typedef {{ function_name: string, url: string, line: number, column: number }} Frame
 * @typedef {Frame & { self: number, inclusive: number }} Hotspot
 */
