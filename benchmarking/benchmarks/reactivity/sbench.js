/** @import { Source } from '../../../packages/svelte/src/internal/client/types.js' */
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
 * @param {Source<number>} source
 */
function create_derived(source) {
	$.derived(() => $.get(source));
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
 * @param {(n: number, sources: Array<Source<number>>)} fn
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
	function create_computations_0to1(n) {
		for (let i = 0; i < n; i++) {
			$.derived(() => i);
		}
	},
	COUNT,
	0
);

export const sbench_create_1to1 = create_sbench_test(
	'sbench_create_1to1',
	function create_computations_1to1(n, sources) {
		for (let i = 0; i < n; i++) {
			create_derived(sources[i]);
		}
	},
	COUNT,
	COUNT
);

export const sbench_create_2to1 = create_sbench_test(
	'sbench_create_2to1',
	function create_computations_2to1(n, sources) {
		for (let i = 0; i < n; i++) {
			$.derived(() => $.get(sources[i * 2]) + $.get(sources[i * 2 + 1]));
		}
	},
	COUNT / 2,
	COUNT
);

export const sbench_create_4to1 = create_sbench_test(
	'sbench_create_4to1',
	function create_computations_4to1(n, sources) {
		for (let i = 0; i < n; i++) {
			$.derived(
				() =>
					$.get(sources[i * 4]) +
					$.get(sources[i * 4 + 1]) +
					$.get(sources[i * 4 + 2]) +
					$.get(sources[i * 4 + 3])
			);
		}
	},
	COUNT / 4,
	COUNT
);

export const sbench_create_1000to1 = create_sbench_test(
	'sbench_create_1000to1',
	function create_computations_1000to1(n, sources) {
		for (let i = 0; i < n; i++) {
			const offset = i * 1000;

			$.derived(() => {
				let sum = 0;
				for (let i = 0; i < 1000; i++) {
					sum += $.get(sources[offset + i]);
				}
				return sum;
			});
		}
	},
	COUNT / 1000,
	COUNT
);

export const sbench_create_1to2 = create_sbench_test(
	'sbench_create_1to2',
	function create_computations_1to2(n, sources) {
		for (let i = 0; i < n / 2; i++) {
			const source = sources[i];
			create_derived(source);
			create_derived(source);
		}
	},
	COUNT,
	COUNT / 2
);

export const sbench_create_1to4 = create_sbench_test(
	'sbench_create_1to4',
	function create_computations_1to4(n, sources) {
		for (let i = 0; i < n / 4; i++) {
			const source = sources[i];
			create_derived(source);
			create_derived(source);
			create_derived(source);
			create_derived(source);
		}
	},
	COUNT,
	COUNT / 4
);

export const sbench_create_1to8 = create_sbench_test(
	'sbench_create_1to8',
	function create_computations_1to8(n, sources) {
		for (let i = 0; i < n / 8; i++) {
			const source = sources[i];
			create_derived(source);
			create_derived(source);
			create_derived(source);
			create_derived(source);
			create_derived(source);
			create_derived(source);
			create_derived(source);
			create_derived(source);
		}
	},
	COUNT,
	COUNT / 8
);

export const sbench_create_1to1000 = create_sbench_test(
	'sbench_create_1to1000',
	function create_computations_1to1000(n, sources) {
		for (let i = 0; i < n / 1000; i++) {
			const source = sources[i];
			for (let j = 0; j < 1000; j++) {
				create_derived(source);
			}
		}
	},
	COUNT,
	COUNT / 1000
);
