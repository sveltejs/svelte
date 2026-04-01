import { performance, PerformanceObserver } from 'node:perf_hooks';
import fs from 'node:fs';
import path from 'node:path';
import inspector from 'node:inspector/promises';
import v8 from 'v8-natives';

// Credit to https://github.com/milomg/js-reactivity-benchmark for the logic for timing + GC tracking.

async function track(fn) {
	v8.collectGarbage();

	/** @type {PerformanceEntry[]} */
	const entries = [];

	const observer = new PerformanceObserver((list) => entries.push(...list.getEntries()));
	observer.observe({ entryTypes: ['gc'] });

	const start = performance.now();
	fn();
	const end = performance.now();

	await new Promise((f) => setTimeout(f, 10));

	const gc_time = entries
		.filter((e) => e.startTime >= start && e.startTime < end)
		.reduce((t, e) => e.duration + t, 0);

	observer.disconnect();

	return { time: end - start, gc_time };
}

/**
 * @param {number} times
 * @param {() => void} fn
 */
export async function fastest_test(times, fn) {
	/** @type {Array<{ time: number, gc_time: number }>} */
	const results = [];

	for (let i = 0; i < times; i++) {
		results.push(await track(fn));
	}

	return results.reduce((a, b) => (a.time < b.time ? a : b));
}

function safe(name) {
	return name.replace(/[^a-z0-9._-]+/gi, '_');
}

/**
 * @param {unknown} value
 */
function format_markdown_value(value) {
	if (value === null || value === undefined) return '';
	if (Array.isArray(value)) return value.map((item) => String(item)).join(', ');
	if (typeof value === 'object') return JSON.stringify(value);
	return String(value);
}

/**
 * @param {string} text
 */
