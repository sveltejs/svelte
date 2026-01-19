import { fastest_test } from '../../utils.js';
import * as $ from '../../../packages/svelte/src/internal/client/index.js';

const COUNT = 1e5;

/**
 * @param {number} n
 * @param {any[]} sources
 */
function create_data_signals(n, sources) {
	for (let i = 0; i < n; i++) {
		sources[i] = $.state(i);
	}
	return sources;
}

/**
 * @param {number} i
 */
function create_computation_0(i) {
	$.derived(() => i);
}

/**
 * @param {any} s1
 */
function create_computation_1(s1) {
	$.derived(() => $.get(s1));
}
/**
 * @param {any} s1
 * @param {any} s2
 */
function create_computation_2(s1, s2) {
	$.derived(() => $.get(s1) + $.get(s2));
}

function create_computation_1000(ss, offset) {
	$.derived(() => {
		let sum = 0;
		for (let i = 0; i < 1000; i++) {
			sum += $.get(ss[offset + i]);
		}
		return sum;
	});
}

/**
 * @param {number} n
 */
function create_computations_0to1(n) {
	for (let i = 0; i < n; i++) {
		create_computation_0(i);
	}
}

/**
 * @param {number} n
 * @param {any[]} sources
 */
function create_computations_1to1(n, sources) {
	for (let i = 0; i < n; i++) {
		const source = sources[i];
		create_computation_1(source);
	}
}

/**
 * @param {number} n
 * @param {any[]} sources
 */
function create_computations_2to1(n, sources) {
	for (let i = 0; i < n; i++) {
		create_computation_2(sources[i * 2], sources[i * 2 + 1]);
	}
}

function create_computation_4(s1, s2, s3, s4) {
	$.derived(() => $.get(s1) + $.get(s2) + $.get(s3) + $.get(s4));
}

function create_computations_1000to1(n, sources) {
	for (let i = 0; i < n; i++) {
		create_computation_1000(sources, i * 1000);
	}
}

function create_computations_1to2(n, sources) {
	for (let i = 0; i < n / 2; i++) {
		const source = sources[i];
		create_computation_1(source);
		create_computation_1(source);
	}
}

function create_computations_1to4(n, sources) {
	for (let i = 0; i < n / 4; i++) {
		const source = sources[i];
		create_computation_1(source);
		create_computation_1(source);
		create_computation_1(source);
		create_computation_1(source);
	}
}

function create_computations_1to8(n, sources) {
	for (let i = 0; i < n / 8; i++) {
		const source = sources[i];
		create_computation_1(source);
		create_computation_1(source);
		create_computation_1(source);
		create_computation_1(source);
		create_computation_1(source);
		create_computation_1(source);
		create_computation_1(source);
		create_computation_1(source);
	}
}

function create_computations_1to1000(n, sources) {
	for (let i = 0; i < n / 1000; i++) {
		const source = sources[i];
		for (let j = 0; j < 1000; j++) {
			create_computation_1(source);
		}
	}
}

function create_computations_4to1(n, sources) {
	for (let i = 0; i < n; i++) {
		create_computation_4(
			sources[i * 4],
			sources[i * 4 + 1],
			sources[i * 4 + 2],
			sources[i * 4 + 3]
		);
	}
}

/**
 * @param {any} fn
 * @param {number} count
 * @param {number} scount
 */
function bench(fn, count, scount) {
	let sources = create_data_signals(scount, []);

	fn(count, sources);
}

/**
 *
 * @param {string} label
 * @param {*} fn
 * @param {number} count
 * @param {number} scount
 */
function create_sbench_test(label, fn, count, scount) {
	return async () => {
		// Do 3 loops to warm up JIT
		for (let i = 0; i < 3; i++) {
			bench(fn, count, scount);
		}

		const { timing } = await fastest_test(10, () => {
			const destroy = $.effect_root(() => {
				for (let i = 0; i < 10; i++) {
					bench(fn, count, scount);
				}
			});
			destroy();
		});

		return {
			benchmark: label,
			time: timing.time.toFixed(2),
			gc_time: timing.gc_time.toFixed(2)
		};
	};
}

export const sbench_create_signals = create_sbench_test(
	'sbench_create_signals',
	create_data_signals,
	COUNT,
	COUNT
);

export const sbench_create_0to1 = create_sbench_test(
	'sbench_create_0to1',
	create_computations_0to1,
	COUNT,
	0
);

export const sbench_create_1to1 = create_sbench_test(
	'sbench_create_1to1',
	create_computations_1to1,
	COUNT,
	COUNT
);

export const sbench_create_2to1 = create_sbench_test(
	'sbench_create_2to1',
	create_computations_2to1,
	COUNT / 2,
	COUNT
);

export const sbench_create_4to1 = create_sbench_test(
	'sbench_create_4to1',
	create_computations_4to1,
	COUNT / 4,
	COUNT
);

export const sbench_create_1000to1 = create_sbench_test(
	'sbench_create_1000to1',
	create_computations_1000to1,
	COUNT / 1000,
	COUNT
);

export const sbench_create_1to2 = create_sbench_test(
	'sbench_create_1to2',
	create_computations_1to2,
	COUNT,
	COUNT / 2
);

export const sbench_create_1to4 = create_sbench_test(
	'sbench_create_1to4',
	create_computations_1to4,
	COUNT,
	COUNT / 4
);

export const sbench_create_1to8 = create_sbench_test(
	'sbench_create_1to8',
	create_computations_1to8,
	COUNT,
	COUNT / 8
);

export const sbench_create_1to1000 = create_sbench_test(
	'sbench_create_1to1000',
	create_computations_1to1000,
	COUNT,
	COUNT / 1000
);
