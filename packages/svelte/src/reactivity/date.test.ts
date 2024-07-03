import { render_effect, effect_root } from '../internal/client/reactivity/effects.js';
import { flushSync } from '../index-client.js';
import { SvelteDate } from './date.js';
import { assert, test } from 'vitest';

const initial_date = new Date(2023, 0, 2, 0, 0, 0, 0);
const a = new Date(2024, 1, 3, 1, 1, 1, 1);
const b = new Date(2025, 2, 4, 2, 2, 2, 2);
const c = new Date(2026, 3, 5, 3, 3, 3, 3);

test('date.setDate and date.setUTCDate', () => {
	const date = new SvelteDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getDate());
		});
		render_effect(() => {
			log.push(date.getUTCDate());
		});
	});

	flushSync(() => {
		date.setDate(a.getDate());
	});

	flushSync(() => {
		date.setDate(date.getDate() + 1);
	});

	flushSync(() => {
		date.setDate(date.getDate()); // no change expected
	});

	flushSync(() => {
		date.setUTCDate(date.getUTCDate() + 1);
	});

	assert.deepEqual(log, [
		initial_date.getDate(),
		initial_date.getUTCDate(),
		a.getDate(),
		a.getUTCDate(),
		a.getDate() + 1,
		a.getUTCDate() + 1,
		a.getDate() + 2,
		a.getUTCDate() + 2
	]);

	cleanup();
});

test('date.setFullYear and date.setUTCFullYear', () => {
	const date = new SvelteDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getFullYear());
		});
		render_effect(() => {
			log.push(date.getUTCFullYear());
		});
	});

	flushSync(() => {
		date.setFullYear(a.getFullYear());
	});

	flushSync(() => {
		date.setFullYear(b.getFullYear());
	});

	flushSync(() => {
		date.setFullYear(b.getFullYear()); // no change expected
	});

	flushSync(() => {
		date.setUTCFullYear(c.getUTCFullYear());
	});

	assert.deepEqual(log, [
		initial_date.getFullYear(),
		initial_date.getUTCFullYear(),
		a.getFullYear(),
		a.getUTCFullYear(),
		b.getFullYear(),
		b.getUTCFullYear(),
		c.getFullYear(),
		c.getUTCFullYear()
	]);

	cleanup();
});

test('date.setHours and date.setUTCHours', () => {
	const date = new SvelteDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getHours() % 24);
		});
		render_effect(() => {
			log.push(date.getUTCHours() % 24);
		});
	});

	flushSync(() => {
		date.setHours(a.getHours());
	});

	flushSync(() => {
		date.setHours(date.getHours() + 1);
	});

	flushSync(() => {
		date.setHours(date.getHours()); // no change expected
	});

	flushSync(() => {
		date.setUTCHours(date.getUTCHours() + 1);
	});

	assert.deepEqual(log, [
		initial_date.getHours(),
		initial_date.getUTCHours(),
		a.getHours() % 24,
		a.getUTCHours() % 24,
		(a.getHours() + 1) % 24,
		(a.getUTCHours() + 1) % 24,
		(a.getHours() + 2) % 24,
		(a.getUTCHours() + 2) % 24
	]);

	cleanup();
});

test('date.setMilliseconds and date.setUTCMilliseconds', () => {
	const date = new SvelteDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getMilliseconds());
		});
		render_effect(() => {
			log.push(date.getUTCMilliseconds());
		});
	});

	flushSync(() => {
		date.setMilliseconds(a.getMilliseconds());
	});

	flushSync(() => {
		date.setMilliseconds(b.getMilliseconds());
	});

	flushSync(() => {
		date.setMilliseconds(b.getMilliseconds()); // no change expected
	});

	flushSync(() => {
		date.setUTCMilliseconds(c.getUTCMilliseconds());
	});

	assert.deepEqual(log, [
		initial_date.getMilliseconds(),
		initial_date.getUTCMilliseconds(),
		a.getMilliseconds(),
		a.getUTCMilliseconds(),
		b.getMilliseconds(),
		b.getUTCMilliseconds(),
		c.getMilliseconds(),
		c.getUTCMilliseconds()
	]);

	cleanup();
});

