import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { Payload, SSRState } from './payload.js';
import type { Component } from 'svelte';
import { disable_async_mode_flag, enable_async_mode_flag } from '../flags/index.js';

test('collects synchronous body content by default', () => {
	const component = (payload: Payload) => {
		payload.push('a');
		payload.child(($$payload) => {
			$$payload.push('b');
		});
		payload.push('c');
	};

	const { head, body } = Payload.render(component as unknown as Component);
	expect(head).toBe('');
	expect(body).toBe('<!--[--><!--[-->abc<!--]--><!--]-->');
});

test('child type switches content area (head vs body)', () => {
	const component = (payload: Payload) => {
		payload.push('a');
		payload.child(($$payload) => {
			$$payload.push('<title>T</title>');
		}, 'head');
		payload.push('b');
	};

	const { head, body } = Payload.render(component as unknown as Component);
	expect(head).toBe('<title>T</title>');
	expect(body).toBe('<!--[--><!--[-->ab<!--]--><!--]-->');
});

test('child inherits parent type when not specified', () => {
	const component = (payload: Payload) => {
		payload.child((payload) => {
			payload.push('<meta name="x"/>');
			payload.child((payload) => {
				payload.push('<style>/* css */</style>');
			});
		}, 'head');
	};

	const { head, body } = Payload.render(component as unknown as Component);
	expect(body).toBe('<!--[--><!--[--><!--]--><!--]-->');
	expect(head).toBe('<meta name="x"/><style>/* css */</style>');
});

test('get_path returns the path indexes to a payload', () => {
	const root = new Payload(new SSRState('sync'));
	let child_a: InstanceType<typeof Payload> | undefined;
	let child_b: InstanceType<typeof Payload> | undefined;
	let child_b_0: InstanceType<typeof Payload> | undefined;

	root.child(($$payload) => {
		child_a = $$payload;
		$$payload.push('A');
	});
	root.child(($$payload) => {
		child_b = $$payload;
		$$payload.child(($$inner) => {
			child_b_0 = $$inner;
			$$inner.push('B0');
		});
		$$payload.push('B1');
	});

	expect(child_a!.get_path()).toEqual([0]);
	expect(child_b!.get_path()).toEqual([1]);
	expect(child_b_0!.get_path()).toEqual([1, 0]);
});

test('creating an async child in a sync context throws', () => {
	const component = (payload: Payload) => {
		payload.push('a');
		payload.child(async ($$payload) => {
			await Promise.resolve();
			$$payload.push('x');
		});
	};

	expect(() => Payload.render(component as unknown as Component).head).toThrow('await_invalid');
	expect(() => Payload.render(component as unknown as Component).html).toThrow('await_invalid');
	expect(() => Payload.render(component as unknown as Component).body).toThrow('await_invalid');
});

test('compact synchronously aggregates a range and can transform into head/body', () => {
	const component = (payload: Payload) => {
		const start = payload.length;
		payload.push('a');
		payload.push('b');
		payload.push('c');
		payload.compact({
			start,
			end: start + 2,
			fn: (content) => {
				return { head: '<h>H</h>', body: content.body + 'd' };
			}
		});
	};

	const { head, body } = Payload.render(component as unknown as Component);
	expect(head).toBe('<h>H</h>');
	expect(body).toBe('<!--[--><!--[-->abdc<!--]--><!--]-->');
});

test('local state is shallow-copied to children', () => {
	const root = new Payload(new SSRState('sync'));
	root.local.select_value = 'A';
	let child: InstanceType<typeof Payload> | undefined;
	root.child(($$payload) => {
		child = $$payload;
	});

	expect(child!.local.select_value).toBe('A');
	child!.local.select_value = 'B';
	expect(root.local.select_value).toBe('A');
});

test('subsume replaces tree content and state from other', () => {
	const a = new Payload(new SSRState('async'), undefined, 'head');
	a.push('<meta />');
	a.local.select_value = 'A';

	const b = new Payload(new SSRState('async'));
	b.child(async ($$payload) => {
		await Promise.resolve();
		$$payload.push('body');
	});
	b.global.css.add({ hash: 'h', code: 'c' });
	b.global.set_title('Title', [1]);
	b.local.select_value = 'B';
	b.promises.initial = Promise.resolve();

	a.subsume(b);

	expect(a.type).toBe('body');
	expect(a.local.select_value).toBe('B');
	expect(a.promises).toBe(b.promises);
});

test('subsume refuses to switch modes', () => {
	const a = new Payload(new SSRState('sync'), undefined, 'head');
	a.push('<meta />');
	a.local.select_value = 'A';

	const b = new Payload(new SSRState('async'));
	b.child(async ($$payload) => {
		await Promise.resolve();
		$$payload.push('body');
	});
	b.global.css.add({ hash: 'h', code: 'c' });
	b.global.set_title('Title', [1]);
	b.local.select_value = 'B';
	b.promises.initial = Promise.resolve();

	expect(() => a.subsume(b)).toThrow(
		"invariant: A payload cannot switch modes. If you're seeing this, there's a compiler bug. File an issue!"
	);
});

test('SSRState uid generator uses prefix', () => {
	const state = new SSRState('sync', 'id-');
	expect(state.uid()).toBe('id-s1');
});

