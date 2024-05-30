import { render_effect, effect_root } from '../internal/client/reactivity/effects.js';
import { flushSync } from '../index-client.js';
import { ReactiveDate } from './date.js';
import { assert, test } from 'vitest';

const initial_date = new ReactiveDate('2023-01-01T00:00:00.000Z');
const new_dates = [
	new Date('2024-02-02T01:01:01.001Z'),
	new Date('2025-03-03T02:02:02.002Z'),
	new Date('2026-04-04T03:03:03.003Z')
];

test('date.setDate', () => {
	const date = new ReactiveDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getDate());
		});
	});

	flushSync(() => {
		date.setDate(new_dates[0].getDate());
	});

	flushSync(() => {
		date.setDate(new_dates[1].getDate());
	});

	flushSync(() => {
		// nothing should happen here
		date.setDate(new_dates[1].getDate());
	});

	assert.deepEqual(log, [initial_date.getDate(), new_dates[0].getDate(), new_dates[1].getDate()]);

	cleanup();
});

test('date.setFullYear', () => {
	const date = new ReactiveDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getFullYear());
		});
	});

	flushSync(() => {
		date.setFullYear(new_dates[0].getFullYear());
	});

	flushSync(() => {
		date.setFullYear(new_dates[1].getFullYear());
	});

	flushSync(() => {
		// nothing should happen here
		date.setFullYear(new_dates[1].getFullYear());
	});

	assert.deepEqual(log, [
		initial_date.getFullYear(),
		new_dates[0].getFullYear(),
		new_dates[1].getFullYear()
	]);

	cleanup();
});

test('date.setHours', () => {
	const date = new ReactiveDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getHours());
		});
	});

	flushSync(() => {
		date.setHours(new_dates[0].getHours());
	});

	flushSync(() => {
		date.setHours(new_dates[1].getHours());
	});

	flushSync(() => {
		// nothing should happen here
		date.setHours(new_dates[1].getHours());
	});

	assert.deepEqual(log, [
		initial_date.getHours(),
		new_dates[0].getHours(),
		new_dates[1].getHours()
	]);

	cleanup();
});

test('date.setMilliseconds', () => {
	const date = new ReactiveDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getMilliseconds());
		});
	});

	flushSync(() => {
		date.setMilliseconds(new_dates[0].getMilliseconds());
	});

	flushSync(() => {
		date.setMilliseconds(new_dates[1].getMilliseconds());
	});

	flushSync(() => {
		// nothing should happen here
		date.setMilliseconds(new_dates[1].getMilliseconds());
	});

	assert.deepEqual(log, [
		initial_date.getMilliseconds(),
		new_dates[0].getMilliseconds(),
		new_dates[1].getMilliseconds()
	]);

	cleanup();
});

test('date.setMinutes', () => {
	const date = new ReactiveDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getMinutes());
		});
	});

	flushSync(() => {
		date.setMinutes(new_dates[0].getMinutes());
	});

	flushSync(() => {
		date.setMinutes(new_dates[1].getMinutes());
	});

	flushSync(() => {
		// nothing should happen here
		date.setMinutes(new_dates[1].getMinutes());
	});

	assert.deepEqual(log, [
		initial_date.getMinutes(),
		new_dates[0].getMinutes(),
		new_dates[1].getMinutes()
	]);

	cleanup();
});

test('date.setMonth', () => {
	const date = new ReactiveDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getMonth());
		});
	});

	flushSync(() => {
		date.setMonth(new_dates[0].getMonth());
	});

	flushSync(() => {
		date.setMonth(new_dates[1].getMonth());
	});

	flushSync(() => {
		// nothing should happen here
		date.setMonth(new_dates[1].getMonth());
	});

	assert.deepEqual(log, [
		initial_date.getMonth(),
		new_dates[0].getMonth(),
		new_dates[1].getMonth()
	]);

	cleanup();
});

test('date.setSeconds', () => {
	const date = new ReactiveDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getSeconds());
		});
	});

	flushSync(() => {
		date.setSeconds(new_dates[0].getSeconds());
	});

	flushSync(() => {
		date.setSeconds(new_dates[1].getSeconds());
	});

	flushSync(() => {
		// nothing should happen here
		date.setSeconds(new_dates[1].getSeconds());
	});

	assert.deepEqual(log, [
		initial_date.getSeconds(),
		new_dates[0].getSeconds(),
		new_dates[1].getSeconds()
	]);

	cleanup();
});

test('date.setTime', () => {
	const date = new ReactiveDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getTime());
		});
	});

	flushSync(() => {
		date.setTime(new_dates[0].getTime());
	});

	flushSync(() => {
		date.setTime(new_dates[1].getTime());
	});

	flushSync(() => {
		// nothing should happen here
		date.setTime(new_dates[1].getTime());
	});

	assert.deepEqual(log, [initial_date.getTime(), new_dates[0].getTime(), new_dates[1].getTime()]);

	cleanup();
});

