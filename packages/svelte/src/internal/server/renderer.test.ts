import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { Renderer, SSRState } from './renderer.js';
import type { Component } from 'svelte';
import { disable_async_mode_flag, enable_async_mode_flag } from '../flags/index.js';

test('collects synchronous body content by default', () => {
	const component = (renderer: Renderer) => {
		renderer.push('a');
		renderer.child(($$renderer) => {
			$$renderer.push('b');
		});
		renderer.push('c');
	};

	const { head, body } = Renderer.render(component as unknown as Component);
	expect(head).toBe('');
	expect(body).toBe('<!--[-->abc<!--]-->');
});

test('child type switches content area (head vs body)', () => {
	const component = (renderer: Renderer) => {
		renderer.push('a');
		renderer.head(($$renderer) => {
			$$renderer.push('<title>T</title>');
		});
		renderer.push('b');
	};

	const { head, body } = Renderer.render(component as unknown as Component);
	expect(head).toBe('<title>T</title>');
	expect(body).toBe('<!--[-->ab<!--]-->');
});

test('child inherits parent type when not specified', () => {
	const component = (renderer: Renderer) => {
		renderer.head((renderer) => {
			renderer.push('<meta name="x"/>');
			renderer.child((renderer) => {
				renderer.push('<style>/* css */</style>');
			});
		});
	};

	const { head, body } = Renderer.render(component as unknown as Component);
	expect(body).toBe('<!--[--><!--]-->');
	expect(head).toBe('<meta name="x"/><style>/* css */</style>');
});

test('get_path returns the path indexes to a renderer', () => {
	const root = new Renderer(new SSRState('sync'));
	let child_a: InstanceType<typeof Renderer> | undefined;
	let child_b: InstanceType<typeof Renderer> | undefined;
	let child_b_0: InstanceType<typeof Renderer> | undefined;

	root.child(($$renderer) => {
		child_a = $$renderer;
		$$renderer.push('A');
	});
	root.child(($$renderer) => {
		child_b = $$renderer;
		$$renderer.child(($$inner) => {
			child_b_0 = $$inner;
			$$inner.push('B0');
		});
		$$renderer.push('B1');
	});

	expect(child_a!.get_path()).toEqual([0]);
	expect(child_b!.get_path()).toEqual([1]);
	expect(child_b_0!.get_path()).toEqual([1, 0]);
});

test('creating an async child in a sync context throws', () => {
	const component = (renderer: Renderer) => {
		renderer.push('a');
		renderer.child(async ($$renderer) => {
			await Promise.resolve();
			$$renderer.push('x');
		});
	};

	expect(() => Renderer.render(component as unknown as Component).head).toThrow('await_invalid');
	expect(() => Renderer.render(component as unknown as Component).html).toThrow('await_invalid');
	expect(() => Renderer.render(component as unknown as Component).body).toThrow('await_invalid');
});

test('local state is shallow-copied to children', () => {
	const root = new Renderer(new SSRState('sync'));
	root.local.select_value = 'A';
	let child: InstanceType<typeof Renderer> | undefined;
	root.child(($$renderer) => {
		child = $$renderer;
	});

	expect(child!.local.select_value).toBe('A');
	child!.local.select_value = 'B';
	expect(root.local.select_value).toBe('A');
});

test('subsume replaces tree content and state from other', () => {
	const a = new Renderer(new SSRState('async'));
	a.type = 'head';

	a.push('<meta />');
	a.local.select_value = 'A';

	const b = new Renderer(new SSRState('async'));
	b.child(async ($$renderer) => {
		await Promise.resolve();
		$$renderer.push('body');
	});
	b.global.css.add({ hash: 'h', code: 'c' });
	b.global.set_title('Title', [1]);
	b.local.select_value = 'B';
	b.promise = Promise.resolve();

	a.subsume(b);

	expect(a.type).toBe('body');
	expect(a.local.select_value).toBe('B');
	expect(a.promise).toBe(b.promise);
});

