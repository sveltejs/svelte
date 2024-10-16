import { fastest_test } from '../utils.js';
import * as $ from '../../packages/svelte/src/internal/client/index.js';

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
function create_computation_0(i, attached = true) {
	$.derived(() => i, attached);
}

/**
 * @param {any} s1
 */
function create_computation_1(s1, attached = true) {
	$.derived(() => $.get(s1), attached);
}
/**
 * @param {any} s1
 * @param {any} s2
 */
function create_computation_2(s1, s2, attached = true) {
	$.derived(() => $.get(s1) + $.get(s2), attached);
}

function create_computation_1000(ss, offset, attached = true) {
	$.derived(() => {
		let sum = 0;
		for (let i = 0; i < 1000; i++) {
			sum += $.get(ss[offset + i]);
		}
		return sum;
	}, attached);
}

/**
 * @param {number} n
 */
function create_computations_0to1(n, attached = true) {
	for (let i = 0; i < n; i++) {
		create_computation_0(i, attached);
	}
}

/**
 * @param {number} n
 * @param {any[]} sources
 */
function create_computations_1to1(n, sources, attached = true) {
	for (let i = 0; i < n; i++) {
		const source = sources[i];
		create_computation_1(source, attached);
	}
}

/**
 * @param {number} n
 * @param {any[]} sources
 */
function create_computations_2to1(n, sources, attached = true) {
	for (let i = 0; i < n; i++) {
		create_computation_2(sources[i * 2], sources[i * 2 + 1], attached);
	}
}

function create_computation_4(s1, s2, s3, s4, attached = true) {
	$.derived(() => $.get(s1) + $.get(s2) + $.get(s3) + $.get(s4), attached);
}

function create_computations_1000to1(n, sources, attached = true) {
	for (let i = 0; i < n; i++) {
		create_computation_1000(sources, i * 1000, attached);
	}
}

function create_computations_1to2(n, sources, attached = true) {
	for (let i = 0; i < n / 2; i++) {
		const source = sources[i];
		create_computation_1(source, attached);
		create_computation_1(source, attached);
	}
}

function create_computations_1to4(n, sources, attached = true) {
	for (let i = 0; i < n / 4; i++) {
		const source = sources[i];
		create_computation_1(source, attached);
		create_computation_1(source, attached);
		create_computation_1(source, attached);
		create_computation_1(source, attached);
	}
}

function create_computations_1to8(n, sources, attached = true) {
	for (let i = 0; i < n / 8; i++) {
		const source = sources[i];
		create_computation_1(source, attached);
		create_computation_1(source, attached);
		create_computation_1(source, attached);
		create_computation_1(source, attached);
		create_computation_1(source, attached);
		create_computation_1(source, attached);
		create_computation_1(source, attached);
		create_computation_1(source, attached);
	}
}

function create_computations_1to1000(n, sources, attached = true) {
	for (let i = 0; i < n / 1000; i++) {
		const source = sources[i];
		for (let j = 0; j < 1000; j++) {
			create_computation_1(source, attached);
		}
	}
}

function create_computations_4to1(n, sources, attached = true) {
	for (let i = 0; i < n; i++) {
		create_computation_4(
			sources[i * 4],
			sources[i * 4 + 1],
			sources[i * 4 + 2],
			sources[i * 4 + 3],
			attached
		);
	}
}

/**
 * @param {any} fn
 * @param {number} count
 * @param {number} scount
 */
function bench(fn, count, scount, attached = true) {
	let sources = create_data_signals(scount, []);

	fn(count, sources, attached);
}

export async function sbench_create_signals() {
	// Do 3 loops to warm up JIT
	for (let i = 0; i < 3; i++) {
		bench(create_data_signals, COUNT, COUNT);
	}

	const { timing } = await fastest_test(10, () => {
		for (let i = 0; i < 100; i++) {
			bench(create_data_signals, COUNT, COUNT);
		}
	});

	return {
		benchmark: 'sbench_create_signals',
		time: timing.time.toFixed(2),
		gc_time: timing.gc_time.toFixed(2)
	};
}

export async function sbench_create_0to1() {
	// Do 3 loops to warm up JIT
	for (let i = 0; i < 3; i++) {
		bench(create_computations_0to1, COUNT, 0, false);
	}

	const { timing } = await fastest_test(10, () => {
		const destroy = $.effect_root(() => {
			for (let i = 0; i < 10; i++) {
				bench(create_computations_0to1, COUNT, 0, false);
			}
		});
		destroy();
	});

	return {
		benchmark: 'sbench_create_0to1',
		time: timing.time.toFixed(2),
		gc_time: timing.gc_time.toFixed(2)
	};
}

export async function sbench_create_0to1_attached() {
	// Do 3 loops to warm up JIT
	for (let i = 0; i < 3; i++) {
		bench(create_computations_0to1, COUNT, 0, true);
	}

	const { timing } = await fastest_test(10, () => {
		const destroy = $.effect_root(() => {
			for (let i = 0; i < 10; i++) {
				bench(create_computations_0to1, COUNT, 0, true);
			}
		});
		destroy();
	});

	return {
		benchmark: 'sbench_create_0to1_attached',
		time: timing.time.toFixed(2),
		gc_time: timing.gc_time.toFixed(2)
	};
}

