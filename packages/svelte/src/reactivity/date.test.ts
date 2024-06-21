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

test('date.setDate and date.setUTCDate', () => {
	const date = new ReactiveDate(initial_date);
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
		date.setDate(new_dates[0].getDate());
	});

	flushSync(() => {
		date.setDate(new_dates[1].getDate());
	});

	flushSync(() => {
		date.setDate(new_dates[1].getDate()); // no change expected
	});

	flushSync(() => {
		date.setUTCDate(new_dates[2].getUTCDate());
	});

	assert.deepEqual(log, [
		initial_date.getDate(),
		initial_date.getUTCDate(),
		new_dates[0].getDate(),
		new_dates[0].getUTCDate(),
		new_dates[1].getDate(),
		new_dates[1].getUTCDate(),
		new_dates[2].getDate(),
		new_dates[2].getUTCDate()
	]);

	cleanup();
});

test('date.setFullYear and date.setUTCFullYear', () => {
	const date = new ReactiveDate(initial_date);
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
		date.setFullYear(new_dates[0].getFullYear());
	});

	flushSync(() => {
		date.setFullYear(new_dates[1].getFullYear());
	});

	flushSync(() => {
		date.setFullYear(new_dates[1].getFullYear()); // no change expected
	});

	flushSync(() => {
		date.setUTCFullYear(new_dates[2].getUTCFullYear());
	});

	assert.deepEqual(log, [
		initial_date.getFullYear(),
		initial_date.getUTCFullYear(),
		new_dates[0].getFullYear(),
		new_dates[0].getUTCFullYear(),
		new_dates[1].getFullYear(),
		new_dates[1].getUTCFullYear(),
		new_dates[2].getFullYear(),
		new_dates[2].getUTCFullYear()
	]);

	cleanup();
});

test('date.setHours and date.setUTCHours', () => {
	const date = new ReactiveDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getHours());
		});
		render_effect(() => {
			log.push(date.getUTCHours());
		});
	});

	flushSync(() => {
		date.setHours(new_dates[0].getHours());
	});

	flushSync(() => {
		date.setHours(new_dates[1].getHours());
	});

	flushSync(() => {
		date.setHours(new_dates[1].getHours()); // no change expected
	});

	flushSync(() => {
		date.setUTCHours(new_dates[2].getUTCHours());
	});

	assert.deepEqual(log, [
		initial_date.getHours(),
		initial_date.getUTCHours(),
		new_dates[0].getHours(),
		new_dates[0].getUTCHours(),
		new_dates[1].getHours(),
		new_dates[1].getUTCHours(),
		new_dates[2].getHours(),
		new_dates[2].getUTCHours()
	]);

	cleanup();
});

test('date.setMilliseconds and date.setUTCMilliseconds', () => {
	const date = new ReactiveDate(initial_date);
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
		date.setMilliseconds(new_dates[0].getMilliseconds());
	});

	flushSync(() => {
		date.setMilliseconds(new_dates[1].getMilliseconds());
	});

	flushSync(() => {
		date.setMilliseconds(new_dates[1].getMilliseconds()); // no change expected
	});

	flushSync(() => {
		date.setUTCMilliseconds(new_dates[2].getUTCMilliseconds());
	});

	assert.deepEqual(log, [
		initial_date.getMilliseconds(),
		initial_date.getUTCMilliseconds(),
		new_dates[0].getMilliseconds(),
		new_dates[0].getUTCMilliseconds(),
		new_dates[1].getMilliseconds(),
		new_dates[1].getUTCMilliseconds(),
		new_dates[2].getMilliseconds(),
		new_dates[2].getUTCMilliseconds()
	]);

	cleanup();
});

test('date.setMinutes and date.setUTCMinutes', () => {
	const date = new ReactiveDate(initial_date);
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
		date.setMinutes(new_dates[0].getMinutes());
	});

	flushSync(() => {
		date.setMinutes(new_dates[1].getMinutes());
	});

	flushSync(() => {
		date.setMinutes(new_dates[1].getMinutes()); // no change expected
	});

	flushSync(() => {
		date.setUTCMinutes(new_dates[2].getUTCMinutes());
	});

	assert.deepEqual(log, [
		initial_date.getMinutes(),
		initial_date.getUTCMinutes(),
		new_dates[0].getMinutes(),
		new_dates[0].getUTCMinutes(),
		new_dates[1].getMinutes(),
		new_dates[1].getUTCMinutes(),
		new_dates[2].getMinutes(),
		new_dates[2].getUTCMinutes()
	]);

	cleanup();
});

test('date.setMonth and date.setUTCMonth', () => {
	const date = new ReactiveDate(initial_date);
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
		date.setMonth(new_dates[0].getMonth());
	});

	flushSync(() => {
		date.setMonth(new_dates[1].getMonth());
	});

	flushSync(() => {
		date.setMonth(new_dates[1].getMonth()); // no change expected
	});

	flushSync(() => {
		date.setUTCMonth(new_dates[2].getUTCMonth());
	});

	assert.deepEqual(log, [
		initial_date.getMonth(),
		initial_date.getUTCMonth(),
		new_dates[0].getMonth(),
		new_dates[0].getUTCMonth(),
		new_dates[1].getMonth(),
		new_dates[1].getUTCMonth(),
		new_dates[2].getMonth(),
		new_dates[2].getUTCMonth()
	]);

	cleanup();
});

test('date.setSeconds and date.setUTCSeconds', () => {
	const date = new ReactiveDate(initial_date);
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
		date.setSeconds(new_dates[0].getSeconds());
	});

	flushSync(() => {
		date.setSeconds(new_dates[1].getSeconds());
	});

	flushSync(() => {
		date.setSeconds(new_dates[1].getSeconds()); // no change expected
	});

	flushSync(() => {
		date.setUTCSeconds(new_dates[2].getUTCSeconds());
	});

	assert.deepEqual(log, [
		initial_date.getSeconds(),
		initial_date.getUTCSeconds(),
		new_dates[0].getSeconds(),
		new_dates[0].getUTCSeconds(),
		new_dates[1].getSeconds(),
		new_dates[1].getUTCSeconds(),
		new_dates[2].getSeconds(),
		new_dates[2].getUTCSeconds()
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

test('Date fine grained tests', () => {
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
	assert.equal(new ReactiveDate() instanceof Date, true);
});
