import {
	kairo_avoidable_owned,
	kairo_avoidable_unowned
} from './benchmarks/kairo/kairo_avoidable.js';
import { kairo_broad_owned, kairo_broad_unowned } from './benchmarks/kairo/kairo_broad.js';
import { kairo_deep_owned, kairo_deep_unowned } from './benchmarks/kairo/kairo_deep.js';
import { kairo_diamond_owned, kairo_diamond_unowned } from './benchmarks/kairo/kairo_diamond.js';
import { kairo_mux_unowned, kairo_mux_owned } from './benchmarks/kairo/kairo_mux.js';
import { kairo_repeated_unowned, kairo_repeated_owned } from './benchmarks/kairo/kairo_repeated.js';
import { kairo_triangle_owned, kairo_triangle_unowned } from './benchmarks/kairo/kairo_triangle.js';
import { kairo_unstable_owned, kairo_unstable_unowned } from './benchmarks/kairo/kairo_unstable.js';
import { mol_bench_owned, mol_bench_unowned } from './benchmarks/mol_bench.js';
import {
	sbench_create_0to1,
	sbench_create_1000to1,
	sbench_create_1to1,
	sbench_create_1to1000,
	sbench_create_1to2,
	sbench_create_1to4,
	sbench_create_1to8,
	sbench_create_2to1,
	sbench_create_4to1,
	sbench_create_signals
} from './benchmarks/sbench.js';

// This benchmark has been adapted from the js-reactivity-benchmark (https://github.com/milomg/js-reactivity-benchmark)
// Not all tests are the same, and many parts have been tweaked to capture different data.

export const benchmarks = [
	sbench_create_signals,
	sbench_create_0to1,
	sbench_create_1to1,
	sbench_create_2to1,
	sbench_create_4to1,
	sbench_create_1000to1,
	sbench_create_1to2,
	sbench_create_1to4,
	sbench_create_1to8,
	sbench_create_1to1000,
	kairo_avoidable_owned,
	kairo_avoidable_unowned,
	kairo_broad_owned,
	kairo_broad_unowned,
	kairo_deep_owned,
	kairo_deep_unowned,
	kairo_diamond_owned,
	kairo_diamond_unowned,
	kairo_triangle_owned,
	kairo_triangle_unowned,
	kairo_mux_owned,
	kairo_mux_unowned,
	kairo_repeated_owned,
	kairo_repeated_unowned,
	kairo_unstable_owned,
	kairo_unstable_unowned,
	mol_bench_owned,
	mol_bench_unowned
];