test('date.setMinutes and date.setUTCMinutes', () => {
	const date = new SvelteDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getMinutes());
		});
		render_effect(() => {
			log.push(date.getUTCMinutes());
		});
	});

	flushSync(() => {
		date.setMinutes(a.getMinutes());
	});

	flushSync(() => {
		date.setMinutes(b.getMinutes());
	});

	flushSync(() => {
		date.setMinutes(b.getMinutes()); // no change expected
	});

	flushSync(() => {
		date.setUTCMinutes(c.getUTCMinutes());
	});

	assert.deepEqual(log, [
		initial_date.getMinutes(),
		initial_date.getUTCMinutes(),
		a.getMinutes(),
		a.getUTCMinutes(),
		b.getMinutes(),
		b.getUTCMinutes(),
		c.getMinutes(),
		c.getUTCMinutes()
	]);

	cleanup();
});

test('date.setMonth and date.setUTCMonth', () => {
	const date = new SvelteDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getMonth());
		});
		render_effect(() => {
			log.push(date.getUTCMonth());
		});
	});

	flushSync(() => {
		date.setMonth(a.getMonth());
	});

	flushSync(() => {
		date.setMonth(b.getMonth());
	});

	flushSync(() => {
		date.setMonth(b.getMonth()); // no change expected
	});

	flushSync(() => {
		date.setUTCMonth(c.getUTCMonth());
	});

	assert.deepEqual(log, [
		initial_date.getMonth(),
		initial_date.getUTCMonth(),
		a.getMonth(),
		a.getUTCMonth(),
		b.getMonth(),
		b.getUTCMonth(),
		c.getMonth(),
		c.getUTCMonth()
	]);

	cleanup();
});

test('date.setSeconds and date.setUTCSeconds', () => {
	const date = new SvelteDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getSeconds());
		});
		render_effect(() => {
			log.push(date.getUTCSeconds());
		});
	});

	flushSync(() => {
		date.setSeconds(a.getSeconds());
	});

	flushSync(() => {
		date.setSeconds(b.getSeconds());
	});

	flushSync(() => {
		date.setSeconds(b.getSeconds()); // no change expected
	});

	flushSync(() => {
		date.setUTCSeconds(c.getUTCSeconds());
	});

	assert.deepEqual(log, [
		initial_date.getSeconds(),
		initial_date.getUTCSeconds(),
		a.getSeconds(),
		a.getUTCSeconds(),
		b.getSeconds(),
		b.getUTCSeconds(),
		c.getSeconds(),
		c.getUTCSeconds()
	]);

	cleanup();
});

test('date.setTime', () => {
	const date = new SvelteDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getTime());
		});
	});

	flushSync(() => {
		date.setTime(a.getTime());
	});

	flushSync(() => {
		date.setTime(b.getTime());
	});

	flushSync(() => {
		// nothing should happen here
		date.setTime(b.getTime());
	});

	assert.deepEqual(log, [initial_date.getTime(), a.getTime(), b.getTime()]);

	cleanup();
});

test('date.setYear', () => {
	const date = new SvelteDate(initial_date);
	const log: any = [];

	// @ts-expect-error
	if (!date.setYear) {
		return;
	}
	const cleanup = effect_root(() => {
		render_effect(() => {
			// @ts-expect-error
			log.push(date.getYear());
		});
	});

	flushSync(() => {
		// @ts-expect-error
		date.setYear(22);
	});

	flushSync(() => {
		// @ts-expect-error
		date.setYear(23);
	});

	flushSync(() => {
		// nothing should happen here
		// @ts-expect-error
		date.setYear(23);
	});

	// @ts-expect-error
	assert.deepEqual(log, [initial_date.getYear(), 22, 23]);

	cleanup();
});

