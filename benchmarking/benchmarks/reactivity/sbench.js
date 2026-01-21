/** @import { Source } from '../../../packages/svelte/src/internal/client/types.js' */
import { fastest_test } from '../../utils.js';
import * as $ from '../../../packages/svelte/src/internal/client/index.js';

const COUNT = 1e5;

/**
 * @param {number} n
 * @param {any[]} sources
 */
function create_sources(n, sources) {
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
 *
 * @param {string} label
 * @param {(n: number, sources: Array<Source<number>>)} fn
 * @param {number} count
 * @param {number} num_sources
 */
function create_sbench_test(label, count, num_sources, fn) {
	return async () => {
		// Do 3 loops to warm up JIT
		for (let i = 0; i < 3; i++) {
			fn(count, create_sources(num_sources, []));
		}

		const { time, gc_time } = await fastest_test(10, () => {
			const destroy = $.effect_root(() => {
				for (let i = 0; i < 10; i++) {
					fn(count, create_sources(num_sources, []));
				}
			});
			destroy();
		});

		return {
			benchmark: label,
			time: time.toFixed(2),
			gc_time: gc_time.toFixed(2)
		};
	};
}

export const sbench_create_signals = create_sbench_test(
	'sbench_create_signals',
	COUNT,
	COUNT,
	create_sources
);

export const sbench_create_0to1 = create_sbench_test('sbench_create_0to1', COUNT, 0, (n) => {
	for (let i = 0; i < n; i++) {
		$.derived(() => i);
	}
});

export const sbench_create_1to1 = create_sbench_test(
	'sbench_create_1to1',
	COUNT,
	COUNT,
	(n, sources) => {
		for (let i = 0; i < n; i++) {
			create_derived(sources[i]);
		}
	}
);

export const sbench_create_2to1 = create_sbench_test(
	'sbench_create_2to1',
	COUNT / 2,
	COUNT,
	(n, sources) => {
		for (let i = 0; i < n; i++) {
			$.derived(() => $.get(sources[i * 2]) + $.get(sources[i * 2 + 1]));
		}
	}
);

export const sbench_create_4to1 = create_sbench_test(
	'sbench_create_4to1',
	COUNT / 4,
	COUNT,
	(n, sources) => {
		for (let i = 0; i < n; i++) {
			$.derived(
				() =>
					$.get(sources[i * 4]) +
					$.get(sources[i * 4 + 1]) +
					$.get(sources[i * 4 + 2]) +
					$.get(sources[i * 4 + 3])
			);
		}
	}
);

export const sbench_create_1000to1 = create_sbench_test(
	'sbench_create_1000to1',
	COUNT / 1000,
	COUNT,
	(n, sources) => {
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
	}
);

export const sbench_create_1to2 = create_sbench_test(
	'sbench_create_1to2',
	COUNT,
	COUNT / 2,
	(n, sources) => {
		for (let i = 0; i < n / 2; i++) {
			const source = sources[i];
			create_derived(source);
			create_derived(source);
		}
	}
);

export const sbench_create_1to4 = create_sbench_test(
	'sbench_create_1to4',
	COUNT,
	COUNT / 4,
	(n, sources) => {
		for (let i = 0; i < n / 4; i++) {
			const source = sources[i];
			create_derived(source);
			create_derived(source);
			create_derived(source);
			create_derived(source);
		}
	}
);

export const sbench_create_1to8 = create_sbench_test(
	'sbench_create_1to8',
	COUNT,
	COUNT / 8,
	(n, sources) => {
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
	}
);

export const sbench_create_1to1000 = create_sbench_test(
	'sbench_create_1to1000',
	COUNT,
	COUNT / 1000,
	(n, sources) => {
		for (let i = 0; i < n / 1000; i++) {
			const source = sources[i];
			for (let j = 0; j < 1000; j++) {
				create_derived(source);
			}
		}
	}
);
