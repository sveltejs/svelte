import { describe, assert, it } from 'vitest';
import { flushSync } from '../../src/index-client';
import * as $ from '../../src/internal/client/runtime';
import { push, pop } from '../../src/internal/client/context';
import {
	effect,
	effect_root,
	render_effect,
	user_effect,
	user_pre_effect
} from '../../src/internal/client/reactivity/effects';
import { state, set, update, update_pre } from '../../src/internal/client/reactivity/sources';
import type { Derived, Effect, Source, Value } from '../../src/internal/client/types';
import { proxy } from '../../src/internal/client/proxy';
import { derived } from '../../src/internal/client/reactivity/deriveds';
import { snapshot } from '../../src/internal/shared/clone.js';
import { SvelteSet } from '../../src/reactivity/set';
import { DESTROYED } from '../../src/internal/client/constants';
import { noop } from 'svelte/internal/client';
import { disable_async_mode_flag, enable_async_mode_flag } from '../../src/internal/flags';

/**
 * @param runes runes mode
 * @param fn A function that returns a function because we first need to setup all the signals
 * 			 and then execute the test in order to simulate a real component
 */
function run_test(runes: boolean, fn: (runes: boolean) => () => void) {
	return () => {
		// Create a component context to test runes vs legacy mode
		push({}, runes);
		// Create a render context so that effect validations etc don't fail
		let execute: any;
		const destroy = effect_root(() => {
			execute = fn(runes);
		});
		pop();
		execute();
		destroy();
	};
}

function test(text: string, fn: (runes: boolean) => any) {
	it(`${text} (legacy mode)`, run_test(false, fn));
	it(`${text} (runes mode)`, run_test(true, fn));
}

test.only = (text: string, fn: (runes: boolean) => any) => {
	it.only(`${text} (legacy mode)`, run_test(false, fn));
	it.only(`${text} (runes mode)`, run_test(true, fn));
};

test.skip = (text: string, fn: (runes: boolean) => any) => {
	it.skip(`${text} (legacy mode)`, run_test(false, fn));
	it.skip(`${text} (runes mode)`, run_test(true, fn));
};