export async function sbench_create_1to1() {
	// Do 3 loops to warm up JIT
	for (let i = 0; i < 3; i++) {
		bench(create_computations_1to1, COUNT, COUNT, false);
	}

	const { timing } = await fastest_test(10, () => {
		const destroy = $.effect_root(() => {
			for (let i = 0; i < 10; i++) {
				bench(create_computations_1to1, COUNT, COUNT, false);
			}
		});
		destroy();
	});

	return {
		benchmark: 'sbench_create_1to1',
		time: timing.time.toFixed(2),
		gc_time: timing.gc_time.toFixed(2)
	};
}

export async function sbench_create_1to1_attached() {
	// Do 3 loops to warm up JIT
	for (let i = 0; i < 3; i++) {
		bench(create_computations_1to1, COUNT, COUNT, true);
	}

	const { timing } = await fastest_test(10, () => {
		const destroy = $.effect_root(() => {
			for (let i = 0; i < 10; i++) {
				bench(create_computations_1to1, COUNT, COUNT, true);
			}
		});
		destroy();
	});

	return {
		benchmark: 'sbench_create_1to1_attached',
		time: timing.time.toFixed(2),
		gc_time: timing.gc_time.toFixed(2)
	};
}

export async function sbench_create_2to1() {
	// Do 3 loops to warm up JIT
	for (let i = 0; i < 3; i++) {
		bench(create_computations_2to1, COUNT / 2, COUNT, false);
	}

	const { timing } = await fastest_test(10, () => {
		const destroy = $.effect_root(() => {
			for (let i = 0; i < 10; i++) {
				bench(create_computations_2to1, COUNT / 2, COUNT, false);
			}
		});
		destroy();
	});

	return {
		benchmark: 'sbench_create_2to1',
		time: timing.time.toFixed(2),
		gc_time: timing.gc_time.toFixed(2)
	};
}

export async function sbench_create_2to1_attached() {
	// Do 3 loops to warm up JIT
	for (let i = 0; i < 3; i++) {
		bench(create_computations_2to1, COUNT / 2, COUNT, true);
	}

	const { timing } = await fastest_test(10, () => {
		const destroy = $.effect_root(() => {
			for (let i = 0; i < 10; i++) {
				bench(create_computations_2to1, COUNT / 2, COUNT, true);
			}
		});
		destroy();
	});

	return {
		benchmark: 'sbench_create_2to1_attached',
		time: timing.time.toFixed(2),
		gc_time: timing.gc_time.toFixed(2)
	};
}

export async function sbench_create_4to1() {
	// Do 3 loops to warm up JIT
	for (let i = 0; i < 3; i++) {
		bench(create_computations_4to1, COUNT / 4, COUNT, false);
	}

	const { timing } = await fastest_test(10, () => {
		const destroy = $.effect_root(() => {
			for (let i = 0; i < 10; i++) {
				bench(create_computations_4to1, COUNT / 4, COUNT, false);
			}
		});
		destroy();
	});

	return {
		benchmark: 'sbench_create_4to1',
		time: timing.time.toFixed(2),
		gc_time: timing.gc_time.toFixed(2)
	};
}

export async function sbench_create_4to1_attached() {
	// Do 3 loops to warm up JIT
	for (let i = 0; i < 3; i++) {
		bench(create_computations_4to1, COUNT / 4, COUNT, true);
	}

	const { timing } = await fastest_test(10, () => {
		const destroy = $.effect_root(() => {
			for (let i = 0; i < 10; i++) {
				bench(create_computations_4to1, COUNT / 4, COUNT, true);
			}
		});
		destroy();
	});

	return {
		benchmark: 'sbench_create_4to1_attached',
		time: timing.time.toFixed(2),
		gc_time: timing.gc_time.toFixed(2)
	};
}

export async function sbench_create_1000to1() {
	// Do 3 loops to warm up JIT
	for (let i = 0; i < 3; i++) {
		bench(create_computations_1000to1, COUNT / 1000, COUNT, false);
	}

	const { timing } = await fastest_test(10, () => {
		const destroy = $.effect_root(() => {
			for (let i = 0; i < 10; i++) {
				bench(create_computations_1000to1, COUNT / 1000, COUNT, false);
			}
		});
		destroy();
	});

	return {
		benchmark: 'sbench_create_1000to1',
		time: timing.time.toFixed(2),
		gc_time: timing.gc_time.toFixed(2)
	};
}

export async function sbench_create_1000to1_attached() {
	// Do 3 loops to warm up JIT
	for (let i = 0; i < 3; i++) {
		bench(create_computations_1000to1, COUNT / 1000, COUNT, true);
	}

	const { timing } = await fastest_test(10, () => {
		const destroy = $.effect_root(() => {
			for (let i = 0; i < 10; i++) {
				bench(create_computations_1000to1, COUNT / 1000, COUNT, true);
			}
		});
		destroy();
	});

	return {
		benchmark: 'sbench_create_1000to1_attached',
		time: timing.time.toFixed(2),
		gc_time: timing.gc_time.toFixed(2)
	};
}