function escape_markdown_cell(text) {
	return text.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

/**
 * @param {string} value
 */
function normalize_profile_url(value) {
	if (!value) return '';

	if (value.startsWith('file://')) {
		try {
			const pathname = decodeURIComponent(new URL(value).pathname);
			const relative = path.relative(process.cwd(), pathname);
			if (relative && !relative.startsWith('..') && !path.isAbsolute(relative)) return relative;
			return pathname;
		} catch {
			return value;
		}
	}

	if (path.isAbsolute(value)) {
		const relative = path.relative(process.cwd(), value);
		if (relative && !relative.startsWith('..') && !path.isAbsolute(relative)) return relative;
	}

	return value;
}

/**
 * @param {string} function_name
 */
function is_special_runtime_node(function_name) {
	return function_name === '(idle)' || function_name === '(garbage collector)';
}

/**
 * @param {string} normalized_url
 */
function is_svelte_source_url(normalized_url) {
	return normalized_url.startsWith('packages/svelte/');
}

/**
 * @param {Record<string, unknown>} profile
 */
function profile_to_markdown(profile) {
	/** @type {string[]} */
	const lines = ['# CPU profile'];

	const metadata = Object.entries(profile).filter(
		([key]) => key !== 'nodes' && key !== 'samples' && key !== 'timeDeltas'
	);

	if (metadata.length > 0) {
		lines.push('', '## Metadata', '| Field | Value |', '| --- | --- |');
		for (const [key, value] of metadata) {
			lines.push(
				`| ${escape_markdown_cell(key)} | ${escape_markdown_cell(format_markdown_value(value))} |`
			);
		}
	}

	const nodes = Array.isArray(profile.nodes) ? profile.nodes : [];
	const samples = Array.isArray(profile.samples) ? profile.samples : [];
	const timeDeltas = Array.isArray(profile.timeDeltas) ? profile.timeDeltas : [];
	/** @type {Set<number>} */
	const included_node_ids = new Set();

	if (nodes.length > 0) {
		/** @type {Map<number, Record<string, unknown>>} */
		const nodes_by_id = new Map();

		/** @type {Map<number, number>} */
		const parent_by_id = new Map();

		for (const node of nodes) {
			if (!node || typeof node !== 'object') continue;
			if (typeof node.id !== 'number') continue;
			nodes_by_id.set(node.id, node);
			const children = Array.isArray(node.children) ? node.children : [];
			for (const child of children) {
				if (typeof child === 'number') {
					parent_by_id.set(child, node.id);
				}
			}

			const callFrame =
				node.callFrame && typeof node.callFrame === 'object'
					? /** @type {Record<string, unknown>} */ (node.callFrame)
					: /** @type {Record<string, unknown>} */ ({});
			const functionName =
				typeof callFrame.functionName === 'string' ? callFrame.functionName : '(anonymous)';
			const normalizedUrl =
				typeof callFrame.url === 'string' ? normalize_profile_url(callFrame.url) : '';

			if (is_special_runtime_node(functionName) || is_svelte_source_url(normalizedUrl)) {
				included_node_ids.add(node.id);
			}
		}

		/** @type {Map<number, number>} */
		const self_sample_count = new Map();
		for (const sample of samples) {
			if (typeof sample !== 'number') continue;
			if (!included_node_ids.has(sample)) continue;
			self_sample_count.set(sample, (self_sample_count.get(sample) ?? 0) + 1);
		}

		/** @type {Map<number, number>} */
		const inclusive_sample_count = new Map();
		/** @type {Set<number>} */
		const stack = new Set();

		/** @param {number} node_id */
		const get_inclusive_count = (node_id) => {
			const cached = inclusive_sample_count.get(node_id);
			if (cached !== undefined) return cached;
			if (stack.has(node_id)) return self_sample_count.get(node_id) ?? 0;

			stack.add(node_id);
			const node = nodes_by_id.get(node_id);
			const children = node && Array.isArray(node.children) ? node.children : [];
			let total = self_sample_count.get(node_id) ?? 0;

			for (const child of children) {
				if (typeof child !== 'number') continue;
				total += get_inclusive_count(child);
			}

			stack.delete(node_id);
			inclusive_sample_count.set(node_id, total);
			return total;
		};

		for (const node_id of included_node_ids) {
			get_inclusive_count(node_id);
		}

		const total_samples = [...self_sample_count.values()].reduce((sum, count) => sum + count, 0);
		if (total_samples > 0) {
			const hotspot_rows = [...included_node_ids]
				.map((id) => nodes_by_id.get(id))
				.filter((node) => !!node)
				.map((node) => {
					const id = /** @type {number} */ (node.id);
					const callFrame =
						node.callFrame && typeof node.callFrame === 'object'
							? /** @type {Record<string, unknown>} */ (node.callFrame)
							: /** @type {Record<string, unknown>} */ ({});
					const functionName =
						typeof callFrame.functionName === 'string' && callFrame.functionName.length > 0
							? callFrame.functionName
							: '(anonymous)';
					const selfCount = self_sample_count.get(id) ?? 0;
					const inclusiveCount = inclusive_sample_count.get(id) ?? selfCount;
					return { id, functionName, selfCount, inclusiveCount };
				})
				.filter((row) => row.selfCount > 0 || row.inclusiveCount > 0)
				.sort(
					(a, b) =>
						b.inclusiveCount - a.inclusiveCount ||
						b.selfCount - a.selfCount ||
						String(a.id).localeCompare(String(b.id))
				)
				.slice(0, 25);

			if (hotspot_rows.length > 0) {
				lines.push(
					'',
					'## Top hotspots',
					'| Rank | Node ID | Function | Self samples | Self % | Inclusive samples | Inclusive % |',
					'| --- | --- | --- | --- | --- | --- | --- |'
				);

				for (let i = 0; i < hotspot_rows.length; i += 1) {
					const row = hotspot_rows[i];
					const selfPct = ((row.selfCount / total_samples) * 100).toFixed(2);
					const inclusivePct = ((row.inclusiveCount / total_samples) * 100).toFixed(2);
					lines.push(
						`| ${i + 1} | ${row.id} | ${escape_markdown_cell(row.functionName)} | ${row.selfCount} | ${selfPct}% | ${row.inclusiveCount} | ${inclusivePct}% |`
					);
				}
			}
		}

		lines.push(
			'',
			'## Nodes',
			'| ID | Parent ID | Function | URL | Line | Column | Hit count | Children | Deopt reason |',
			'| --- | --- | --- | --- | --- | --- | --- | --- | --- |'
		);

		for (const node of nodes) {
			if (!node || typeof node !== 'object') continue;
			if (typeof node.id !== 'number') continue;
			if (!included_node_ids.has(node.id)) continue;

			const callFrame =
				node.callFrame && typeof node.callFrame === 'object'
					? /** @type {Record<string, unknown>} */ (node.callFrame)
					: /** @type {Record<string, unknown>} */ ({});

			const id = typeof node.id === 'number' ? node.id : '';
			const parentId =
				typeof id === 'number' && included_node_ids.has(parent_by_id.get(id) ?? NaN)
					? parent_by_id.get(id) ?? ''
					: '';
			const functionName =
				typeof callFrame.functionName === 'string' && callFrame.functionName.length > 0
					? callFrame.functionName
					: '(anonymous)';
			const url = typeof callFrame.url === 'string' ? normalize_profile_url(callFrame.url) : '';
			const lineNumber =
				typeof callFrame.lineNumber === 'number' ? String(callFrame.lineNumber + 1) : '';
			const columnNumber =
				typeof callFrame.columnNumber === 'number' ? String(callFrame.columnNumber + 1) : '';
			const hitCount = typeof node.hitCount === 'number' ? node.hitCount : '';
			const children = Array.isArray(node.children)
				? node.children
						.filter((child) => typeof child === 'number' && included_node_ids.has(child))
						.join(', ')
				: '';
			const deoptReason = typeof node.deoptReason === 'string' ? node.deoptReason : '';

			lines.push(
				`| ${escape_markdown_cell(String(id))} | ${escape_markdown_cell(String(parentId))} | ${escape_markdown_cell(functionName)} | ${escape_markdown_cell(url)} | ${escape_markdown_cell(lineNumber)} | ${escape_markdown_cell(columnNumber)} | ${escape_markdown_cell(String(hitCount))} | ${escape_markdown_cell(children)} | ${escape_markdown_cell(deoptReason)} |`
			);
		}
	}

	return `${lines.join('\n')}\n`;
}

/**
 * @template T
 * @param {string | null} profile_dir
 * @param {string} profile_name
 * @param {() => T | Promise<T>} fn
 * @returns {Promise<T>}
 */
export async function with_cpu_profile(profile_dir, profile_name, fn) {
	if (profile_dir === null) {
		return await fn();
	}

	fs.mkdirSync(profile_dir, { recursive: true });

	const session = new inspector.Session();
	session.connect();

	await session.post('Profiler.enable');
	await session.post('Profiler.start');

	try {
		return await fn();
	} finally {
		const { profile } = /** @type {{ profile: object }} */ (await session.post('Profiler.stop'));
		const safe_profile_name = safe(profile_name);
		const profile_file = path.join(profile_dir, `${safe_profile_name}.cpuprofile`);
		const markdown_file = path.join(profile_dir, `${safe_profile_name}.md`);
		fs.writeFileSync(profile_file, JSON.stringify(profile));
		fs.writeFileSync(
			markdown_file,
			profile_to_markdown(/** @type {Record<string, unknown>} */ (profile))
		);
		session.disconnect();
	}
}