test('date.setSeconds - edge cases', () => {
	const date = new SvelteDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getSeconds());
		});
		render_effect(() => {
			log.push(date.getMinutes());
		});
	});

	flushSync(() => {
		date.setSeconds(60);
	});

	flushSync(() => {
		date.setSeconds(61);
	});

	assert.deepEqual(log, [
		initial_date.getSeconds(),
		initial_date.getMinutes(),
		initial_date.getMinutes() + 1,
		initial_date.getSeconds() + 1,
		initial_date.getMinutes() + 2
	]);

	cleanup();
});

test('Date propagated changes', () => {
	const date = new SvelteDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getSeconds());
		});
		render_effect(() => {
			log.push(date.getMonth());
		});
		render_effect(() => {
			log.push(date.getFullYear());
		});
	});

	flushSync(() => {
		date.setMonth(13);
	});

	assert.deepEqual(log, [
		initial_date.getSeconds(),
		initial_date.getMonth(),
		initial_date.getFullYear(),
		1,
		2024
	]);

	cleanup();
});

test('Date fine grained tests', () => {
	const date = new SvelteDate(initial_date);

	let changes: Record<string, boolean> = {
		getFullYear: true,
		getUTCFullYear: true,
		getMonth: true,
		getUTCMonth: true,
		getDate: true,
		getUTCDate: true,
		getDay: true,
		getUTCDay: true,
		getHours: true,
		getUTCHours: true,
		getMinutes: true,
		getUTCMinutes: true,
		getSeconds: true,
		getUTCSeconds: true,
		getMilliseconds: true,
		getUTCMilliseconds: true,
		getTime: true,
		toISOString: true,
		toJSON: true,
		toUTCString: true,
		toString: true,
		toLocaleString: true
	};
	let test_description: string = '';

	const expect_all_changes_to_be_false = () => {
		for (const key of Object.keys(changes) as Array<keyof typeof Date>) {
			assert.equal(changes[key], false, `${test_description}: effect for ${key} was not fired`);
		}
	};

	const cleanup = effect_root(() => {
		for (const key of Object.keys(changes)) {
			render_effect(() => {
				// @ts-ignore
				date[key]();
				assert.equal(changes[key], true, `${test_description}: for ${key}`);
				changes[key] = false;
			});
		}
	});

	flushSync(() => {
		expect_all_changes_to_be_false();
		changes = {
			...changes,
			getFullYear: true,
			getUTCFullYear: true,
			getMonth: true,
			getUTCMonth: true,
			getDay: true,
			getUTCDay: true,
			getTime: true,
			toISOString: true,
			toJSON: true,
			toUTCString: true,
			toString: true,
			toLocaleString: true
		};
		test_description = 'changing setFullYear that will cause month/day change as well';
		date.setFullYear(initial_date.getFullYear() + 1, initial_date.getMonth() + 1);
	});

	flushSync(() => {
		expect_all_changes_to_be_false();
		changes = {
			...changes,
			getDate: true,
			getUTCDate: true,
			getDay: true,
			getUTCDay: true,
			getHours: true,
			getUTCHours: true,
			getMinutes: true,
			getUTCMinutes: true,
			getSeconds: true,
			getUTCSeconds: true,
			getMilliseconds: true,
			getUTCMilliseconds: true,
			getTime: true,
			toISOString: true,
			toJSON: true,
			toUTCString: true,
			toString: true,
			toLocaleString: true
		};
		test_description = 'changing seconds that will change day/hour/minutes/seconds/milliseconds';
		date.setSeconds(61 * 60 * 25 + 1, 10);
	});

	flushSync(() => {
		expect_all_changes_to_be_false();
		changes = {
			...changes,
			getMonth: true,
			getUTCMonth: true,
			getDay: true,
			getUTCDay: true,
			getMilliseconds: true,
			getUTCMilliseconds: true,
			getTime: true,
			toISOString: true,
			toJSON: true,
			toUTCString: true,
			toString: true,
			toLocaleString: true
		};
		test_description = 'changing month';
		date.setMonth(date.getMonth() + 1);
	});

	cleanup();
});

test('Date.instanceOf', () => {
	assert.equal(new SvelteDate() instanceof Date, true);
});