describe('signals', () => {
	test('effect with state and derived in it', () => {
		const log: string[] = [];

		let count = state(0);
		let double = derived(() => $.get(count) * 2);
		effect(() => {
			log.push(`${$.get(count)}:${$.get(double)}`);
		});

		return () => {
			flushSync(() => set(count, 1));
			flushSync(() => set(count, 2));

			assert.deepEqual(log, ['0:0', '1:2', '2:4']);
		};
	});

	test('multiple effects with state and derived in it #1', () => {
		const log: string[] = [];

		let count = state(0);
		let double = derived(() => $.get(count) * 2);

		effect(() => {
			log.push(`A:${$.get(count)}:${$.get(double)}`);
		});
		effect(() => {
			log.push(`B:${$.get(double)}`);
		});

		return () => {
			flushSync(() => set(count, 1));
			flushSync(() => set(count, 2));

			assert.deepEqual(log, ['A:0:0', 'B:0', 'A:1:2', 'B:2', 'A:2:4', 'B:4']);
		};
	});

	test('multiple effects with state and derived in it #2', () => {
		const log: string[] = [];

		let count = state(0);
		let double = derived(() => $.get(count) * 2);

		effect(() => {
			log.push(`A:${$.get(double)}`);
		});
		effect(() => {
			log.push(`B:${$.get(count)}:${$.get(double)}`);
		});

		return () => {
			flushSync(() => set(count, 1));
			flushSync(() => set(count, 2));

			assert.deepEqual(log, ['A:0', 'B:0:0', 'A:2', 'B:1:2', 'A:4', 'B:2:4']);
		};
	});

	test('unowned deriveds are not added as reactions but trigger effects', () => {
		var obj = state<any>(undefined);

		class C1 {
			#v = state(0);
			get v() {
				return $.get(this.#v);
			}
			set v(v: number) {
				set(this.#v, v);
			}
		}

		return () => {
			let d = derived(() => $.get(obj)?.v || '-');

			const log: number[] = [];
			assert.equal($.get(d), '-');

			let destroy = effect_root(() => {
				render_effect(() => {
					log.push($.get(d));
				});
			});

			set(obj, new C1());
			flushSync();
			assert.equal($.get(d), '-');
			$.get(obj).v = 1;
			flushSync();
			assert.equal($.get(d), 1);
			assert.deepEqual(log, ['-', 1]);
			destroy();
			// ensure we're not leaking reactions
			assert.equal(obj.reactions, null);
			assert.equal(d.reactions, null);
		};
	});

	test('derived from state', () => {
		const log: number[] = [];

		let count = state(0);
		let double = derived(() => $.get(count) * 2);

		effect(() => {
			log.push($.get(double));
		});

		return () => {
			flushSync(() => set(count, 1));
			flushSync(() => set(count, 2));

			assert.deepEqual(log, [0, 2, 4]);
		};
	});

	test('derived from derived', () => {
		const log: number[] = [];

		let count = state(0);
		let double = derived(() => $.get(count) * 2);
		let quadruple = derived(() => $.get(double) * 2);

		effect(() => {
			log.push($.get(quadruple));
		});

		return () => {
			flushSync(() => set(count, 1));
			flushSync(() => set(count, 2));

			assert.deepEqual(log, [0, 4, 8]);
		};
	});

	test('state reset', () => {
		const log: number[] = [];

		let count = state(0);
		let double = derived(() => $.get(count) * 2);

		effect(() => {
			log.push($.get(double));
		});

		return () => {
			flushSync();
			log.length = 0;

			set(count, 1);
			set(count, 0);

			flushSync();

			assert.deepEqual(log, []);

			set(count, 1);
			$.get(double);
			set(count, 0);

			flushSync();

			// TODO: in an ideal world, the effect wouldn't fire here
			assert.deepEqual(log, [0]);
		};
	});

	test('https://perf.js.hyoo.ru/#!bench=9h2as6_u0mfnn', () => {
		let res: number[] = [];

		const numbers = Array.from({ length: 2 }, (_, i) => i);
		const fib = (n: number): number => (n < 2 ? 1 : fib(n - 1) + fib(n - 2));
		const hard = (n: number, l: string) => n + fib(16);

		const A = state(0);
		const B = state(0);
		const C = derived(() => ($.get(A) % 2) + ($.get(B) % 2));
		const D = derived(() => numbers.map((i) => i + ($.get(A) % 2) - ($.get(B) % 2)));
		const E = derived(() => hard($.get(C) + $.get(A) + $.get(D)[0]!, 'E'));
		const F = derived(() => hard($.get(D)[0]! && $.get(B), 'F'));
		const G = derived(() => $.get(C) + ($.get(C) || $.get(E) % 2) + $.get(D)[0]! + $.get(F));
		effect(() => {
			res.push(hard($.get(G), 'H'));
		});
		effect(() => {
			res.push($.get(G));
		});
		effect(() => {
			res.push(hard($.get(F), 'J'));
		});

		return () => {
			flushSync();

			let i = 2;
			while (--i) {
				res.length = 0;
				set(B, 1);
				set(A, 1 + i * 2);
				flushSync();

				set(A, 2 + i * 2);
				set(B, 2);
				flushSync();

				assert.equal(res.length, 4);
				assert.deepEqual(res, [3198, 1601, 3195, 1598]);
			}
		};
	});

	test('https://perf.js.hyoo.ru/#!bench=9h2as6_u0mfnn #2', () => {
		let res: number[] = [];

		const numbers = Array.from({ length: 2 }, (_, i) => i);
		const fib = (n: number): number => (n < 2 ? 1 : fib(n - 1) + fib(n - 2));
		const hard = (n: number, l: string) => n + fib(16);

		const A = state(0);
		const B = state(0);

		return () => {
			const C = derived(() => ($.get(A) % 2) + ($.get(B) % 2));
			const D = derived(() => numbers.map((i) => i + ($.get(A) % 2) - ($.get(B) % 2)));
			const E = derived(() => hard($.get(C) + $.get(A) + $.get(D)[0]!, 'E'));
			const F = derived(() => hard($.get(D)[0]! && $.get(B), 'F'));
			const G = derived(() => $.get(C) + ($.get(C) || $.get(E) % 2) + $.get(D)[0]! + $.get(F));

			const destroy = effect_root(() => {
				effect(() => {
					res.push(hard($.get(G), 'H'));
				});
				effect(() => {
					res.push($.get(G));
				});
				effect(() => {
					res.push(hard($.get(F), 'J'));
				});
			});

			flushSync();

			let i = 2;
			while (--i) {
				res.length = 0;
				set(B, 1);
				set(A, 1 + i * 2);
				flushSync();

				set(A, 2 + i * 2);
				set(B, 2);
				flushSync();

				assert.equal(res.length, 4);
				assert.deepEqual(res, [3198, 1601, 3195, 1598]);
			}

			destroy();
			assert(A.reactions === null);
			assert(B.reactions === null);
		};
	});

	test('effects correctly handle unowned derived values that do not change', () => {
		const log: number[] = [];

		return () => {
			let count = state(0);
			const read = () => {
				const x = derived(() => ({ count: $.get(count) }));
				return $.get(x);
			};
			const derivedCount = derived(() => read().count);

			const destroy = effect_root(() => {
				user_effect(() => {
					log.push($.get(derivedCount));
				});
			});

			flushSync(() => set(count, 1));
			// Ensure we're not leaking consumers
			assert.deepEqual(count.reactions?.length, 1);
			flushSync(() => set(count, 2));
			// Ensure we're not leaking consumers
			assert.deepEqual(count.reactions?.length, 1);
			flushSync(() => set(count, 3));
			// Ensure we're not leaking consumers
			assert.deepEqual(count.reactions?.length, 1);
			assert.deepEqual(log, [0, 1, 2, 3]);

			destroy();
		};
	});

	test('correctly cleanup unowned nested derived values', () => {
		return () => {
			const nested: Derived<string>[] = [];

			const a = state(0);
			const b = state(0);
			let c: any;

			const destroy = effect_root(() => {
				c = derived(() => {
					const a_2 = derived(() => $.get(a) + '!');
					const b_2 = derived(() => $.get(b) + '?');
					nested.push(a_2, b_2);

					return { a: $.get(a_2), b: $.get(b_2) };
				});
			});

			$.get(c);

			flushSync(() => set(a, 1));

			$.get(c);

			flushSync(() => set(b, 1));

			$.get(c);

			destroy();

			assert.equal(a.reactions, null);
			assert.equal(b.reactions, null);
		};
	});

	// outside of test function so that they are unowned signals
	let count = state(0);
	let calc = derived(() => {
		if ($.get(count) >= 2) {
			return 'limit';
		}
		return $.get(count) * 2;
	});

	test('effect with derived using unowned derived every time', () => {
		const log: Array<number | string> = [];

		const destroy = effect_root(() => {
			user_effect(() => {
				log.push($.get(calc));
				$.get(calc);
			});
		});

		return () => {
			flushSync(() => set(count, 1));
			flushSync(() => set(count, 2));
			flushSync(() => set(count, 3));
			flushSync(() => set(count, 4));
			flushSync(() => set(count, 0));
			// Ensure we're not leaking consumers
			assert.deepEqual(count.reactions?.length, 1);
			assert.deepEqual(calc.reactions?.length, 1);
			assert.deepEqual(log, [0, 2, 'limit', 0]);
			destroy();
			// Ensure we're not leaking consumers
			assert.deepEqual(count.reactions, null);
			assert.deepEqual(calc.reactions, null);
		};
	});

	let no_deps = derived(() => {
		return [];
	});

	test('two effects with an unowned derived that has no dependencies', () => {
		const log: Array<Array<any>> = [];

		render_effect(() => {
			log.push($.get(no_deps));
		});

		render_effect(() => {
			log.push($.get(no_deps));
		});

		return () => {
			flushSync();
			assert.deepEqual(log, [[], []]);
		};
	});

	test('two effects with an unowned derived that has some dependencies', () => {
		const log: Array<Array<any>> = [];

		return () => {
			let some_state = state({});
			let some_deps = derived(() => {
				return [$.get(some_state)];
			});
			let destroy2: any;

			const destroy = effect_root(() => {
				render_effect(() => {
					$.untrack(() => {
						log.push($.get(some_deps));
					});
				});

				destroy2 = effect_root(() => {
					render_effect(() => {
						log.push($.get(some_deps));
					});

					render_effect(() => {
						log.push($.get(some_deps));
					});
				});
			});

			set(some_state, {});
			flushSync();

			assert.deepEqual(log, [[{}], [{}], [{}], [{}], [{}]]);

			destroy2();

			set(some_state, {});
			flushSync();

			assert.deepEqual(log, [[{}], [{}], [{}], [{}], [{}]]);

			log.length = 0;

			const destroy3 = effect_root(() => {
				render_effect(() => {
					$.untrack(() => {
						log.push($.get(some_deps));
					});
					log.push($.get(some_deps));
				});
			});

			set(some_state, {});
			flushSync();

			assert.deepEqual(log, [[{}], [{}], [{}], [{}]]);

			destroy3();

			assert(some_state.reactions === null);

			destroy();

			assert(some_state.reactions === null);
		};
	});

	test('schedules rerun when writing to signal before reading it', (runes) => {
		if (!runes) return () => {};

		const error = console.error;
		console.error = noop;

		const value = state({ count: 0 });
		user_effect(() => {
			set(value, { count: 0 });
			$.get(value);
		});

		return () => {
			let errored = false;
			try {
				flushSync();
			} catch (e: any) {
				assert.include(e.message, 'effect_update_depth_exceeded');
				errored = true;
			} finally {
				assert.equal(errored, true);
				console.error = error;
			}
		};
	});

	test('schedules rerun when updating deeply nested value', (runes) => {
		if (!runes) return () => {};

		const error = console.error;
		console.error = noop;

		const value = proxy({ a: { b: { c: 0 } } });
		user_effect(() => {
			value.a.b.c += 1;
		});

		return () => {
			let errored = false;
			try {
				flushSync();
			} catch (e: any) {
				assert.include(e.message, 'effect_update_depth_exceeded');
				errored = true;
			} finally {
				assert.equal(errored, true);
				console.error = error;
			}
		};
	});

	test.skip('schedules rerun when writing to signal before reading it', (runes) => {
		if (!runes) return () => {};

		const error = console.error;
		console.error = noop;

		const value = proxy({ arr: [] });
		user_effect(() => {
			value.arr = [];
			value.arr;
		});

		return () => {
			let errored = false;
			try {
				flushSync();
			} catch (e: any) {
				assert.include(e.message, 'effect_update_depth_exceeded');
				errored = true;
			} finally {
				assert.equal(errored, true);
				console.error = error;
			}
		};
	});

	test('schedules rerun when writing to signal before reading it from derived', (runes) => {
		if (!runes) return () => {};
		let log: any[] = [];

		const value = state(1);
		const double = derived(() => $.get(value) * 2);

		user_effect(() => {
			set(value, 10);
			log.push($.get(double));
		});

		return () => {
			flushSync();
			assert.deepEqual(log, [20]);
		};
	});

	test('schedules rerun when writing to signal after reading it from derived', (runes) => {
		if (!runes) return () => {};
		let log: any[] = [];

		const value = state(1);
		const double = derived(() => $.get(value) * 2);

		user_effect(() => {
			log.push($.get(double));
			set(value, 10);
		});

		return () => {
			flushSync();
			assert.deepEqual(log, [2, 20]);
		};
	});

	test('effect teardown is removed on re-run', () => {
		const count = state(0);
		let first = true;
		let teardown = 0;

		user_effect(() => {
			$.get(count);
			if (first) {
				first = false;
				return () => {
					teardown += 1;
				};
			}
		});

		return () => {
			flushSync(() => set(count, 1));
			flushSync(() => set(count, 2));
			assert.equal(teardown, 1);
		};
	});

	test('creating effects within a derived correctly handles ownership', () => {
		const log: Array<number | string> = [];
		let a: Value<unknown>;
		let inner: Value<string | number>;
		let outer: Value<string | number>;

		const destroy = effect_root(() => {
			inner = state(0);
			outer = state(0);

			render_effect(() => {
				a = derived(() => {
					log.push('outer', $.get(outer));
					effect(() => {
						log.push('inner', $.get(inner));
					});
					return $.get(outer);
				});
			});
		});

		return () => {
			flushSync(() => {
				$.get(a);
			});
			assert.deepEqual(log, ['outer', 0, 'inner', 0]);
			log.length = 0;
			flushSync(() => {
				set(inner, 1);
				$.get(a);
			});
			assert.deepEqual(log, ['inner', 1]);
			log.length = 0;
			flushSync(() => {
				set(outer, 1);
				$.get(a);
			});
			assert.deepEqual(log, ['outer', 1, 'inner', 1]);
			log.length = 0;
			flushSync(() => {
				set(inner, 2);
				$.get(a);
			});
			assert.deepEqual(log, ['inner', 2]);
			destroy();
		};
	});

	test('owned deriveds correctly cleanup when no longer connected to graph', () => {
		let a: Derived<unknown>;
		let s = state(0);

		const destroy = effect_root(() => {
			render_effect(() => {
				a = derived(() => {
					$.get(s);
				});
				$.get(a);
			});
		});

		return () => {
			flushSync();
			assert.equal(a?.deps?.length, 1);
			assert.equal(s?.reactions?.length, 1);
			destroy();
			assert.equal(s?.reactions, null);
		};
	});

	test('mixed nested deriveds correctly cleanup when no longer connected to graph #1', () => {
		let a: Derived<unknown>;
		let b: Derived<unknown>;
		let s = state(0);

		const destroy = effect_root(() => {
			render_effect(() => {
				a = derived(() => {
					b = derived(() => {
						$.get(s);
					});
					$.untrack(() => {
						$.get(b);
					});
					$.get(s);
				});
				$.get(a);
			});
		});

		return () => {
			flushSync();
			assert.equal(a?.deps?.length, 1);
			assert.equal(s?.reactions?.length, 1);
			destroy();
			assert.equal(s?.reactions, null);
		};
	});

	test('mixed nested deriveds correctly cleanup when no longer connected to graph #2', () => {
		let a: Derived<unknown>;
		let b: Derived<unknown>;
		let s = state(0);

		const destroy = effect_root(() => {
			render_effect(() => {
				a = derived(() => {
					b = derived(() => {
						$.get(s);
					});
					effect_root(() => {
						$.get(b);
					});
					$.get(s);
				});
				$.get(a);
			});
		});

		return () => {
			flushSync();
			assert.equal(a?.deps?.length, 1);
			assert.equal(s?.reactions?.length, 1);
			destroy();
			assert.equal(s?.reactions, null);
		};
	});

	test('mixed nested deriveds correctly cleanup when no longer connected to graph #3', () => {
		let a: Derived<unknown>;
		let b: Derived<unknown>;
		let s = state(0);
		let logs: any[] = [];

		const destroy = effect_root(() => {
			render_effect(() => {
				a = derived(() => {
					b = derived(() => {
						return $.get(s);
					});
					effect_root(() => {
						$.get(b);
					});
					render_effect(() => {
						logs.push($.get(b));
					});
					$.get(s);
				});
				$.get(a);
			});
		});

		return () => {
			flushSync();
			assert.equal(a?.deps?.length, 1);
			assert.equal(s?.reactions?.length, 2);

			set(s, 1);
			flushSync();

			assert.deepEqual(logs, [0, 1]);

			destroy();
			assert.equal(s?.reactions, null);
		};
	});

	test('deriveds update upon reconnection #1', () => {
		let a = state(false);
		let b = state(false);

		let c = derived(() => $.get(a));
		let d = derived(() => $.get(c));

		let last: Record<string, boolean | null> = {};

		render_effect(() => {
			last = {
				a: $.get(a),
				b: $.get(b),
				c: $.get(c),
				d: $.get(a) || $.get(b) ? $.get(d) : null
			};
		});

		return () => {
			assert.deepEqual(last, { a: false, b: false, c: false, d: null });

			flushSync(() => set(a, true));
			flushSync(() => set(b, true));
			assert.deepEqual(last, { a: true, b: true, c: true, d: true });

			flushSync(() => set(a, false));
			flushSync(() => set(b, false));
			assert.deepEqual(last, { a: false, b: false, c: false, d: null });

			flushSync(() => set(a, true));
			flushSync(() => set(b, true));
			assert.deepEqual(last, { a: true, b: true, c: true, d: true });

			flushSync(() => set(a, false));
			flushSync(() => set(b, false));
			assert.deepEqual(last, { a: false, b: false, c: false, d: null });

			flushSync(() => set(b, true));
			assert.deepEqual(last, { a: false, b: true, c: false, d: false });
		};
	});

	test('deriveds update upon reconnection #2', () => {
		let a = state(false);
		let b = state(false);
		let c = state(false);

		let d = derived(() => $.get(a) || $.get(b));

		let branch = '';

		render_effect(() => {
			if ($.get(c) && !$.get(d)) {
				branch = 'if';
			} else {
				branch = 'else';
			}
		});

		return () => {
			assert.deepEqual(branch, 'else');

			flushSync(() => set(c, true));
			assert.deepEqual(branch, 'if');

			flushSync(() => set(a, true));
			assert.deepEqual(branch, 'else');

			set(a, false);
			set(b, false);
			set(c, false);
			flushSync();
			assert.deepEqual(branch, 'else');

			flushSync(() => set(c, true));
			assert.deepEqual(branch, 'if');

			flushSync(() => set(b, true));
			assert.deepEqual(branch, 'else');

			set(a, false);
			set(b, false);
			set(c, false);
			flushSync();
			assert.deepEqual(branch, 'else');

			flushSync(() => set(c, true));
			assert.deepEqual(branch, 'if');
		};
	});

	test('deriveds update upon reconnection #3', () => {
		let a = state(false);
		let b = state(false);

		let c = derived(() => $.get(a) || $.get(b));
		let d = derived(() => $.get(c));
		let e = derived(() => $.get(d));

		return () => {
			const log: string[] = [];
			let destroy = effect_root(() => {
				render_effect(() => {
					$.get(e);
					log.push('init');
				});
			});
			destroy();

			destroy = effect_root(() => {
				render_effect(() => {
					$.get(e);
					log.push('update');
				});
			});

			assert.deepEqual(log, ['init', 'update']);

			set(a, true);
			flushSync();

			assert.deepEqual(log, ['init', 'update', 'update']);
		};
	});

	test('unowned deriveds are not added as reactions', () => {
		var count = state(0);

		function create_derived() {
			return derived(() => $.get(count) * 2);
		}

		return () => {
			let d = create_derived();
			assert.equal($.get(d), 0);
			assert.equal(count.reactions, null);
			assert.equal(d.deps?.length, 1);

			set(count, 1);
			assert.equal($.get(d), 2);
			assert.equal(count.reactions, null);
			assert.equal(d.deps?.length, 1);

			d = create_derived();
			assert.equal($.get(d), 2);
			assert.equal(count.reactions, null);
			assert.equal(d.deps?.length, 1);
		};
	});

	test('unowned deriveds are correctly connected and disconnected from the graph', () => {
		var count = state(0);

		function create_derived() {
			return derived(() => $.get(count) * 2);
		}

		return () => {
			let d = create_derived();

			const destroy = effect_root(() => {
				render_effect(() => {
					assert.equal($.get(d), 0);
				});
			});

			assert.equal($.get(d), 0);
			assert.equal(count.reactions?.length, 1);
			assert.equal(d.deps?.length, 1);

			set(count, 1);
			assert.equal($.get(d), 2);
			assert.equal(count.reactions?.length, 1);
			assert.equal(d.deps?.length, 1);

			destroy();

			assert.equal(count.reactions, null);

			set(count, 2);
			assert.equal($.get(d), 4);
			assert.equal(count.reactions, null);
			assert.equal(d.deps?.length, 1);
		};
	});

	test('unowned deriveds dependencies are correctly de-duped', () => {
		return () => {
			let a = state(0);
			let b = state(true);
			let c = derived(() => $.get(a));
			let d = derived(() => ($.get(b) ? 1 : $.get(a) + $.get(c) + $.get(a)));

			$.get(d);

			assert.equal(d.deps?.length, 1);

			$.get(d);

			set(a, 1);
			set(b, false);

			$.get(d);

			assert.equal(d.deps?.length, 3);
		};
	});

	test('unowned deriveds correctly update', () => {
		return () => {
			const arr1 = proxy<{ a: number }[]>([]);
			const arr2 = proxy([]);
			const combined = derived(() => [...arr1, ...arr2]);
			const derived_length = derived(() => $.get(combined).length);

			assert.deepEqual($.get(combined), []);
			assert.equal($.get(derived_length), 0);

			arr1.push({ a: 1 });

			assert.deepEqual($.get(combined), [{ a: 1 }]);
			assert.equal($.get(derived_length), 1);
		};
	});

	test('deriveds do not depend on state they own', () => {
		return () => {
			let s;

			const d = derived(() => {
				s = state(0);
				return $.get(s);
			});

			assert.equal($.get(d), 0);

			set(s!, 1);
			assert.equal($.get(d), 0);
		};
	});

	test('effects do depend on state they own', (runes) => {
		// This behavior is important for use cases like a Resource class
		// which shares its instance between multiple effects and triggers
		// rerenders by self-invalidating its state.
		const log: number[] = [];

		let count: any;

		if (runes) {
			// We will make this the new default behavior once it's stable but until then
			// we need to keep the old behavior to not break existing code.
			enable_async_mode_flag();
		}

		effect(() => {
			if (!count || $.get<number>(count) < 2) {
				count ||= state(0);
				log.push($.get(count));
				set(count, $.get<number>(count) + 1);
			}
		});

		return () => {
			try {
				flushSync();
				if (runes) {
					assert.deepEqual(log, [0, 1]);
				} else {
					assert.deepEqual(log, [0]);
				}
			} finally {
				disable_async_mode_flag();
			}
		};
	});

	test('nested effects depend on state of upper effects', () => {
		const logs: number[] = [];
		let raw: Source<number>;
		let proxied: { current: number };

		user_effect(() => {
			raw = state(0);
			proxied = proxy({ current: 0 });

			// We need those separate, else one working and rerunning the effect
			// could mask the other one not rerunning
			user_effect(() => {
				logs.push($.get(raw));
			});

			user_effect(() => {
				logs.push(proxied.current);
			});
		});

		return () => {
			flushSync();
			set(raw, $.get(raw) + 1);
			proxied.current += 1;
			flushSync();
			assert.deepEqual(logs, [0, 0, 1, 1]);
		};
	});

	test('nested effects depend on state of upper effects', () => {
		const logs: number[] = [];

		user_pre_effect(() => {
			const raw = state(0);
			const proxied = proxy({ current: 0 });

			// We need those separate, else one working and rerunning the effect
			// could mask the other one not rerunning
			user_pre_effect(() => {
				logs.push($.get(raw));
			});

			user_pre_effect(() => {
				logs.push(proxied.current);
			});

			// Important so that the updating effect is not running
			// together with the reading effects
			flushSync();

			user_pre_effect(() => {
				$.untrack(() => {
					set(raw, $.get(raw) + 1);
					proxied.current += 1;
				});
			});
		});

		return () => {
			flushSync();
			assert.deepEqual(logs, [0, 0, 1, 1]);
		};
	});

	test('proxy version state does not trigger self-dependency guard', () => {
		return () => {
			const s = proxy({ a: { b: 1 } });
			const d = derived(() => snapshot(s));

			assert.deepEqual($.get(d), s);
		};
	});

	test('set version state does not trigger self-dependency guard', () => {
		return () => {
			const set = new SvelteSet();
			const d = derived(() => set.has('test'));

			set.add('test');
			assert.equal($.get(d), true);
		};
	});

	test('deriveds read inside the root/branches are cleaned up', () => {
		return () => {
			const a = state(0);

			const destroy = effect_root(() => {
				const b = derived(() => $.get(a));
				$.get(b);
			});

			destroy();

			assert.deepEqual(a.reactions, null);
		};
	});

	test('deriveds containing effects work correctly', () => {
		return () => {
			let a = render_effect(() => {});
			let b = state(0);
			let c;
			let effects: Effect[] = [];

			const destroy = effect_root(() => {
				a = render_effect(() => {
					c = derived(() => {
						effects.push(
							effect(() => {
								$.get(b);
							})
						);
						$.get(b);
					});
					$.get(c);
				});
			});

			assert.equal(c!.effects?.length, 1);
			assert.equal(a.first, a.last);

			set(b, 1);

			flushSync();

			assert.equal(c!.effects?.length, 1);
			assert.equal(a.first, a.last);

			destroy();

			assert.equal(a.first, null);

			assert.equal(effects.length, 2);
			assert.equal((effects[0].f & DESTROYED) !== 0, true);
			assert.equal((effects[1].f & DESTROYED) !== 0, true);
		};
	});

	test("deriveds set after they are DIRTY doesn't get updated on get", () => {
		return () => {
			const a = state(0);
			const b = derived(() => $.get(a));

			set(b, 1);
			assert.equal($.get(b), 1);

			set(a, 2);
			assert.equal($.get(b), 2);
			set(b, 3);

			assert.equal($.get(b), 3);
		};
	});

	test("unowned deriveds set after they are DIRTY doesn't get updated on get", () => {
		return () => {
			const a = state(0);
			const b = derived(() => $.get(a));
			const c = derived(() => $.get(b));

			set(b, 1);
			assert.equal($.get(c), 1);

			set(a, 2);

			assert.equal($.get(b), 2);
			assert.equal($.get(c), 2);
		};
	});

	test('deriveds containing effects work correctly when used with untrack', () => {
		return () => {
			let a = render_effect(() => {});
			let b = state(0);
			let c;
			let effects: Effect[] = [];

			const destroy = effect_root(() => {
				a = render_effect(() => {
					c = derived(() => {
						$.untrack(() => {
							effects.push(
								effect(() => {
									$.get(b);
								})
							);
						});
						$.get(b);
					});
					$.get(c);
				});
			});

			assert.equal(c!.effects?.length, 1);
			assert.equal(a.first, a.last);

			set(b, 1);

			flushSync();

			assert.equal(c!.effects?.length, 1);
			assert.equal(a.first, a.last);

			destroy();

			assert.equal(a.first, null);

			assert.equal(effects.length, 2);
			assert.equal((effects[0].f & DESTROYED) !== 0, true);
			assert.equal((effects[1].f & DESTROYED) !== 0, true);
		};
	});

	test('bigint states update correctly', () => {
		return () => {
			const count = state(0n);

			assert.doesNotThrow(() => update(count));
			assert.equal($.get(count), 1n);
			assert.doesNotThrow(() => update(count, -1));
			assert.equal($.get(count), 0n);

			assert.doesNotThrow(() => update_pre(count));
			assert.equal($.get(count), 1n);
			assert.doesNotThrow(() => update_pre(count, -1));
			assert.equal($.get(count), 0n);
		};
	});

	test('unowned deriveds correctly re-attach to their source', () => {
		const log: any[] = [];

		return () => {
			const a = state(0);
			const b = state(0);
			const c = derived(() => {
				$.get(a);
				return $.get(b);
			});

			$.get(c);

			set(a, 1);

			const destroy = effect_root(() => {
				render_effect(() => {
					log.push($.get(c));
				});
			});

			assert.deepEqual(log, [0]);

			set(b, 1);

			flushSync();

			assert.deepEqual(log, [0, 1]);

			destroy();
		};
	});

	test('unowned deriveds correctly update', () => {
		const log: any[] = [];

		return () => {
			const a = state(0);
			const b = state(0);
			const c = derived(() => {
				return $.get(a);
			});
			const d = derived(() => {
				return $.get(b);
			});

			const destroy = effect_root(() => {
				const e = derived(() => {
					return $.get(c) === 1 && $.get(d) === 1;
				});
				render_effect(() => {
					log.push($.get(e));
				});
			});

			assert.deepEqual(log, [false]);

			set(a, 1);
			set(b, 1);

			flushSync();

			assert.deepEqual(log, [false, true]);

			set(b, 9);

			flushSync();

			assert.deepEqual(log, [false, true, false]);

			destroy();
		};
	});

	test('derived whose original parent effect has been destroyed keeps updating', () => {
		return () => {
			let count: Source<number>;
			let double: Derived<number>;
			const destroy = effect_root(() => {
				render_effect(() => {
					count = state(0);
					double = derived(() => $.get(count) * 2);
				});
			});

			flushSync();
			assert.equal($.get(double!), 0);

			destroy();
			flushSync();

			set(count!, 1);
			flushSync();
			assert.equal($.get(double!), 2);

			set(count!, 2);
			flushSync();
			assert.equal($.get(double!), 4);
		};
	});

	test('$effect.root inside deriveds stay alive independently', () => {
		const log: any[] = [];
		const c = state(0);
		const cleanup: any[] = [];
		const inner_states: any[] = [];

		const d = derived(() => {
			const destroy = effect_root(() => {
				const x = state(0);
				inner_states.push(x);

				effect(() => {
					log.push('inner ' + $.get(x));
					return () => {
						log.push('inner destroyed');
					};
				});
			});

			cleanup.push(destroy);

			return $.get(c);
		});

		return () => {
			log.push($.get(d));
			flushSync();

			assert.deepEqual(log, [0, 'inner 0']);
			log.length = 0;

			set(inner_states[0], 1);
			flushSync();

			assert.deepEqual(log, ['inner destroyed', 'inner 1']);
			log.length = 0;

			set(c, 1);
			log.push($.get(d));
			flushSync();

			assert.deepEqual(log, [1, 'inner 0']);
			log.length = 0;

			cleanup.forEach((fn) => fn());
			flushSync();

			assert.deepEqual(log, ['inner destroyed', 'inner destroyed']);
		};
	});

	test('source proxy replacement - property present, absent, then present again', () => {
		// This tests the exact scenario:
		// 1. Source with proxy that contains property is created
		// 2. Source is updated with new proxy that does NOT contain the property
		// 3. Source is updated with new proxy that DOES contain property again with new value
		const log: any[] = [];

		return () => {
			// Step 1: Source with proxy containing the property
			const objSignal = state(proxy<{ foo?: number }>({ foo: 1 }));

			// Derived that reads the property
			const d = derived(() => {
				const obj = $.get(objSignal);
				return obj.foo ?? 0;
			});

			// Create effect
			let destroy1 = effect_root(() => {
				render_effect(() => {
					log.push($.get(d));
				});
			});

			flushSync();
			assert.deepEqual(log, [1], 'initial value with property present');

			// Step 2: Update source with new proxy that does NOT contain the property
			set(objSignal, proxy<{ foo?: number }>({}));
			flushSync();
			assert.deepEqual(log, [1, 0], 'property absent - should be 0');

			// Step 3: Update source with new proxy that DOES contain property with new value
			set(objSignal, proxy<{ foo?: number }>({ foo: 42 }));
			flushSync();
			assert.deepEqual(log, [1, 0, 42], 'property present again with new value');

			// Verify continued reactivity
			$.get(objSignal).foo = 100;
			flushSync();
			assert.deepEqual(log, [1, 0, 42, 100], 'should react to property changes');

			destroy1();
		};
	});

	test('source proxy replacement with disconnect - property present, absent, then present', () => {
		// Same scenario but with disconnect/reconnect cycle
		const log: any[] = [];

		return () => {
			// Step 1: Source with proxy containing the property
			const objSignal = state(proxy<{ foo?: number }>({ foo: 1 }));

			const d = derived(() => {
				const obj = $.get(objSignal);
				return obj.foo ?? 0;
			});

			let destroy1 = effect_root(() => {
				render_effect(() => {
					log.push($.get(d));
				});
			});

			flushSync();
			assert.deepEqual(log, [1], 'initial value');

			// Disconnect the derived
			destroy1();
			flushSync();

			// Step 2: Update with proxy WITHOUT property (while disconnected)
			set(objSignal, proxy<{ foo?: number }>({}));
			flushSync();

			// Step 3: Update with proxy WITH property (while still disconnected)
			set(objSignal, proxy<{ foo?: number }>({ foo: 42 }));
			flushSync();

			// Reconnect
			const destroy2 = effect_root(() => {
				render_effect(() => {
					log.push($.get(d));
				});
			});

			flushSync();
			assert.deepEqual(log, [1, 42], 'should see new value after reconnect');

			// CRITICAL: Verify reactivity works on the new proxy's property
			$.get(objSignal).foo = 100;
			flushSync();
			assert.deepEqual(log, [1, 42, 100], 'should react to property changes on new proxy');

			destroy2();
		};
	});

	test('source proxy replacement - verify reactions with property cycling', () => {
		// Same scenario but directly inspecting reactions
		return () => {
			const objSignal = state(proxy<{ foo?: number }>({ foo: 1 }));

			const d = derived(() => {
				const obj = $.get(objSignal);
				return obj.foo ?? 0;
			});

			// Connect the derived
			let destroy1 = effect_root(() => {
				render_effect(() => {
					$.get(d);
				});
			});

			flushSync();

			// Get initial deps - should include objSignal and the foo property source
			assert.ok(d.deps !== null && d.deps.length >= 2, 'should have deps');
			const initialFooSource = d.deps![1];
			assert.ok(
				initialFooSource.reactions?.includes(d),
				'derived should be in initial foo source reactions'
			);

			// Disconnect
			destroy1();
			flushSync();

			// Step 2: Update with proxy WITHOUT property
			set(objSignal, proxy<{ foo?: number }>({}));
			flushSync();

			// Step 3: Update with proxy WITH property (new value)
			set(objSignal, proxy<{ foo?: number }>({ foo: 42 }));
			flushSync();

			// Reconnect
			const destroy2 = effect_root(() => {
				render_effect(() => {
					$.get(d);
				});
			});

			flushSync();

			// Verify deps are updated
			assert.ok(d.deps !== null && d.deps.length >= 2, 'should still have deps');
			const newFooSource = d.deps![1];

			// Should be a DIFFERENT source (from the new proxy)
			assert.notEqual(newFooSource, initialFooSource, 'should have new foo source');

			// New source should have the derived in reactions
			assert.ok(newFooSource.reactions !== null, 'new foo source should have reactions');
			assert.ok(
				newFooSource.reactions!.includes(d),
				'derived should be in new foo source reactions'
			);

			// Verify reactivity
			const log: any[] = [];
			const destroy3 = effect_root(() => {
				render_effect(() => {
					log.push($.get(d));
				});
			});

			flushSync();
			$.get(objSignal).foo = 100;
			flushSync();

			assert.deepEqual(log, [42, 100], 'reactivity should work');

			destroy2();
			destroy3();
		};
	});

	test('signal assigned brand new proxy - verify reactions on new proxy source', () => {
		// This test verifies the reactions arrays when a signal is assigned a brand new proxy
		return () => {
			// Signal holding a proxy
			const objSignal = state(proxy<{ foo: number }>({ foo: 1 }));

			// Derived that reads from the proxy via signal
			const d = derived(() => {
				const obj = $.get(objSignal);
				return obj.foo;
			});

			// Create effect to connect the derived
			let destroy1 = effect_root(() => {
				render_effect(() => {
					$.get(d);
				});
			});

			flushSync();

			// Get the original source for 'foo' property
			// d.deps should be: [objSignal, originalFooSource]
			assert.ok(d.deps !== null, 'derived should have deps');
			assert.ok(
				d.deps!.length >= 2,
				'derived should have at least 2 deps (signal + property source)'
			);

			const originalFooSource = d.deps![1]; // Second dep should be the foo property source
			assert.ok(originalFooSource.reactions !== null, 'original foo source should have reactions');
			assert.ok(
				originalFooSource.reactions!.includes(d),
				'derived should be in original foo source reactions'
			);

			// Destroy effect - disconnects the derived
			destroy1();
			flushSync();

			// Original source's reactions should be null after disconnect
			assert.equal(
				originalFooSource.reactions,
				null,
				'original foo source reactions should be null after disconnect'
			);

			// Assign a BRAND NEW proxy to the signal
			const newProxy = proxy({ foo: 42 });
			set(objSignal, newProxy);
			flushSync();

			// Create new effect to reconnect
			const destroy2 = effect_root(() => {
				render_effect(() => {
					$.get(d);
				});
			});

			flushSync();

			// Now d.deps should have the NEW foo source (from the new proxy)
			assert.ok(d.deps !== null, 'derived should still have deps');
			assert.ok(d.deps!.length >= 2, 'derived should still have at least 2 deps');

			const newFooSource = d.deps![1]; // Should be the foo source from new proxy

			// The new source should be DIFFERENT from the original
			assert.notEqual(
				newFooSource,
				originalFooSource,
				'should have a different source after proxy replacement'
			);

			// The NEW source should have the derived in its reactions
			assert.ok(newFooSource.reactions !== null, 'new foo source should have reactions');
			assert.ok(
				newFooSource.reactions!.includes(d),
				'derived should be in new foo source reactions'
			);

			// Verify reactivity works
			const log: any[] = [];
			const destroy3 = effect_root(() => {
				render_effect(() => {
					log.push($.get(d));
				});
			});

			flushSync();
			$.get(objSignal).foo = 100;
			flushSync();

			assert.deepEqual(log, [42, 100], 'should react to changes on new proxy');

			destroy2();
			destroy3();
		};
	});

	test('signal assigned brand new proxy - derived reads property', () => {
		// This tests the case where:
		// - A signal holds a proxy
		// - A derived reads a property from the proxy via the signal
		// - The derived is disconnected
		// - The signal is assigned a BRAND NEW proxy
		// - The derived should react to changes on the new proxy
		const log: any[] = [];

		return () => {
			// Signal holding a proxy (simulates: let obj = $state({ foo: 1 }))
			const objSignal = state(proxy<{ foo: number }>({ foo: 1 }));

			// Derived that reads from the proxy via signal
			const d = derived(() => {
				const obj = $.get(objSignal);
				return obj.foo;
			});

			// Create effect
			let destroy1 = effect_root(() => {
				render_effect(() => {
					log.push($.get(d));
				});
			});

			flushSync();
			assert.deepEqual(log, [1], 'initial value');

			// Modify property on original proxy
			$.get(objSignal).foo = 2;
			flushSync();
			assert.deepEqual(log, [1, 2], 'after property update');

			// Destroy effect - disconnects the derived
			destroy1();
			flushSync();

			// Assign a BRAND NEW proxy to the signal
			set(objSignal, proxy({ foo: 42 }));
			flushSync();

			// Create new effect
			const destroy2 = effect_root(() => {
				render_effect(() => {
					log.push($.get(d));
				});
			});

			flushSync();
			assert.deepEqual(log, [1, 2, 42], 'should see value from new proxy');

			// CRITICAL: Modify property on the NEW proxy
			// This should trigger the effect
			$.get(objSignal).foo = 100;
			flushSync();
			assert.deepEqual(log, [1, 2, 42, 100], 'should react to changes on new proxy');

			destroy2();
		};
	});

	test('signal assigned brand new proxy with property delete/add cycle', () => {
		// This tests the combination:
		// - Signal holds a proxy
		// - Derived reads a property
		// - Derived disconnects
		// - Property is deleted on original proxy
		// - Signal is assigned a brand new proxy with the property
		const log: any[] = [];

		return () => {
			const objSignal = state(proxy<{ foo?: number }>({ foo: 1 }));

			const d = derived(() => {
				const obj = $.get(objSignal);
				return obj.foo ?? 0;
			});

			let destroy1 = effect_root(() => {
				render_effect(() => {
					log.push($.get(d));
				});
			});

			flushSync();
			assert.deepEqual(log, [1]);

			// Disconnect
			destroy1();
			flushSync();

			// Delete property on original proxy
			delete $.get(objSignal).foo;
			flushSync();

			// Assign brand new proxy
			set(objSignal, proxy({ foo: 42 }));
			flushSync();

			// Reconnect
			const destroy2 = effect_root(() => {
				render_effect(() => {
					log.push($.get(d));
				});
			});

			flushSync();
			assert.deepEqual(log, [1, 42], 'should see value from new proxy');

			// Verify reactivity on new proxy
			$.get(objSignal).foo = 100;
			flushSync();
			assert.deepEqual(log, [1, 42, 100], 'should react to new proxy changes');

			destroy2();
		};
	});

	test('derived reactions after proxy property delete/re-add while disconnected', () => {
		// This directly tests the scenario from the bug report:
		// - Derived depends on proxy property source
		// - Derived is disconnected
		// - Property is deleted then re-added
		// - Verify the source has the derived in reactions after reconnection
		return () => {
			const obj = proxy<{ foo?: number }>({ foo: 1 });
			const d = derived(() => obj.foo ?? 0);

			// Create effect - connect the derived
			let destroy1 = effect_root(() => {
				render_effect(() => {
					$.get(d);
				});
			});

			flushSync();

			// Get reference to the source
			const originalSource = d.deps![0];
			assert.ok(originalSource.reactions !== null, 'source should have reactions');
			assert.ok(originalSource.reactions!.includes(d), 'derived should be in source reactions');

			// Destroy effect - disconnect the derived
			destroy1();
			flushSync();

			assert.equal(
				originalSource.reactions,
				null,
				'source reactions should be null after disconnect'
			);

			// Delete and re-add the property
			delete obj.foo;
			flushSync();

			obj.foo = 42;
			flushSync();

			// The source should be the SAME source (proxy reuses sources)
			// Read the derived to trigger reconnection
			const destroy2 = effect_root(() => {
				render_effect(() => {
					$.get(d);
				});
			});

			flushSync();

			// After reconnection, check that the source has the derived in reactions
			const newSource = d.deps![0];

			// Should be the same source (proxy reuses sources for the same property)
			assert.equal(newSource, originalSource, 'should be the same source after delete/re-add');

			// Source should have the derived in reactions
			assert.ok(newSource.reactions !== null, 'source should have reactions after reconnect');
			assert.ok(
				newSource.reactions!.includes(d),
				'derived should be in source reactions after reconnect'
			);

			// Verify reactivity works
			const log: any[] = [];
			const destroy3 = effect_root(() => {
				render_effect(() => {
					log.push($.get(d));
				});
			});

			flushSync();
			obj.foo = 100;
			flushSync();

			assert.deepEqual(log, [42, 100], 'effect should react to changes');

			destroy2();
			destroy3();
		};
	});

	test('derived reactions are properly maintained after disconnect/reconnect', () => {
		// This test directly inspects the reactions arrays to verify they are properly maintained
		return () => {
			const obj = proxy<{ foo?: number }>({ foo: 1 });
			const d = derived(() => obj.foo ?? 0);

			// Initially, the derived should not be in any reactions (no effect)
			assert.equal($.get(d), 1);
			// Derived was read outside effect, should have deps but no reactions on source

			// Create effect - this should connect the derived
			let destroy1 = effect_root(() => {
				render_effect(() => {
					$.get(d);
				});
			});

			flushSync();

			// After effect runs, derived should be connected
			// The derived should be in its source's reactions
			// Note: We can't directly check the proxy's internal source, but we can
			// verify behavior through the derived's properties
			assert.ok(d.deps !== null, 'derived should have deps');
			assert.ok(d.deps!.length > 0, 'derived should have at least one dep');

			// The source should have the derived in its reactions
			const source = d.deps![0];
			assert.ok(source.reactions !== null, 'source should have reactions');
			assert.ok(source.reactions!.includes(d), 'source reactions should include derived');

			// Destroy effect - this should disconnect the derived
			destroy1();
			flushSync();

			// After destruction, source's reactions should be null (derived was removed)
			assert.equal(source.reactions, null, 'source reactions should be null after disconnect');

			// Derived still has deps
			assert.ok(d.deps !== null, 'derived should still have deps');

			// Create new effect - this should reconnect the derived
			const destroy2 = effect_root(() => {
				render_effect(() => {
					$.get(d);
				});
			});

			flushSync();

			// After reconnection, source should have derived in reactions again
			assert.ok(source.reactions !== null, 'source should have reactions after reconnect');
			assert.ok(
				source.reactions!.includes(d),
				'source reactions should include derived after reconnect'
			);

			destroy2();
		};
	});

	test('effect is scheduled when disconnected derived reconnects and source changes', () => {
		// This test verifies that after a derived reconnects, changes to its
		// source properly schedule the effect (via mark_reactions)
		const log: any[] = [];
		const scheduledTimes: number[] = [];
		let effectRunCount = 0;

		return () => {
			const obj = proxy<{ foo?: number }>({ foo: 1 });
			const d = derived(() => obj.foo ?? 0);

			// Create effect
			let destroy1 = effect_root(() => {
				render_effect(() => {
					effectRunCount++;
					scheduledTimes.push(effectRunCount);
					log.push($.get(d));
				});
			});

			flushSync();
			assert.deepEqual(log, [1]);
			assert.equal(effectRunCount, 1);

			// Modify property - effect should be scheduled
			obj.foo = 2;
			flushSync();
			assert.deepEqual(log, [1, 2]);
			assert.equal(effectRunCount, 2);

			// Destroy effect
			destroy1();
			flushSync();

			// Create new effect
			const destroy2 = effect_root(() => {
				render_effect(() => {
					effectRunCount++;
					scheduledTimes.push(effectRunCount);
					log.push($.get(d));
				});
			});

			flushSync();
			assert.deepEqual(log, [1, 2, 2], 'new effect sees current value');
			assert.equal(effectRunCount, 3);

			// CRITICAL: Modify property - effect should be scheduled and run
			// If the derived's source doesn't have the derived in reactions,
			// this change won't schedule the effect
			obj.foo = 100;
			flushSync();
			assert.deepEqual(log, [1, 2, 2, 100], 'effect should run when source changes');
			assert.equal(effectRunCount, 4);

			destroy2();
		};
	});

	test('disconnected derived read outside effect update cycle', () => {
		// This tests the scenario where a derived is read when is_updating_effect is false
		// which could prevent reconnect from being called
		const log: any[] = [];

		return () => {
			const obj = proxy<{ foo?: number }>({ foo: 1 });
			const d = derived(() => obj.foo ?? 0);

			// Create and run effect
			let destroy1 = effect_root(() => {
				render_effect(() => {
					log.push($.get(d));
				});
			});

			flushSync();
			assert.deepEqual(log, [1]);

			// Destroy effect - derived disconnects
			destroy1();
			flushSync();

			// Modify property
			obj.foo = 2;
			flushSync();

			// Read derived OUTSIDE of any effect execution
			// (is_updating_effect should be false here)
			const val = $.get(d);
			assert.equal(val, 2, 'should see updated value');

			// Now create new effect
			const destroy2 = effect_root(() => {
				render_effect(() => {
					log.push($.get(d));
				});
			});

			flushSync();
			assert.deepEqual(log, [1, 2], 'new effect should see value');

			// CRITICAL: verify reactivity still works
			obj.foo = 100;
			flushSync();
			assert.deepEqual(log, [1, 2, 100], 'should react to changes');

			destroy2();
		};
	});

	test('derived created and read within another derived - proxy property changes', () => {
		// This tests a complex scenario where:
		// - A derived creates an inner derived during execution
		// - The inner derived depends on a proxy property
		// - The proxy property is deleted and re-added
		const log: any[] = [];

		return () => {
			const obj = proxy<{ foo?: number }>({ foo: 1 });
			let innerDerived: Derived<number>;

			// Outer derived that creates and reads an inner derived
			const outer = derived(() => {
				innerDerived = derived(() => obj.foo ?? 0);
				return $.get(innerDerived);
			});

			let destroy1 = effect_root(() => {
				render_effect(() => {
					log.push($.get(outer));
				});
			});

			flushSync();
			assert.deepEqual(log, [1], 'initial value');

			// Verify reactivity
			obj.foo = 2;
			flushSync();
			assert.deepEqual(log, [1, 2], 'after property change');

			// Destroy effect
			destroy1();
			flushSync();

			// Delete and re-add property
			delete obj.foo;
			obj.foo = 42;

			// Create new effect
			const destroy2 = effect_root(() => {
				render_effect(() => {
					log.push($.get(outer));
				});
			});

			flushSync();
			assert.deepEqual(log, [1, 2, 42], 'after property re-addition');

			// Verify continued reactivity
			obj.foo = 100;
			flushSync();
			assert.deepEqual(log, [1, 2, 42, 100], 'after subsequent change');

			destroy2();
		};
	});

	test('derived read in untrack during effect - proxy property changes', () => {
		// This tests a scenario similar to the async-derived-in-multiple-effects test
		// where untrack is involved
		const log: any[] = [];

		return () => {
			const obj = proxy<{ foo?: number }>({ foo: 1 });

			const d = derived(() => obj.foo ?? 0);

			let destroy1 = effect_root(() => {
				render_effect(() => {
					// Read derived in untrack
					$.untrack(() => {
						$.get(d);
					});
				});

				render_effect(() => {
					// Also read it in a tracked context
					log.push($.get(d));
				});
			});

			flushSync();
			assert.deepEqual(log, [1]);

			// Modify property
			obj.foo = 2;
			flushSync();
			assert.deepEqual(log, [1, 2]);

			// Destroy effect
			destroy1();
			flushSync();

			// Delete and re-add
			delete obj.foo;
			obj.foo = 42;

			// Create new effect
			const destroy2 = effect_root(() => {
				render_effect(() => {
					log.push($.get(d));
				});
			});

			flushSync();
			assert.deepEqual(log, [1, 2, 42]);

			// Verify reactivity
			obj.foo = 100;
			flushSync();
			assert.deepEqual(log, [1, 2, 42, 100]);

			destroy2();
		};
	});

	test('derived with nested proxy - property deletion replaces nested proxy', () => {
		// This test reproduces the bug where:
		// - A derived depends on a nested proxy's property (obj.foo.bar)
		// - obj.foo is deleted and re-added with a different object
		// - The NEW nested proxy doesn't have the derived in its reactions
		const log: any[] = [];

		return () => {
			// Create a proxy with a nested object
			const obj = proxy<{ foo?: { bar: number } }>({ foo: { bar: 1 } });

			// Create a derived that depends on the nested property
			const d = derived(() => obj.foo?.bar ?? 0);

			// Create an effect that reads the derived
			let destroy1 = effect_root(() => {
				render_effect(() => {
					log.push($.get(d));
				});
			});

			flushSync();
			assert.deepEqual(log, [1], 'initial value');

			// Verify reactivity works initially
			obj.foo!.bar = 2;
			flushSync();
			assert.deepEqual(log, [1, 2], 'after updating nested property');

			// Destroy the effect - derived is now disconnected
			destroy1();
			flushSync();

			// Delete the nested object and re-add with a different one
			// This creates a BRAND NEW nested proxy
			delete obj.foo;
			flushSync();

			obj.foo = { bar: 42 };
			flushSync();

			// Create a new effect that reads the derived
			const destroy2 = effect_root(() => {
				render_effect(() => {
					log.push($.get(d));
				});
			});

			flushSync();
			assert.deepEqual(log, [1, 2, 42], 'should see new nested value');

			// CRITICAL: Verify reactivity still works with the NEW nested proxy
			obj.foo!.bar = 100;
			flushSync();
			assert.deepEqual(log, [1, 2, 42, 100], 'should react to new nested proxy changes');

			destroy2();
		};
	});

	test('derived with source-wrapped proxy - entire object replacement', () => {
		// This tests the case where the proxy container is replaced entirely
		// The derived depends on both the container source AND the property source
		const log: any[] = [];

		return () => {
			// Simulate: let obj = $state({ foo: 1 })
			const objSource = state(proxy<{ foo?: number }>({ foo: 1 }));

			// Derived that depends on both objSource and property source
			const d = derived(() => {
				const obj = $.get(objSource);
				return obj.foo ?? 0;
			});

			let destroy1 = effect_root(() => {
				render_effect(() => {
					log.push($.get(d));
				});
			});

			flushSync();
			assert.deepEqual(log, [1]);

			// Modify property on existing proxy
			$.get(objSource).foo = 2;
			flushSync();
			assert.deepEqual(log, [1, 2]);

			// Destroy effect
			destroy1();
			flushSync();

			// Replace the ENTIRE proxy with a new one
			set(objSource, proxy<{ foo?: number }>({ foo: 42 }));
			flushSync();

			// Create new effect
			const destroy2 = effect_root(() => {
				render_effect(() => {
					log.push($.get(d));
				});
			});

			flushSync();
			assert.deepEqual(log, [1, 2, 42], 'should see value from new proxy');

			// CRITICAL: Modify property on NEW proxy
			$.get(objSource).foo = 100;
			flushSync();
			assert.deepEqual(log, [1, 2, 42, 100], 'should react to changes on new proxy');

			destroy2();
		};
	});

	test('derived reacts to proxy property deletion and re-addition', () => {
		const log: any[] = [];

		return () => {
			// Create a proxy object with an initial property
			const obj = proxy<{ foo?: number }>({ foo: 1 });

			// Create a derived that depends on the proxy's property
			const d = derived(() => obj.foo ?? 0);

			// First effect - reads the derived
			let destroy1 = effect_root(() => {
				render_effect(() => {
					log.push($.get(d));
				});
			});

			flushSync();
			assert.deepEqual(log, [1], 'initial value');

			// Destroy the effect - this disconnects the derived
			destroy1();
			flushSync();

			// Now delete the property from the proxy
			delete obj.foo;

			// Re-add the property with a different value
			obj.foo = 42;

			// Create a new effect that reads the derived
			const destroy2 = effect_root(() => {
				render_effect(() => {
					log.push($.get(d));
				});
			});

			flushSync();

			// The derived should now reflect the new value (42)
			assert.deepEqual(log, [1, 42], 'after property re-addition');

			// Update the property again to verify reactivity
			obj.foo = 100;
			flushSync();

			assert.deepEqual(log, [1, 42, 100], 'after subsequent update');

			destroy2();
		};
	});

	test('derived reacts to proxy property deletion and re-addition with delayed re-add', () => {
		const log: any[] = [];

		return async () => {
			// Create a proxy object with an initial property
			const obj = proxy<{ foo?: number }>({ foo: 1 });

			// Create a derived that depends on the proxy's property
			const d = derived(() => obj.foo ?? 0);

			// First effect - reads the derived
			let destroy1 = effect_root(() => {
				render_effect(() => {
					log.push($.get(d));
				});
			});

			flushSync();
			assert.deepEqual(log, [1], 'initial value');

			// Destroy the effect - this disconnects the derived
			destroy1();
			flushSync();

			// Now delete the property from the proxy
			delete obj.foo;
			flushSync();

			// Wait a tick
			await new Promise((resolve) => setTimeout(resolve, 0));

			// Re-add the property with a different value
			obj.foo = 42;
			flushSync();

			// Wait another tick
			await new Promise((resolve) => setTimeout(resolve, 0));

			// Create a new effect that reads the derived
			const destroy2 = effect_root(() => {
				render_effect(() => {
					log.push($.get(d));
				});
			});

			flushSync();

			// The derived should now reflect the new value (42)
			assert.deepEqual(log, [1, 42], 'after property re-addition');

			// Update the property again to verify reactivity
			obj.foo = 100;
			flushSync();

			assert.deepEqual(log, [1, 42, 100], 'after subsequent update');

			destroy2();
		};
	});

	test('derived with proxy dependency - delete then re-add property in different effect', () => {
		const log: any[] = [];

		return () => {
			// Create a proxy with a property
			const obj = proxy<{ foo?: { value: number } }>({ foo: { value: 1 } });

			// Create a derived that depends on the proxy's property
			const d = derived(() => obj.foo?.value ?? 0);

			// First, read the derived outside of any effect (unowned)
			assert.equal($.get(d), 1);

			// Create an effect that reads the derived
			let destroy1 = effect_root(() => {
				render_effect(() => {
					log.push($.get(d));
				});
			});

			flushSync();
			assert.deepEqual(log, [1]);

			// Destroy the first effect
			destroy1();
			flushSync();

			// Delete the property
			delete obj.foo;
			flushSync();

			// Re-add with different value
			obj.foo = { value: 42 };
			flushSync();

			// Create a new effect
			const destroy2 = effect_root(() => {
				render_effect(() => {
					log.push($.get(d));
				});
			});

			flushSync();
			assert.deepEqual(log, [1, 42], 'after reconnection');

			// Verify reactivity continues to work
			obj.foo = { value: 100 };
			flushSync();
			assert.deepEqual(log, [1, 42, 100], 'after update');

			destroy2();
		};
	});

	test('nested derived with proxy - inner derived disconnects then reconnects', () => {
		const log: any[] = [];

		return () => {
			// Create a proxy with a property
			const obj = proxy<{ foo?: number }>({ foo: 1 });

			// Create an inner derived that depends on proxy property
			const inner = derived(() => obj.foo ?? 0);

			// Create an outer derived that depends on inner
			const outer = derived(() => $.get(inner) * 2);

			// Create an effect that reads the outer derived
			let destroy1 = effect_root(() => {
				render_effect(() => {
					log.push($.get(outer));
				});
			});

			flushSync();
			assert.deepEqual(log, [2], 'initial value');

			// Destroy the effect - this should disconnect both deriveds
			destroy1();
			flushSync();

			// Delete the property on the proxy
			delete obj.foo;
			flushSync();

			// Re-add the property with a different value
			obj.foo = 42;
			flushSync();

			// Create a new effect that reads outer again
			const destroy2 = effect_root(() => {
				render_effect(() => {
					log.push($.get(outer));
				});
			});

			flushSync();
			assert.deepEqual(log, [2, 84], 'after property re-addition');

			// Verify reactivity continues to work
			obj.foo = 100;
			flushSync();
			assert.deepEqual(log, [2, 84, 200], 'after subsequent update');

			destroy2();
		};
	});

	test('derived chain with proxy - middle derived changes deps', () => {
		const log: any[] = [];

		return () => {
			// Create two proxies
			const obj1 = proxy<{ value?: number }>({ value: 1 });
			const obj2 = proxy<{ value?: number }>({ value: 10 });

			// Control which object is used
			const useFirst = state(true);

			// Derived that switches between objects
			const selected = derived(() => ($.get(useFirst) ? obj1.value : obj2.value));

			// Outer derived
			const doubled = derived(() => ($.get(selected) ?? 0) * 2);

			// Create effect
			let destroy1 = effect_root(() => {
				render_effect(() => {
					log.push($.get(doubled));
				});
			});

			flushSync();
			assert.deepEqual(log, [2], 'initial - using obj1');

			// Switch to obj2
			set(useFirst, false);
			flushSync();
			assert.deepEqual(log, [2, 20], 'switched to obj2');

			// Destroy effect
			destroy1();
			flushSync();

			// Delete property on obj2 and re-add
			delete obj2.value;
			obj2.value = 50;

			// Create new effect
			const destroy2 = effect_root(() => {
				render_effect(() => {
					log.push($.get(doubled));
				});
			});

			flushSync();
			assert.deepEqual(log, [2, 20, 100], 'after obj2 property re-add');

			// Update obj2
			obj2.value = 75;
			flushSync();
			assert.deepEqual(log, [2, 20, 100, 150], 'after obj2 update');

			destroy2();
		};
	});

	test('disconnected derived with stale deps after property re-add - direct source access', () => {
		// This test attempts to reproduce the bug where:
		// - A derived has deps on a proxy property source
		// - The derived is disconnected
		// - The property is deleted then re-added
		// - The newly created source doesn't have the derived in its reactions
		const log: any[] = [];

		return () => {
			// Create a proxy
			const obj = proxy<{ foo?: number }>({});

			// Initially set the property
			obj.foo = 1;

			// Create a derived outside of any effect (will be "unowned")
			const d = derived(() => {
				return obj.foo ?? 0;
			});

			// Read it outside effect first (creates unowned derived)
			assert.equal($.get(d), 1);

			// Now connect it to an effect
			let destroy1 = effect_root(() => {
				render_effect(() => {
					log.push($.get(d));
				});
			});

			flushSync();
			assert.deepEqual(log, [1]);

			// Update to verify reactivity works
			obj.foo = 2;
			flushSync();
			assert.deepEqual(log, [1, 2]);

			// Destroy the effect - derived is now disconnected
			destroy1();
			flushSync();

			// Delete and re-add the property
			delete obj.foo;
			flushSync();

			obj.foo = 42;
			flushSync();

			// Read derived outside effect
			const val = $.get(d);
			assert.equal(val, 42, 'derived should have new value');

			// Now connect to a new effect
			const destroy2 = effect_root(() => {
				render_effect(() => {
					log.push($.get(d));
				});
			});

			flushSync();
			assert.deepEqual(log, [1, 2, 42], 'reconnected effect should see new value');

			// Critical: verify reactivity still works after reconnection
			obj.foo = 100;
			flushSync();
			assert.deepEqual(log, [1, 2, 42, 100], 'reactivity should work after reconnection');

			destroy2();
		};
	});

	test('derived with state-wrapped proxy - property deletion and re-addition', () => {
		// This test specifically covers the case where the proxy is wrapped in a state
		// which is what happens with $state({...}) in Svelte
		const log: any[] = [];

		return () => {
			// This simulates: let obj = $state({ foo: 1 })
			// where obj is a source that holds a proxy
			const objState = state(proxy<{ foo?: number }>({ foo: 1 }));

			// This simulates: const d = $derived(obj.foo)
			const d = derived(() => {
				const obj = $.get(objState);
				return obj.foo ?? 0;
			});

			// Create an effect that reads the derived
			let destroy1 = effect_root(() => {
				render_effect(() => {
					log.push($.get(d));
				});
			});

			flushSync();
			assert.deepEqual(log, [1], 'initial value');

			// Modify the property through the proxy
			const obj = $.get(objState);
			obj.foo = 2;
			flushSync();
			assert.deepEqual(log, [1, 2], 'after first update');

			// Destroy the effect
			destroy1();
			flushSync();

			// Delete and re-add the property
			delete obj.foo;
			flushSync();

			obj.foo = 42;
			flushSync();

			// Create a new effect
			const destroy2 = effect_root(() => {
				render_effect(() => {
					log.push($.get(d));
				});
			});

			flushSync();
			assert.deepEqual(log, [1, 2, 42], 'after reconnection');

			// Verify reactivity
			obj.foo = 100;
			flushSync();
			assert.deepEqual(log, [1, 2, 42, 100], 'after subsequent update');

			destroy2();
		};
	});

	test('derived depends on proxy version source - key iteration changes', () => {
		// This test covers the case where a derived depends on the proxy's version
		// which is used to track object structure changes (key additions/deletions)
		const log: any[] = [];

		return () => {
			const obj = proxy<{ [key: string]: number }>({ a: 1, b: 2 });

			// Derived that iterates over keys (depends on version)
			const d = derived(() => {
				return Object.keys(obj).join(',');
			});

			let destroy1 = effect_root(() => {
				render_effect(() => {
					log.push($.get(d));
				});
			});

			flushSync();
			assert.deepEqual(log, ['a,b'], 'initial keys');

			// Delete a key
			delete obj.a;
			flushSync();
			assert.deepEqual(log, ['a,b', 'b'], 'after deleting a');

			// Destroy effect
			destroy1();
			flushSync();

			// Re-add the key
			obj.a = 100;
			flushSync();

			// Create new effect
			const destroy2 = effect_root(() => {
				render_effect(() => {
					log.push($.get(d));
				});
			});

			flushSync();
			// The order might vary, but both keys should be present
			const lastLog = log[log.length - 1];
			assert.ok(
				lastLog.includes('a') && lastLog.includes('b'),
				'should have both keys after re-add'
			);

			// Add another key
			obj.c = 300;
			flushSync();
			const newLog = log[log.length - 1];
			assert.ok(newLog.includes('c'), 'should react to new key');

			destroy2();
		};
	});

	test('multiple deriveds interacting with proxy - one updates, other reacts', () => {
		// Tests multiple deriveds that depend on each other and on a proxy
		const log: any[] = [];

		return () => {
			const objSignal = state(proxy<{ foo?: number }>({ foo: 1 }));

			// First derived reads from proxy
			const d1 = derived(() => {
				const obj = $.get(objSignal);
				return obj.foo ?? 0;
			});

			// Second derived depends on first derived
			const d2 = derived(() => $.get(d1) * 2);

			// Third derived also depends on first
			const d3 = derived(() => $.get(d1) + 10);

			// Effect reads all deriveds
			let destroy1 = effect_root(() => {
				render_effect(() => {
					log.push({ d1: $.get(d1), d2: $.get(d2), d3: $.get(d3) });
				});
			});

			flushSync();
			assert.deepEqual(log, [{ d1: 1, d2: 2, d3: 11 }]);

			// Destroy effect - all deriveds disconnect
			destroy1();
			flushSync();

			// Replace proxy with one WITHOUT the property
			set(objSignal, proxy<{ foo?: number }>({}));
			flushSync();

			// Replace proxy with one WITH the property (new value)
			set(objSignal, proxy<{ foo?: number }>({ foo: 42 }));
			flushSync();

			// Reconnect with new effect
			const destroy2 = effect_root(() => {
				render_effect(() => {
					log.push({ d1: $.get(d1), d2: $.get(d2), d3: $.get(d3) });
				});
			});

			flushSync();
			assert.deepEqual(log[log.length - 1], { d1: 42, d2: 84, d3: 52 });

			// Verify reactivity on new proxy
			$.get(objSignal).foo = 100;
			flushSync();
			assert.deepEqual(log[log.length - 1], { d1: 100, d2: 200, d3: 110 });

			destroy2();
		};
	});

	test('derived created in effect context survives after effect destruction', () => {
		// Tests a derived created inside an effect that continues to live
		// after that effect is destroyed
		const log: any[] = [];

		return () => {
			const objSignal = state(proxy<{ foo?: number }>({ foo: 1 }));
			let escapedDerived: Derived<number>;

			// Effect 1: creates a derived and "escapes" it
			let destroy1 = effect_root(() => {
				render_effect(() => {
					// Create derived inside effect
					escapedDerived = derived(() => {
						const obj = $.get(objSignal);
						return obj.foo ?? 0;
					});
					log.push('effect1: ' + $.get(escapedDerived));
				});
			});

			flushSync();
			assert.deepEqual(log, ['effect1: 1']);

			// Destroy the effect that created the derived
			destroy1();
			flushSync();

			// The derived should still be usable
			// Replace proxy
			set(objSignal, proxy<{ foo?: number }>({}));
			set(objSignal, proxy<{ foo?: number }>({ foo: 42 }));
			flushSync();

			// Use the escaped derived in a NEW effect
			const destroy2 = effect_root(() => {
				render_effect(() => {
					log.push('effect2: ' + $.get(escapedDerived!));
				});
			});

			flushSync();
			assert.deepEqual(log[log.length - 1], 'effect2: 42');

			// Verify reactivity works on the escaped derived
			$.get(objSignal).foo = 100;
			flushSync();
			assert.deepEqual(log[log.length - 1], 'effect2: 100');

			destroy2();
		};
	});

	test('derived moved between effect contexts with proxy changes', () => {
		// Tests a derived that is read in one effect, then that effect is destroyed,
		// and the derived is read in a different effect
		const log: any[] = [];

		return () => {
			const objSignal = state(proxy<{ foo?: number }>({ foo: 1 }));

			// Create derived outside effects
			const d = derived(() => {
				const obj = $.get(objSignal);
				return obj.foo ?? 0;
			});

			// Effect 1: reads the derived
			let destroy1 = effect_root(() => {
				render_effect(() => {
					log.push('effect1: ' + $.get(d));
				});
			});

			flushSync();
			assert.deepEqual(log, ['effect1: 1']);

			// Effect 2: also reads the derived (both effects active)
			let destroy2 = effect_root(() => {
				render_effect(() => {
					log.push('effect2: ' + $.get(d));
				});
			});

			flushSync();
			assert.deepEqual(log[log.length - 1], 'effect2: 1');

			// Destroy effect 1 - derived still connected via effect 2
			destroy1();
			flushSync();

			// Change proxy
			set(objSignal, proxy<{ foo?: number }>({ foo: 50 }));
			flushSync();

			// Effect 2 should still react
			assert.deepEqual(log[log.length - 1], 'effect2: 50');

			// Destroy effect 2 - derived now fully disconnected
			destroy2();
			flushSync();

			// Replace proxy while disconnected
			set(objSignal, proxy<{ foo?: number }>({}));
			set(objSignal, proxy<{ foo?: number }>({ foo: 99 }));
			flushSync();

			// Effect 3: reads the derived (reconnection)
			const destroy3 = effect_root(() => {
				render_effect(() => {
					log.push('effect3: ' + $.get(d));
				});
			});

			flushSync();
			assert.deepEqual(log[log.length - 1], 'effect3: 99');

			// Verify reactivity
			$.get(objSignal).foo = 200;
			flushSync();
			assert.deepEqual(log[log.length - 1], 'effect3: 200');

			destroy3();
		};
	});

	test('derived created in destroyed effect - verify reactions', () => {
		// Directly verify reactions arrays when derived outlives its creating effect
		return () => {
			const objSignal = state(proxy<{ foo?: number }>({ foo: 1 }));
			let escapedDerived: Derived<number>;

			// Create derived inside effect
			let destroy1 = effect_root(() => {
				render_effect(() => {
					escapedDerived = derived(() => {
						const obj = $.get(objSignal);
						return obj.foo ?? 0;
					});
					$.get(escapedDerived); // Read it to establish deps
				});
			});

			flushSync();

			// Verify initial state
			assert.ok(escapedDerived!.deps !== null, 'derived should have deps');

			// Destroy creating effect
			destroy1();
			flushSync();

			// Replace proxy while derived is orphaned
			set(objSignal, proxy<{ foo?: number }>({}));
			set(objSignal, proxy<{ foo?: number }>({ foo: 42 }));
			flushSync();

			// Use derived in new effect
			const destroy2 = effect_root(() => {
				render_effect(() => {
					$.get(escapedDerived!);
				});
			});

			flushSync();

			// Verify deps are updated and reactions are correct
			assert.ok(escapedDerived!.deps !== null, 'derived should still have deps');
			const fooSource = escapedDerived!.deps![1]; // objSignal is [0], foo source is [1]
			assert.ok(fooSource.reactions !== null, 'foo source should have reactions');
			assert.ok(
				fooSource.reactions!.includes(escapedDerived!),
				'derived should be in foo source reactions'
			);

			// Verify reactivity
			const log: any[] = [];
			const destroy3 = effect_root(() => {
				render_effect(() => {
					log.push($.get(escapedDerived!));
				});
			});

			flushSync();
			$.get(objSignal).foo = 100;
			flushSync();

			assert.deepEqual(log, [42, 100], 'should react to changes');

			destroy2();
			destroy3();
		};
	});

	test('derived property on object depending on SvelteSet - immediate read after update', () => {
		// Reproduction from issue #17263:
		// An item has an `expanded` derived property that depends on expanded_ids.has(id)
		// Reading item.expanded immediately after modifying expanded_ids should reflect the change
		const log: any[] = [];

		return () => {
			const expanded_ids = new SvelteSet<number>();

			// Create an "item" with a derived expanded property
			function create_item(id: number) {
				return {
					id,
					get expanded() {
						return expanded_ids.has(id);
					}
				};
			}

			const item = create_item(1);

			// Expand function
			function on_expand(id: number) {
				expanded_ids.add(id);
			}

			// Collapse function
			function on_collapse(id: number) {
				expanded_ids.delete(id);
			}

			// Toggle function - this is where the bug manifests
			function toggle_expansion() {
				if (item.expanded) {
					on_collapse(item.id);
				} else {
					on_expand(item.id);
				}
				// Reading immediately after modification - this is the bug trigger
				log.push(item.expanded);
			}

			// Create an effect that reads item.expanded
			let destroy = effect_root(() => {
				render_effect(() => {
					// Just to establish reactivity
					item.expanded;
				});
			});

			flushSync();

			// Initially not expanded
			assert.equal(item.expanded, false, 'initially not expanded');

			// Toggle to expand
			toggle_expansion();
			// Should now be true
			assert.deepEqual(log, [true], 'should be expanded after toggle');

			// Toggle to collapse
			toggle_expansion();
			// Should now be false
			assert.deepEqual(log, [true, false], 'should be collapsed after second toggle');

			destroy();
		};
	});

	test('derived depending on SvelteSet - item object with derived getter', () => {
		// More direct reproduction of the issue pattern
		const log: any[] = [];

		return () => {
			const expanded_ids = new SvelteSet<number>();

			// Simulate the item structure from the reproduction
			class Item {
				id: number;
				constructor(id: number) {
					this.id = id;
				}
				get expanded() {
					return expanded_ids.has(this.id);
				}
			}

			const item = new Item(1);

			let destroy = effect_root(() => {
				render_effect(() => {
					log.push(`effect: ${item.expanded}`);
				});
			});

			flushSync();
			assert.deepEqual(log, ['effect: false']);

			// Add to set
			expanded_ids.add(1);
			// Immediately read the derived
			const valueAfterAdd = item.expanded;
			log.push(`immediate: ${valueAfterAdd}`);

			flushSync();

			// The immediate read should have returned true
			assert.equal(valueAfterAdd, true, 'immediate read after add should be true');

			// Effect should have run
			assert.ok(log.includes('effect: true'), 'effect should have seen true');

			// Delete from set
			expanded_ids.delete(1);
			const valueAfterDelete = item.expanded;
			log.push(`immediate: ${valueAfterDelete}`);

			flushSync();

			assert.equal(valueAfterDelete, false, 'immediate read after delete should be false');

			destroy();
		};
	});

	test('derived on SvelteSet with object property - toggle pattern', () => {
		// Exact pattern from the buggy reproduction
		return () => {
			const expanded_ids = new SvelteSet<number>();

			const items = [
				{
					id: 1,
					get expanded() {
						return expanded_ids.has(this.id);
					}
				},
				{
					id: 2,
					get expanded() {
						return expanded_ids.has(this.id);
					}
				}
			];

			function on_expand(id: number) {
				expanded_ids.add(id);
			}

			function on_collapse(id: number) {
				expanded_ids.delete(id);
			}

			// The buggy toggle function that reads item.expanded after modification
			function buggy_toggle(item: (typeof items)[0]) {
				if (item.expanded) {
					on_collapse(item.id);
				} else {
					on_expand(item.id);
				}
				// This is the problematic pattern - reading immediately after modification
				return item.expanded;
			}

			let destroy = effect_root(() => {
				render_effect(() => {
					// Establish reactivity
					items.forEach((i) => i.expanded);
				});
			});

			flushSync();

			// Toggle item 1 (expand)
			const result1 = buggy_toggle(items[0]);
			assert.equal(result1, true, 'after toggle expand, should read true');
			assert.equal(expanded_ids.has(1), true, 'set should contain id 1');

			// Toggle item 1 again (collapse)
			const result2 = buggy_toggle(items[0]);
			assert.equal(result2, false, 'after toggle collapse, should read false');
			assert.equal(expanded_ids.has(1), false, 'set should not contain id 1');

			// Toggle item 2 (expand)
			const result3 = buggy_toggle(items[1]);
			assert.equal(result3, true, 'after toggle expand item 2, should read true');

			destroy();
		};
	});

	test('derived passed as prop - item with expanded derived from SvelteSet', () => {
		// Simulates the parent-child component pattern from issue #17263
		// Parent creates item with expanded derived, passes to child
		// Child reads item.expanded after modifying the set
		return () => {
			const expanded_ids = new SvelteSet<number>();

			// Parent creates the item (like in App.svelte)
			function create_item(id: number) {
				const d = derived(() => expanded_ids.has(id));
				return {
					id,
					get expanded() {
						return $.get(d);
					}
				};
			}

			const item = create_item(1);

			// Parent's expand/collapse functions
			function on_expand(id: number) {
				expanded_ids.add(id);
			}
			function on_collapse(id: number) {
				expanded_ids.delete(id);
			}

			// Simulate child component receiving item as prop
			let childDestroy: () => void;

			// Parent effect (creates the item and passes to child)
			let parentDestroy = effect_root(() => {
				render_effect(() => {
					// Parent might read item.expanded in template
					item.expanded;
				});
			});

			flushSync();

			// Child effect - simulates child component
			childDestroy = effect_root(() => {
				render_effect(() => {
					// Child reads item.expanded
					item.expanded;
				});
			});

			flushSync();

			// Child's buggy toggle function
			function buggy_on_toggle_expansion() {
				if (item.expanded) {
					on_collapse(item.id);
				} else {
					on_expand(item.id);
				}
				// This triggers the bug - reading immediately after modification
				return item.expanded;
			}

			// Test the toggle
			const result1 = buggy_on_toggle_expansion();
			assert.equal(result1, true, 'after expand, should read true');

			const result2 = buggy_on_toggle_expansion();
			assert.equal(result2, false, 'after collapse, should read false');

			const result3 = buggy_on_toggle_expansion();
			assert.equal(result3, true, 'after expand again, should read true');

			childDestroy();
			parentDestroy();
		};
	});

	test('derived with SvelteSet - disconnected then reconnected', () => {
		// Test the scenario where the derived might become disconnected
		return () => {
			const expanded_ids = new SvelteSet<number>();

			const d = derived(() => expanded_ids.has(1));

			// First effect - connects the derived
			let destroy1 = effect_root(() => {
				render_effect(() => {
					$.get(d);
				});
			});

			flushSync();
			assert.equal($.get(d), false);

			// Destroy the effect - disconnects the derived
			destroy1();
			flushSync();

			// Modify the set while derived is disconnected
			expanded_ids.add(1);

			// Create new effect - reconnects the derived
			let destroy2 = effect_root(() => {
				render_effect(() => {
					$.get(d);
				});
			});

			flushSync();

			// The derived should reflect the updated value
			assert.equal($.get(d), true, 'derived should see updated value after reconnection');

			// Modify again
			expanded_ids.delete(1);
			const immediateValue = $.get(d);
			assert.equal(immediateValue, false, 'immediate read should see deleted');

			// Add back
			expanded_ids.add(1);
			const immediateValue2 = $.get(d);
			assert.equal(immediateValue2, true, 'immediate read should see added');

			destroy2();
		};
	});
});
