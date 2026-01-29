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

	test('derived when connected should add new dependency to its reaction even when read outside effect', () => {
		let count_a = state(0);
		let count_b = state(0);
		let which = state(true);
		let double = derived(() => ($.get(which) ? $.get(count_a) * 2 : $.get(count_b) * 2));

		render_effect(() => {
			$.get(double);
		});

		return () => {
			flushSync();
			assert.equal($.get(double!), 0);

			set(which, false);
			$.get(double); // read before render effect has a chance to rerun
			flushSync();
			assert.equal($.get(double!), 0);

			set(count_b, 1);
			flushSync();
			assert.equal($.get(double!), 2);
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
});