test('date.setUTCDate', () => {
	const date = new ReactiveDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getUTCDate());
		});
	});

	flushSync(() => {
		date.setUTCDate(new_dates[0].getUTCDate());
	});

	flushSync(() => {
		date.setUTCDate(new_dates[1].getUTCDate());
	});

	flushSync(() => {
		// nothing should happen here
		date.setUTCDate(new_dates[1].getUTCDate());
	});

	assert.deepEqual(log, [
		initial_date.getUTCDate(),
		new_dates[0].getUTCDate(),
		new_dates[1].getUTCDate()
	]);

	cleanup();
});

test('date.setUTCFullYear', () => {
	const date = new ReactiveDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getUTCFullYear());
		});
	});

	flushSync(() => {
		date.setUTCFullYear(new_dates[0].getUTCFullYear());
	});

	flushSync(() => {
		date.setUTCFullYear(new_dates[1].getUTCFullYear());
	});

	flushSync(() => {
		// nothing should happen here
		date.setUTCFullYear(new_dates[1].getUTCFullYear());
	});

	assert.deepEqual(log, [
		initial_date.getUTCFullYear(),
		new_dates[0].getUTCFullYear(),
		new_dates[1].getUTCFullYear()
	]);

	cleanup();
});

test('date.setUTCHours', () => {
	const date = new ReactiveDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getUTCHours());
		});
	});

	flushSync(() => {
		date.setUTCHours(new_dates[0].getUTCHours());
	});

	flushSync(() => {
		date.setUTCHours(new_dates[1].getUTCHours());
	});

	flushSync(() => {
		// nothing should happen here
		date.setUTCHours(new_dates[1].getUTCHours());
	});

	assert.deepEqual(log, [
		initial_date.getUTCHours(),
		new_dates[0].getUTCHours(),
		new_dates[1].getUTCHours()
	]);

	cleanup();
});

test('date.setUTCMilliseconds', () => {
	const date = new ReactiveDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getUTCMilliseconds());
		});
	});

	flushSync(() => {
		date.setUTCMilliseconds(new_dates[0].getUTCMilliseconds());
	});

	flushSync(() => {
		date.setUTCMilliseconds(new_dates[1].getUTCMilliseconds());
	});

	flushSync(() => {
		// nothing should happen here
		date.setUTCMilliseconds(new_dates[1].getUTCMilliseconds());
	});

	assert.deepEqual(log, [
		initial_date.getUTCMilliseconds(),
		new_dates[0].getUTCMilliseconds(),
		new_dates[1].getUTCMilliseconds()
	]);

	cleanup();
});

test('date.setUTCMinutes', () => {
	const date = new ReactiveDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getUTCMinutes());
		});
	});

	flushSync(() => {
		date.setUTCMinutes(new_dates[0].getUTCMinutes());
	});

	flushSync(() => {
		date.setUTCMinutes(new_dates[1].getUTCMinutes());
	});

	flushSync(() => {
		// nothing should happen here
		date.setUTCMinutes(new_dates[1].getUTCMinutes());
	});

	assert.deepEqual(log, [
		initial_date.getUTCMinutes(),
		new_dates[0].getUTCMinutes(),
		new_dates[1].getUTCMinutes()
	]);

	cleanup();
});

test('date.setUTCMonth', () => {
	const date = new ReactiveDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getUTCMonth());
		});
	});

	flushSync(() => {
		date.setUTCMonth(new_dates[0].getUTCMonth());
	});

	flushSync(() => {
		date.setUTCMonth(new_dates[1].getUTCMonth());
	});

	flushSync(() => {
		// nothing should happen here
		date.setUTCMonth(new_dates[1].getUTCMonth());
	});

	assert.deepEqual(log, [
		initial_date.getUTCMonth(),
		new_dates[0].getUTCMonth(),
		new_dates[1].getUTCMonth()
	]);

	cleanup();
});

test('date.setUTCSeconds', () => {
	const date = new ReactiveDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getUTCSeconds());
		});
	});

	flushSync(() => {
		date.setUTCSeconds(new_dates[0].getUTCSeconds());
	});

	flushSync(() => {
		date.setUTCSeconds(new_dates[1].getUTCSeconds());
	});

	flushSync(() => {
		// nothing should happen here
		date.setUTCSeconds(new_dates[1].getUTCSeconds());
	});

	assert.deepEqual(log, [
		initial_date.getUTCSeconds(),
		new_dates[0].getUTCSeconds(),
		new_dates[1].getUTCSeconds()
	]);

	cleanup();
});

test('date.setYear', () => {
	const date = new ReactiveDate(initial_date);
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
	const date = new ReactiveDate(initial_date);
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
	const date = new ReactiveDate(initial_date);
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

test('date fine grained tests', () => {
	const date = new ReactiveDate(initial_date);

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
		getUTCMilliseconds: true
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
			getUTCDay: true
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
			getUTCMilliseconds: true
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
			getUTCMilliseconds: true
		};
		test_description = 'changing month';
		date.setMonth(date.getMonth() + 1);
	});

	cleanup();
});

test('Date.instanceOf', () => {
	assert.equal(new ReactiveDate() instanceof Date, true);
});