export async function sbench_create_1to2() {
	// Do 3 loops to warm up JIT
	for (let i = 0; i < 3; i++) {
		bench(create_computations_1to2, COUNT, COUNT / 2, false);
	}

	const { timing } = await fastest_test(10, () => {
		const destroy = $.effect_root(() => {
			for (let i = 0; i < 10; i++) {
				bench(create_computations_1to2, COUNT, COUNT / 2, false);
			}
		});
		destroy();
	});

	return {
		benchmark: 'sbench_create_1to2',
		time: timing.time.toFixed(2),
		gc_time: timing.gc_time.toFixed(2)
	};
}

export async function sbench_create_1to2_attached() {
	// Do 3 loops to warm up JIT
	for (let i = 0; i < 3; i++) {
		bench(create_computations_1to2, COUNT, COUNT / 2, true);
	}

	const { timing } = await fastest_test(10, () => {
		const destroy = $.effect_root(() => {
			for (let i = 0; i < 10; i++) {
				bench(create_computations_1to2, COUNT, COUNT / 2, true);
			}
		});
		destroy();
	});

	return {
		benchmark: 'sbench_create_1to2_attached',
		time: timing.time.toFixed(2),
		gc_time: timing.gc_time.toFixed(2)
	};
}

export async function sbench_create_1to4() {
	// Do 3 loops to warm up JIT
	for (let i = 0; i < 3; i++) {
		bench(create_computations_1to4, COUNT, COUNT / 4, false);
	}

	const { timing } = await fastest_test(10, () => {
		const destroy = $.effect_root(() => {
			for (let i = 0; i < 10; i++) {
				bench(create_computations_1to4, COUNT, COUNT / 4, false);
			}
		});
		destroy();
	});

	return {
		benchmark: 'sbench_create_1to4',
		time: timing.time.toFixed(2),
		gc_time: timing.gc_time.toFixed(2)
	};
}

export async function sbench_create_1to4_attached() {
	// Do 3 loops to warm up JIT
	for (let i = 0; i < 3; i++) {
		bench(create_computations_1to4, COUNT, COUNT / 4, true);
	}

	const { timing } = await fastest_test(10, () => {
		const destroy = $.effect_root(() => {
			for (let i = 0; i < 10; i++) {
				bench(create_computations_1to4, COUNT, COUNT / 4, true);
			}
		});
		destroy();
	});

	return {
		benchmark: 'sbench_create_1to4_attached',
		time: timing.time.toFixed(2),
		gc_time: timing.gc_time.toFixed(2)
	};
}

export async function sbench_create_1to8() {
	// Do 3 loops to warm up JIT
	for (let i = 0; i < 3; i++) {
		bench(create_computations_1to8, COUNT, COUNT / 8, false);
	}

	const { timing } = await fastest_test(10, () => {
		const destroy = $.effect_root(() => {
			for (let i = 0; i < 10; i++) {
				bench(create_computations_1to8, COUNT, COUNT / 8, false);
			}
		});
		destroy();
	});

	return {
		benchmark: 'sbench_create_1to8',
		time: timing.time.toFixed(2),
		gc_time: timing.gc_time.toFixed(2)
	};
}

export async function sbench_create_1to8_attached() {
	// Do 3 loops to warm up JIT
	for (let i = 0; i < 3; i++) {
		bench(create_computations_1to8, COUNT, COUNT / 8, true);
	}

	const { timing } = await fastest_test(10, () => {
		const destroy = $.effect_root(() => {
			for (let i = 0; i < 10; i++) {
				bench(create_computations_1to8, COUNT, COUNT / 8, true);
			}
		});
		destroy();
	});

	return {
		benchmark: 'sbench_create_1to8_attached',
		time: timing.time.toFixed(2),
		gc_time: timing.gc_time.toFixed(2)
	};
}

export async function sbench_create_1to1000() {
	// Do 3 loops to warm up JIT
	for (let i = 0; i < 3; i++) {
		bench(create_computations_1to1000, COUNT, COUNT / 1000, false);
	}

	const { timing } = await fastest_test(10, () => {
		const destroy = $.effect_root(() => {
			for (let i = 0; i < 10; i++) {
				bench(create_computations_1to1000, COUNT, COUNT / 1000, false);
			}
		});
		destroy();
	});

	return {
		benchmark: 'sbench_create_1to1000',
		time: timing.time.toFixed(2),
		gc_time: timing.gc_time.toFixed(2)
	};
}

export async function sbench_create_1to1000_attached() {
	// Do 3 loops to warm up JIT
	for (let i = 0; i < 3; i++) {
		bench(create_computations_1to1000, COUNT, COUNT / 1000, true);
	}

	const { timing } = await fastest_test(10, () => {
		const destroy = $.effect_root(() => {
			for (let i = 0; i < 10; i++) {
				bench(create_computations_1to1000, COUNT, COUNT / 1000, true);
			}
		});
		destroy();
	});

	return {
		benchmark: 'sbench_create_1to1000_attached',
		time: timing.time.toFixed(2),
		gc_time: timing.gc_time.toFixed(2)
	};
}
