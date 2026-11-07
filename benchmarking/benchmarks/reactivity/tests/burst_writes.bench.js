import assert from 'node:assert';
import * as $ from 'svelte/internal/client';

export default () => {
	const value = $.state(0);
	const values = Array(100).fill(0);
	const destroy = $.effect_root(() => {
		for (let i = 0; i < values.length; i++) {
			const computed = $.derived(() => `[${$.get(value)}]`);
			$.render_effect(() => {
				values[i] = $.get(computed);
			});
		}
	});

	return {
		destroy,
		run() {
			const start = $.get(value);
			for (let i = 1; i <= 100; i++) $.set(value, start + i);
			$.flush();
			assert.ok(values.every((v) => v === `[${start + 100}]`));
		}
	};
};