test('subsume refuses to switch modes', () => {
	const a = new Renderer(new SSRState('sync'));
	a.type = 'head';

	a.push('<meta />');
	a.local.select_value = 'A';

	const b = new Renderer(new SSRState('async'));
	b.child(async ($$renderer) => {
		await Promise.resolve();
		$$renderer.push('body');
	});
	b.global.css.add({ hash: 'h', code: 'c' });
	b.global.set_title('Title', [1]);
	b.local.select_value = 'B';
	b.promise = Promise.resolve();

	expect(() => a.subsume(b)).toThrow(
		"invariant: A renderer cannot switch modes. If you're seeing this, there's a compiler bug. File an issue!"
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

test('selects an option with an explicit value', () => {
	const component = (renderer: Renderer) => {
		renderer.select({ value: 2 }, (renderer) => {
			renderer.option({ value: 1 }, (renderer) => renderer.push('one'));
			renderer.option({ value: 2 }, (renderer) => renderer.push('two'));
			renderer.option({ value: 3 }, (renderer) => renderer.push('three'));
		});
	};

	const { head, body } = Renderer.render(component as unknown as Component);
	expect(head).toBe('');
	expect(body).toBe(
		'<!--[--><select><option value="1">one</option><option value="2" selected="">two</option><option value="3">three</option></select><!--]-->'
	);
});

test('selects an option with an implicit value', () => {
	const component = (renderer: Renderer) => {
		renderer.select({ value: 'two' }, (renderer) => {
			renderer.option({}, (renderer) => renderer.push('one'));
			renderer.option({}, (renderer) => renderer.push('two'));
			renderer.option({}, (renderer) => renderer.push('three'));
		});
	};

	const { head, body } = Renderer.render(component as unknown as Component);
	expect(head).toBe('');
	expect(body).toBe(
		'<!--[--><select><option>one</option><option selected="">two</option><option>three</option></select><!--]-->'
	);
});

test('select merges scoped css hash with static class', () => {
	const component = (renderer: Renderer) => {
		renderer.select(
			{ class: 'foo', value: 'foo' },
			(renderer) => {
				renderer.option({ value: 'foo' }, (renderer) => renderer.push('foo'));
			},
			'svelte-hash'
		);
	};

	const { head, body } = Renderer.render(component as unknown as Component);
	expect(head).toBe('');
	expect(body).toBe(
		'<!--[--><select class="foo svelte-hash"><option value="foo" selected="">foo</option></select><!--]-->'
	);
});

describe('boundary hydration comment escaping', () => {
	const failed_snippet = (renderer: Renderer, error: unknown) => {
		renderer.push(`<p>${(error as { message: string }).message}</p>`);
	};

	const transform = (error: unknown) => ({ message: (error as Error).message });

	const payloads = [
		{ name: 'escapes -->', input: '--><img src=x onerror=alert(1)><!--', expected: '{"message":"--\\u003e\\u003cimg src=x onerror=alert(1)\\u003e\\u003c!--"}' },
		{ name: 'escapes <!--', input: '<!--<script>alert(1)</script>', expected: '{"message":"\\u003c!--\\u003cscript\\u003ealert(1)\\u003c/script\\u003e"}' },
		{ name: 'escapes <!-->',  input: '<!-->', expected: '{"message":"\\u003c!--\\u003e"}' },
		{ name: 'escapes <!--->',  input: '<!--->', expected: '{"message":"\\u003c!---\\u003e"}' },
		{ name: 'escapes multiple -->', input: '-->one-->two-->', expected: '{"message":"--\\u003eone--\\u003etwo--\\u003e"}' },
		{ name: 'escapes --->', input: '--->', expected: '{"message":"---\\u003e"}' },
		{ name: 'no double-encoding', input: '--\\u003e', expected: '{"message":"--\\\\u003e"}' },
		{ name: 'the terrifying special pointy boy', input: '--!>ooh, what an exotic closing comment tag', expected: '{"message":"--!\\u003eooh, what an exotic closing comment tag"}' }
	];

	type RenderFn = (input: string) => Promise<string> | string;

	const paths: Array<{ path: string; async: boolean; render: RenderFn }> = [
		{
			path: 'sync children, sync transformError',
			async: false,
			render: (input) => {
				const component = (renderer: Renderer) => {
					renderer.boundary({ failed: failed_snippet }, () => { throw new Error(input); });
				};
				return Renderer.render(component as unknown as Component, { transformError: transform } as any).body;
			}
		},
		{
			path: 'sync children, async transformError',
			async: true,
			render: async (input) => {
				const component = (renderer: Renderer) => {
					renderer.boundary({ failed: failed_snippet }, () => { throw new Error(input); });
				};
				return (await Renderer.render(component as unknown as Component, {
					transformError: (error: unknown) => Promise.resolve(transform(error))
				} as any)).body;
			}
		},
		{
			path: 'async children throw',
			async: true,
			render: async (input) => {
				const component = (renderer: Renderer) => {
					renderer.boundary({ failed: failed_snippet }, async () => {
						await Promise.resolve();
						throw new Error(input);
					});
				};
				return (await Renderer.render(component as unknown as Component, {
					transformError: transform
				} as any)).body;
			}
		}
	];

	describe.each(paths)('$path', ({ async: needs_async, render }) => {
		if (needs_async) {
			beforeAll(() => enable_async_mode_flag());
			afterAll(() => disable_async_mode_flag());
		}

		test.each(payloads)('$name', async ({ input, expected }) => {
			const body = await render(input);

			// Extract the content between <!--[? and the first -->
			// If escaping is broken, an unescaped --> in the JSON will truncate
			// the match and the content won't equal the expected escaped JSON.
			const match = body.match(/<!--\[\?(.+?)-->/);
			expect(match, 'expected a hydration comment in output').toBeTruthy();
			expect(match![1]).toBe(expected);
		});
	});
});

describe('async', () => {
	beforeAll(() => {
		enable_async_mode_flag();
	});

	afterAll(() => {
		disable_async_mode_flag();
	});

	test('awaiting renderer gets async content', async () => {
		const component = (renderer: Renderer) => {
			renderer.push('1');
			renderer.child(async ($$renderer) => {
				await Promise.resolve();
				$$renderer.push('2');
			});
			renderer.push('3');
		};

		const result = await Renderer.render(component as unknown as Component);
		expect(result.head).toBe('');
		expect(result.body).toBe('<!--[-->123<!--]-->');
		expect(() => result.html).toThrow('html_deprecated');
	});

	test('push accepts async functions in async context', async () => {
		const component = (renderer: Renderer) => {
			renderer.push('a');
			renderer.push(async () => {
				await Promise.resolve();
				return 'b';
			});
			renderer.push('c');
		};

		const { head, body } = await Renderer.render(component as unknown as Component);
		expect(head).toBe('');
		expect(body).toBe('<!--[-->abc<!--]-->');
	});

	test('push handles async functions with different timing', async () => {
		const component = (renderer: Renderer) => {
			renderer.push(async () => {
				await Promise.resolve();
				return 'fast';
			});
			renderer.push(async () => {
				await new Promise((resolve) => setTimeout(resolve, 10));
				return 'slow';
			});
			renderer.push('sync');
		};

		const { head, body } = await Renderer.render(component as unknown as Component);
		expect(head).toBe('');
		expect(body).toBe('<!--[-->fastslowsync<!--]-->');
	});

	test('push async functions work with head content type', async () => {
		const component = (renderer: Renderer) => {
			renderer.head(($$renderer) => {
				$$renderer.push(async () => {
					await Promise.resolve();
					return '<title>Async Title</title>';
				});
			});
		};

		const { head, body } = await Renderer.render(component as unknown as Component);
		expect(body).toBe('<!--[--><!--]-->');
		expect(head).toBe('<title>Async Title</title>');
	});

	test('push async functions can be mixed with child renderers', async () => {
		const component = (renderer: Renderer) => {
			renderer.push('start-');
			renderer.push(async () => {
				await Promise.resolve();
				return 'async-';
			});
			renderer.child(($$renderer) => {
				$$renderer.push('child-');
			});
			renderer.push('-end');
		};

		const { head, body } = await Renderer.render(component as unknown as Component);
		expect(head).toBe('');
		expect(body).toBe('<!--[-->start-async-child--end<!--]-->');
	});

	test('push async functions are not supported in sync context', () => {
		const component = (renderer: Renderer) => {
			renderer.push('a');
			renderer.push(() => Promise.resolve('b'));
		};

		expect(() => Renderer.render(component as unknown as Component).body).toThrow('await_invalid');
		expect(() => Renderer.render(component as unknown as Component).html).toThrow('await_invalid');
		expect(() => Renderer.render(component as unknown as Component).head).toThrow('await_invalid');
	});

	test('on_destroy yields callbacks in the correct order', async () => {
		const destroyed: string[] = [];
		const component = (renderer: Renderer) => {
			renderer.component((renderer) => {
				renderer.on_destroy(() => destroyed.push('a'));
				// children should not alter relative order
				renderer.child(async (renderer) => {
					await Promise.resolve();
					renderer.on_destroy(() => destroyed.push('b'));
					renderer.on_destroy(() => destroyed.push('b*'));
				});
				// but child components should
				renderer.component((renderer) => {
					renderer.on_destroy(() => destroyed.push('c'));
				});
				renderer.child((renderer) => {
					renderer.on_destroy(() => destroyed.push('d'));
				});
				renderer.component((renderer) => {
					renderer.on_destroy(() => destroyed.push('e'));
				});
			});
		};

		await Renderer.render(component as unknown as Component);
		expect(destroyed).toEqual(['c', 'e', 'a', 'b', 'b*', 'd']);
	});
});