test('SSRState title ordering favors later lexicographic paths', () => {
	const state = new SSRState('sync');

	state.set_title('A', [1]);
	expect(state.get_title()).toBe('A');

	// equal path -> unchanged
	state.set_title('B', [1]);
	expect(state.get_title()).toBe('A');

	// earlier -> unchanged
	state.set_title('C', [0, 9]);
	expect(state.get_title()).toBe('A');

	// later -> update
	state.set_title('D', [2]);
	expect(state.get_title()).toBe('D');

	// longer but same prefix -> update
	state.set_title('E', [2, 0]);
	expect(state.get_title()).toBe('E');

	// shorter (earlier) than current with same prefix -> unchanged
	state.set_title('F', [2]);
	expect(state.get_title()).toBe('E');
});

describe('async', () => {
	beforeAll(() => {
		enable_async_mode_flag();
	});

	afterAll(() => {
		disable_async_mode_flag();
	});

	test('awaiting payload gets async content', async () => {
		const component = (payload: Payload) => {
			payload.push('1');
			payload.child(async ($$payload) => {
				await Promise.resolve();
				$$payload.push('2');
			});
			payload.push('3');
		};

		const result = await Payload.render(component as unknown as Component);
		expect(result.head).toBe('');
		expect(result.body).toBe('<!--[--><!--[-->123<!--]--><!--]-->');
		expect(() => result.html).toThrow('html_deprecated');
	});

	test('compact schedules followup when compaction input is async', async () => {
		const component = (payload: Payload) => {
			payload.push('a');
			payload.child(async ($$payload) => {
				await Promise.resolve();
				$$payload.push('X');
			});
			payload.push('b');
			payload.compact({
				start: 0,
				fn: async (content) => ({
					body: content.body.toLowerCase(),
					head: await Promise.resolve('')
				})
			});
		};

		const { body, head } = await Payload.render(component as unknown as Component);
		expect(head).toBe('');
		expect(body).toBe('<!--[--><!--[-->axb<!--]--><!--]-->');
	});

	test('push accepts async functions in async context', async () => {
		const component = (payload: Payload) => {
			payload.push('a');
			payload.push(async () => {
				await Promise.resolve();
				return 'b';
			});
			payload.push('c');
		};

		const { head, body } = await Payload.render(component as unknown as Component);
		expect(head).toBe('');
		expect(body).toBe('<!--[--><!--[-->abc<!--]--><!--]-->');
	});

	test('push handles async functions with different timing', async () => {
		const component = (payload: Payload) => {
			payload.push(async () => {
				await Promise.resolve();
				return 'fast';
			});
			payload.push(async () => {
				await new Promise((resolve) => setTimeout(resolve, 10));
				return 'slow';
			});
			payload.push('sync');
		};

		const { head, body } = await Payload.render(component as unknown as Component);
		expect(head).toBe('');
		expect(body).toBe('<!--[--><!--[-->fastslowsync<!--]--><!--]-->');
	});

	test('push async functions work with head content type', async () => {
		const component = (payload: Payload) => {
			payload.child(($$payload) => {
				$$payload.push(async () => {
					await Promise.resolve();
					return '<title>Async Title</title>';
				});
			}, 'head');
		};

		const { head, body } = await Payload.render(component as unknown as Component);
		expect(body).toBe('<!--[--><!--[--><!--]--><!--]-->');
		expect(head).toBe('<title>Async Title</title>');
	});

	test('push async functions can be mixed with child payloads', async () => {
		const component = (payload: Payload) => {
			payload.push('start-');
			payload.push(async () => {
				await Promise.resolve();
				return 'async-';
			});
			payload.child(($$payload) => {
				$$payload.push('child-');
			});
			payload.push('-end');
		};

		const { head, body } = await Payload.render(component as unknown as Component);
		expect(head).toBe('');
		expect(body).toBe('<!--[--><!--[-->start-async-child--end<!--]--><!--]-->');
	});

	test('push async functions work with compact operations', async () => {
		const component = (payload: Payload) => {
			payload.push('a');
			payload.push(async () => {
				await Promise.resolve();
				return 'b';
			});
			payload.push('c');
			payload.compact({
				start: 0,
				fn: (content) => ({ head: '', body: content.body.toUpperCase() })
			});
		};

		const { head, body } = await Payload.render(component as unknown as Component);
		expect(head).toBe('');
		expect(body).toBe('<!--[--><!--[-->ABC<!--]--><!--]-->');
	});

	test('push async functions are not supported in sync context', () => {
		const component = (payload: Payload) => {
			payload.push('a');
			payload.push(() => Promise.resolve('b'));
		};

		expect(() => Payload.render(component as unknown as Component).body).toThrow('await_invalid');
		expect(() => Payload.render(component as unknown as Component).html).toThrow('await_invalid');
		expect(() => Payload.render(component as unknown as Component).head).toThrow('await_invalid');
	});

	test('on_destroy yields callbacks in the correct order', async () => {
		const destroyed: string[] = [];
		const component = (payload: Payload) => {
			payload.component((payload) => {
				payload.on_destroy(() => destroyed.push('a'));
				// children should not alter relative order
				payload.child(async (payload) => {
					await Promise.resolve();
					payload.on_destroy(() => destroyed.push('b'));
					payload.on_destroy(() => destroyed.push('b*'));
				});
				// but child components should
				payload.component((payload) => {
					payload.on_destroy(() => destroyed.push('c'));
				});
				payload.child((payload) => {
					payload.on_destroy(() => destroyed.push('d'));
				});
				payload.component((payload) => {
					payload.on_destroy(() => destroyed.push('e'));
				});
			});
		};

		await Payload.render(component as unknown as Component);
		expect(destroyed).toEqual(['c', 'e', 'a', 'b', 'b*', 'd']);
	});
});
