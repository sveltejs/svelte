import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import vm from 'node:vm';
import type { Component } from 'svelte';
import { Renderer } from './renderer.js';
import { disable_async_mode_flag, enable_async_mode_flag } from '../flags/index.js';
import { withWarp } from './render-context.js';
import { Warp } from './warp.js';
import { hydratable } from './hydratable.js';
import { getAbortSignal } from './abort-signal.js';
import { Warp as ClientWarp, receive_warp_values } from '../client/warp.js';

beforeAll(() => {
	enable_async_mode_flag();
});

afterAll(() => {
	disable_async_mode_flag();
});

const warp = new Warp<string, any>('test');

function as_component(fn: (renderer: Renderer) => void) {
	return fn as unknown as Component;
}

function render(fn: (renderer: Renderer) => void, options?: Parameters<typeof Renderer.render>[1]) {
	return Renderer.render(as_component(fn), options);
}

/** The contents of the `<script>`s that Svelte rendered into `html` */
function scripts(html: string) {
	return html
		.split('</script>')
		.slice(0, -1)
		.map((part) => part.slice(part.indexOf('>', part.indexOf('<script')) + 1));
}

/** Runs the warp `<script>`s in `head` against a fake `window`, and returns the revived values */
function revive(head: string) {
	const window: Pick<Window, '__svelte'> = {};

	for (const script of scripts(head)) {
		new Function('window', script)(window);
	}

	if (window.__svelte) receive_warp_values(window.__svelte);
	return window.__svelte?.w;
}

describe('Warp', () => {
	test('serializes values into the head', async () => {
		const { head } = await render(() => {
			warp.set('a', 1);
			warp.set('b', { nested: [new Date(0)] });
		});

		const values = revive(head)?.get('test');
		expect(values?.get('a')).toBe(1);
		expect(values?.get('b')).toEqual({ nested: [new Date(0)] });
	});

	test('hands values to the client whether its `Warp` reads them before or after the script runs', async () => {
		const client = new ClientWarp<string, any>('test');
		const window: Pick<Window, '__svelte'> = {};
		vi.stubGlobal('window', window);

		try {
			const run = (head: string) => {
				for (const script of scripts(head)) new Function('window', script)(window);
			};

			// the script runs first, so its values wait for the client
			run((await render(() => warp.set('a', Promise.resolve(1)))).head);
			expect(window.__svelte?.w).toBeUndefined();
			expect(await client.get('a')).toBe(1);

			// the client is already running (e.g. the HTML was inserted later), so the values are added right away
			run((await render(() => warp.set('b', 2))).head);
			expect(window.__svelte?.w?.get('test')?.get('b')).toBe(2);
			expect(client.get('a')).toBeInstanceOf(Promise);
		} finally {
			vi.unstubAllGlobals();
		}
	});

	test('omits the script when there are no values', async () => {
		const { head } = await render(() => {});
		expect(head).toBe('');
	});

	test('supports Map methods on the server', async () => {
		await render(() => {
			expect(warp.getOrInsert('a', 1)).toBe(1);
			expect(warp.getOrInsert('a', 2)).toBe(1);
			expect(warp.getOrInsertComputed('b', () => 3)).toBe(3);
			expect(warp.getOrInsertComputed('b', () => 4)).toBe(3);
			expect(warp.has('a')).toBe(true);
			expect(warp.get('b')).toBe(3);
			expect(warp.size).toBe(2);
			expect([...warp]).toEqual([
				['a', 1],
				['b', 3]
			]);
			expect(() => warp.delete('a')).toThrow('warp_method_unsupported');
			expect(() => warp.clear()).toThrow('warp_method_unsupported');
		});
	});

	test('keeps different Warps separate', async () => {
		const other = new Warp<string, number>('other');

		const { head } = await render(() => {
			warp.set('a', 1);
			other.set('a', 2);
		});

		const values = revive(head);
		expect(values?.get('test')?.get('a')).toBe(1);
		expect(values?.get('other')?.get('a')).toBe(2);
	});

	test('waits for promises, including nested ones', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

		try {
			const { head } = await render(() => {
				warp.set(
					'a',
					Promise.resolve({ nested: new Promise((fulfil) => setTimeout(() => fulfil(42), 20)) })
				);
			});

			const a = await revive(head)?.get('test')?.get('a');
			expect(await (a as any).nested).toBe(42);

			// the nested promise was still pending when the render finished
			expect(warn).toHaveBeenCalledOnce();
			expect(warn.mock.calls[0][0]).toContain('unresolved_warp');
		} finally {
			warn.mockRestore();
		}
	});

	test('treats replacement tokens in promise values as literals', async () => {
		const { head } = await render(() => {
			warp.set('a', Promise.resolve(`$'`));
		});

		expect(await revive(head)?.get('test')?.get('a')).toBe(`$'`);
	});

	test('escapes values that could close the script', async () => {
		const { head } = await render(() => {
			warp.set('</script>', '</script><script>throw new Error("pwned")</script>');
		});

		expect(head.match(/<\/script>/g)).toHaveLength(1);
		expect(revive(head)?.get('test')?.get('</script>')).toBe(
			'</script><script>throw new Error("pwned")</script>'
		);
	});

	test('rejects promises on the client with the result of transformError', async () => {
		const { head } = await render(
			() => {
				const promise = Promise.reject(new Error('secret'));
				promise.catch(() => {});
				warp.set('a', promise);
			},
			{ transformError: (error) => ({ message: (error as Error).message.toUpperCase() }) }
		);

		await expect(revive(head)?.get('test')?.get('a')).rejects.toEqual({ message: 'SECRET' });
	});

	test('calls transformError once for a rejection caught by a boundary', async () => {
		const transform_error = vi.fn((error) => ({ message: (error as Error).message }));

		const { head, body } = await render(
			(renderer) => {
				const promise = Promise.reject(new Error('secret'));
				promise.catch(() => {});
				warp.set('a', promise);

				renderer.boundary(
					{
						failed: (renderer, error) => renderer.push((error as Error).message)
					},
					async () => {
						await promise;
					}
				);
			},
			{ transformError: transform_error }
		);

		expect(body).toContain('secret');
		await expect(revive(head)?.get('test')?.get('a')).rejects.toEqual({ message: 'secret' });
		expect(transform_error).toHaveBeenCalledOnce();
	});

	test('rejects promises on the client with a generic error by default', async () => {
		const { head } = await render(() => {
			const promise = Promise.reject(new Error('secret'));
			promise.catch(() => {});
			warp.set('a', promise);
		});

		expect(head).not.toContain('secret');
		await expect(revive(head)?.get('test')?.get('a')).rejects.toThrow(
			'devalue: failed to serialize asynchronous value'
		);
	});

	test('fails the render for unserializable values', async () => {
		await expect(
			render(() => {
				warp.set(
					'a',
					Promise.resolve(() => {})
				);
			})
		).rejects.toThrow('warp_serialization_failed');
	});

	test('cannot be used outside a render', () => {
		expect(() => warp.get('a')).toThrow('server_context_required');
	});

	test('cannot add values after they have been serialized', async () => {
		let promise: Promise<void> | undefined;

		await render(() => {
			promise = Promise.resolve().then(() =>
				new Promise((fulfil) => setTimeout(fulfil)).then(() => {
					warp.set('a', 1);
				})
			);
		});

		await expect(promise).rejects.toThrow('Cannot set key `a` in `Warp` `test`');
	});

	test('uses the replacer passed to render', async () => {
		class Vector {
			constructor(
				public x: number,
				public y: number
			) {}
		}

		const { head } = await render(
			() => {
				warp.set('a', Promise.resolve(new Vector(1, 2)));
			},
			{
				replacer: (value, js) => {
					if (value instanceof Vector) return js`{ vector: [${value.x}, ${value.y}] }`;
				}
			}
		);

		expect(await revive(head)?.get('test')?.get('a')).toEqual({ vector: [1, 2] });
	});
});

describe('withWarp', () => {
	test('shares its context with the render inside it', async () => {
		const { head } = await withWarp(async () => {
			warp.set('before', 1);
			await Promise.resolve();
			return render(() => {
				expect(warp.get('before')).toBe(1);
				warp.set('during', 2);
			});
		});

		const values = revive(head)?.get('test');
		expect(values?.get('before')).toBe(1);
		expect(values?.get('during')).toBe(2);
	});

	test('returns the result of the function', async () => {
		expect(await withWarp(() => 42)).toBe(42);
	});

	test('only allows one render', async () => {
		await expect(
			withWarp(async () => {
				await render(() => {});
				await render(() => {});
			})
		).rejects.toThrow('warp_context_already_rendered');
	});

	test('cannot be nested', async () => {
		await expect(withWarp(() => withWarp(() => {}))).rejects.toThrow('warp_context_nested');
	});

	test('keeps concurrent contexts separate', async () => {
		const [a, b] = await Promise.all(
			['a', 'b'].map((key) =>
				withWarp(async () => {
					warp.set(key, key);
					await new Promise((fulfil) => setTimeout(fulfil));
					return render(() => {});
				})
			)
		);

		expect([...(revive(a.head)?.get('test') ?? [])]).toEqual([['a', 'a']]);
		expect([...(revive(b.head)?.get('test') ?? [])]).toEqual([['b', 'b']]);
	});

	test('queues concurrent renders and contexts in WebContainers', async () => {
		// eslint-disable-next-line n/prefer-global/process
		const versions = process.versions as Record<string, string | undefined>;
		versions.webcontainer = '1';

		try {
			// `render` is lazy, so start it now
			const first = Promise.resolve(
				render((renderer) => {
					warp.set('a', 'a');
					renderer.child(() => new Promise((fulfil) => setTimeout(fulfil, 20)));
				})
			);

			// make sure the first render is underway before starting the others
			await new Promise((fulfil) => setTimeout(fulfil));

			const results = await Promise.all([
				first,
				render(() => {
					warp.set('b', 'b');
				}),
				withWarp(() =>
					render(() => {
						warp.set('c', 'c');
					})
				)
			]);

			expect(results.map(({ head }) => [...(revive(head)?.get('test') ?? [])])).toEqual([
				[['a', 'a']],
				[['b', 'b']],
				[['c', 'c']]
			]);
		} finally {
			delete versions.webcontainer;
		}
	});

	test('runs the render replacer before its own', async () => {
		const { head } = await withWarp(
			() =>
				render(
					() => {
						warp.set('a', new URL('https://svelte.dev'));
						warp.set('b', new Error('b'));
					},
					{
						replacer: (value, js) => {
							if (value instanceof URL) return js`"render"`;
						}
					}
				),
			{
				replacer: (value, js) => {
					if (value instanceof URL) return js`"withWarp"`;
					if (value instanceof Error) return js`"withWarp"`;
				}
			}
		);

		const values = revive(head)?.get('test');
		expect(values?.get('a')).toBe('render');
		expect(values?.get('b')).toBe('withWarp');
	});

	test('throws when a key is set twice', async () => {
		await expect(
			render(() => {
				warp.set('a', 1);
				warp.set('a', 2);
			})
		).rejects.toThrow('warp_key_exists');
	});

	test('getOrInsert does not throw when the key exists', async () => {
		const { head } = await render(() => {
			warp.set('a', 1);
			expect(warp.getOrInsert('a', 2)).toBe(1);
			expect(warp.getOrInsertComputed('a', () => 3)).toBe(1);
		});

		expect(revive(head)?.get('test')?.get('a')).toBe(1);
	});
});

describe('hydratable', () => {
	test('is stored in its own Warp', async () => {
		const { head } = await render(() => {
			hydratable('a', () => 1);
			warp.set('a', 2);
		});

		const values = revive(head);
		expect(values?.get('svelte:hydratable')?.get('a')).toBe(1);
		expect(values?.get('test')?.get('a')).toBe(2);
	});

	test('keeps the first value for a key without calling fn again', async () => {
		const second = vi.fn(() => 2);

		const { head } = await render(() => {
			expect(hydratable('a', () => 1)).toBe(1);
			expect(hydratable('a', second)).toBe(1);
		});

		expect(second).not.toHaveBeenCalled();
		expect(revive(head)?.get('svelte:hydratable')?.get('a')).toBe(1);
	});
});

describe('streaming', () => {
	function delay<T>(value: T, ms = 0) {
		return new Promise<T>((fulfil) => setTimeout(() => fulfil(value), ms));
	}

	type FakeWindow = Pick<Window, '__svelte'>;

	/** Runs the `<script>`s in `html`, and has the client handle the values they push */
	function run(window: FakeWindow, html: string) {
		for (const [, script] of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
			new Function('window', script)(window);
		}

		if (window.__svelte) receive_warp_values(window.__svelte);
	}

	/** Runs the head and then the tail, and returns the revived values once everything has been evaluated */
	async function revive_streamed(head: string, tail: AsyncIterable<string>) {
		const window: FakeWindow = {};
		run(window, head);

		// the stream registers itself until it's done
		expect(window.__svelte?.r?.s.size).toBe(1);

		const chunks: string[] = [];
		for await (const chunk of tail) {
			chunks.push(chunk);
			run(window, chunk);
		}

		expect(window.__svelte?.r).toBeUndefined();

		return { values: window.__svelte?.w, chunks };
	}

	test('has an empty tail without background work', async () => {
		const { tail } = await render(() => {
			warp.set('a', Promise.resolve(1));
		});

		const chunks = [];
		for await (const chunk of tail) chunks.push(chunk);
		expect(chunks).toEqual([]);
	});

	test('discards the output of background work', async () => {
		const { body, head } = await render((renderer) => {
			renderer.push('<p>loading</p>');
			renderer.background(async (renderer) => {
				await delay(null);
				renderer.push('<p>loaded</p>');
				renderer.title((renderer) => renderer.push('<title>nope</title>'));
			});
		});

		expect(body).toBe('<!--[--><p>loading</p><!--]-->');
		expect(head).not.toContain('nope');
	});

	test('resolves the values added by the render in the head, including nested and unawaited ones', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

		try {
			const { head, tail } = await render((renderer) => {
				warp.set('awaited', Promise.resolve('awaited'));
				warp.set('nested', Promise.resolve({ inner: delay('inner', 10) }));
				// not awaited by anything, but added by the render, so it holds up the head
				warp.set('unawaited', delay('unawaited', 20));

				renderer.background(async () => {
					await delay(null, 50);
				});
			});

			expect(head).toContain('"awaited"');
			expect(head).toContain('"inner"');
			expect(head).toContain('"unawaited"');

			expect(warn).toHaveBeenCalledOnce();
			expect(warn.mock.calls[0][0]).toContain('unresolved_warp');
			expect(warn.mock.calls[0][0]).toContain('`unawaited` in `test`');

			await revive_streamed(head, tail);
		} finally {
			warn.mockRestore();
		}
	});

	test('waits for promises from another realm in the head', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

		try {
			const promise = vm.runInNewContext(
				'new Promise((fulfil) => setTimeout(() => fulfil("other realm"), 20))',
				{ setTimeout }
			);

			const { head, tail } = await render((renderer) => {
				warp.set('promise', promise);
				renderer.background(async () => {
					await delay(null, 50);
				});
			});

			expect(promise).not.toBeInstanceOf(Promise);
			expect(head).toContain('"other realm"');
			await revive_streamed(head, tail);
		} finally {
			warn.mockRestore();
		}
	});

	test('streams the values added by background work, even if they have already resolved', async () => {
		const { head, tail } = await render((renderer) => {
			renderer.background(() => {
				warp.set('resolved', Promise.resolve('resolved value'));
				warp.set('sync', 'sync');
			});

			// give the background promise plenty of time to resolve before the head is serialized
			renderer.child(async () => {
				await delay(null, 20);
			});
		});

		expect(head).not.toContain('resolved value');

		// the client knows about the values when it hydrates, but the promise is still pending
		const window: FakeWindow = {};
		run(window, head);
		const promise = window.__svelte?.w?.get('test')?.get('resolved');
		expect(promise).toBeInstanceOf(Promise);
		expect(window.__svelte?.w?.get('test')?.get('sync')).toBe('sync');

		for await (const chunk of tail) run(window, chunk);
		expect(await promise).toBe('resolved value');
	});

	test('resolves values added by background work in the head if the render reads them', async () => {
		const { head, tail } = await render((renderer) => {
			renderer.background(() => {
				warp.set('read', delay('read value', 10));
				warp.set('created', delay('created value', 10));
				warp.set('unread', delay('unread value', 10));
			});

			renderer.child(async (renderer) => {
				renderer.push(await warp.get('read'));
				// the render gets the background work's value, rather than creating its own
				renderer.push(await warp.getOrInsertComputed('created', () => delay('main')));
			});
		});

		expect(head).toContain('read value');
		expect(head).toContain('created value');
		expect(head).not.toContain('"main"');
		expect(head).not.toContain('unread value');

		const { values } = await revive_streamed(head, tail);
		expect(await values?.get('test')?.get('unread')).toBe('unread value');
	});

	test('reads from background work do not move values into the head', async () => {
		const { head, tail } = await render((renderer) => {
			renderer.background(async () => {
				warp.set('a', delay('a value', 10));
				await warp.get('a');
			});

			renderer.background(async () => {
				await warp.get('a');
			});
		});

		expect(head).not.toContain('a value');

		const { values } = await revive_streamed(head, tail);
		expect(await values?.get('test')?.get('a')).toBe('a value');
	});

	test('tracks background work through awaits in helper functions', async () => {
		async function get_user() {
			await delay(null);
			return warp.getOrInsertComputed('user', () => delay({ id: 1 }, 10));
		}

		const { head, tail } = await render((renderer) => {
			renderer.background(async () => {
				const user = await get_user();
				warp.set(`posts:${user.id}`, delay(['a', 'b'], 10));
			});
		});

		expect(head).not.toContain('posts');

		const { values } = await revive_streamed(head, tail);
		expect(await values?.get('test')?.get('user')).toEqual({ id: 1 });
		expect(await values?.get('test')?.get('posts:1')).toEqual(['a', 'b']);
	});

	test('keeps references between values in the head and values in the tail', async () => {
		const shared = { value: 1 };
		const promise = delay(shared, 10);

		const { head, tail } = await render((renderer) => {
			warp.set('main', shared);
			warp.set('main:promise', promise);

			renderer.background(async () => {
				await delay(null, 20);
				warp.set('background', { shared, promise });
			});
		});

		const { values } = await revive_streamed(head, tail);
		const background = values?.get('test')?.get('background') as any;
		expect(background.shared).toBe(values?.get('test')?.get('main'));
		expect(background.promise).toBe(values?.get('test')?.get('main:promise'));
	});

	test('adds values that depend on a promise in the same chunk that resolves it', async () => {
		const { head, tail } = await render((renderer) => {
			renderer.background(async () => {
				const user = await warp.getOrInsertComputed('user', () => delay({ id: 1 }, 10));
				warp.set(`name:${user.id}`, 'Rich');
			});
		});

		const window: FakeWindow = {};
		run(window, head);

		const user = window.__svelte?.w?.get('test')?.get('user') as Promise<unknown>;
		let found: unknown;
		user.then(() => (found = window.__svelte?.w?.get('test')?.get('name:1')));

		for await (const chunk of tail) run(window, chunk);

		await user;
		expect(found).toBe('Rich');
	});

	test('streams values the render adds after the head while the tail is open', async () => {
		let promise: Promise<void> | undefined;

		const { head, tail } = await render((renderer) => {
			promise = delay(null, 10).then(() => {
				warp.set('late', 'late');
			});

			renderer.background(async () => {
				await delay(null, 30);
			});
		});

		const { values } = await revive_streamed(head, tail);
		await promise;
		expect(values?.get('test')?.get('late')).toBe('late');
	});

	test('cannot add values after the background work is done', async () => {
		let promise: Promise<void> | undefined;

		const { tail } = await render((renderer) => {
			renderer.background(async () => {
				await delay(null);
			});

			promise = delay(null, 20).then(() => {
				warp.set('a', 1);
			});
		});

		for await (const _ of tail);

		await expect(promise).rejects.toThrow('warp_set_after_render');
	});

	test('skips streamed values that cannot be serialized, without breaking the rest of the stream', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

		try {
			const { head, tail } = await render((renderer) => {
				renderer.background(async () => {
					await delay(null, 10);
					warp.set('before', 'before');
					warp.set('bad', { fn: () => {} });
					warp.set('same-batch', 'same-batch');

					await delay(null, 10);
					warp.set('later', 'later');
				});
			});

			const { values } = await revive_streamed(head, tail);
			expect(values?.get('test')?.has('bad')).toBe(false);
			expect(values?.get('test')?.get('before')).toBe('before');
			expect(values?.get('test')?.get('same-batch')).toBe('same-batch');
			expect(values?.get('test')?.get('later')).toBe('later');

			expect(warn).toHaveBeenCalledOnce();
			expect(warn.mock.calls[0][0]).toContain('warp_stream_serialization_failed');
		} finally {
			warn.mockRestore();
		}
	});

	test('skips values added by background work before the head that cannot be serialized', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

		try {
			const { head, tail } = await render((renderer) => {
				renderer.background(async () => {
					warp.set('before', 'before');
					warp.set('bad', { fn: () => {} });
					warp.set('after', 'after');
					await delay(null, 10);
					warp.set('later', 'later');
				});
			});

			// the client knows about the other values when it hydrates
			const window: FakeWindow = {};
			run(window, head);
			expect([...(window.__svelte?.w?.get('test')?.keys() ?? [])]).toEqual(['before', 'after']);

			for await (const chunk of tail) run(window, chunk);
			expect(window.__svelte?.w?.get('test')?.get('later')).toBe('later');
			expect(window.__svelte?.w?.get('test')?.has('bad')).toBe(false);

			expect(warn).toHaveBeenCalledOnce();
			expect(warn.mock.calls[0][0]).toContain('warp_stream_serialization_failed');
		} finally {
			warn.mockRestore();
		}
	});

	test('rejects streamed promises that resolve to something that cannot be serialized', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

		try {
			const { head, tail } = await render((renderer) => {
				renderer.background(() => {
					warp.set('bad', delay({ fn: () => {} }, 10));
					warp.set('good', delay('good', 20));
				});
			});

			const { values } = await revive_streamed(head, tail);
			await expect(values?.get('test')?.get('bad')).rejects.toThrow();
			expect(await values?.get('test')?.get('good')).toBe('good');
			expect(warn.mock.calls[0][0]).toContain('warp_stream_serialization_failed');
		} finally {
			warn.mockRestore();
		}
	});

	test('fails the render if a value in the head cannot be serialized', async () => {
		await expect(
			render((renderer) => {
				warp.set('bad', delay({ fn: () => {} }));
				renderer.background(() => {});
			})
		).rejects.toThrow('warp_serialization_failed');
	});

	test('rejects promises with the result of transformError, in the head and in the tail', async () => {
		const { head, tail } = await render(
			(renderer) => {
				const main = Promise.reject(new Error('main'));
				main.catch(() => {});
				warp.set('main', main);

				renderer.background(() => {
					warp.set(
						'background',
						delay(null, 10).then(() => {
							throw new Error('background');
						})
					);
				});
			},
			{
				transformError: async (error) => {
					await delay(null, 10);
					return { message: (error as Error).message.toUpperCase() };
				}
			}
		);

		expect(head).toContain('"MAIN"');
		expect(head).not.toContain('"BACKGROUND"');

		const { values } = await revive_streamed(head, tail);
		await expect(values?.get('test')?.get('main')).rejects.toEqual({ message: 'MAIN' });
		await expect(values?.get('test')?.get('background')).rejects.toEqual({ message: 'BACKGROUND' });
	});

	test('gives background work its own ids', async () => {
		let ids: string[] = [];

		await render((renderer) => {
			ids.push(renderer.global.uid());
			renderer.background((renderer) => {
				ids.push(renderer.global.uid());
			});
		});

		expect(ids[0]).not.toBe(ids[1]);
	});

	test('stops background work if the tail is abandoned', async () => {
		let signal: AbortSignal | undefined;
		let destroyed = false;
		let finish = () => {};

		const { tail } = await render((renderer) => {
			renderer.background((renderer) => {
				renderer.component((renderer) => {
					signal = getAbortSignal();
					renderer.on_destroy(() => (destroyed = true));
					warp.set('never', new Promise(() => {}));
					return new Promise<void>((fulfil) => (finish = fulfil));
				});
			});
		});

		const iterator = tail[Symbol.asyncIterator]();
		expect(signal?.aborted).toBe(false);
		await iterator.return?.();
		expect(signal?.aborted).toBe(true);

		// `onDestroy` waits until the background work has settled
		await delay(null);
		expect(destroyed).toBe(false);
		finish();
		await delay(null);
		expect(destroyed).toBe(true);
	});

	test('does not abort signals until the tail is done', async () => {
		let main: AbortSignal | undefined;
		let background: AbortSignal | undefined;

		const { tail } = await render((renderer) => {
			main = getAbortSignal();

			renderer.background(async (renderer) => {
				renderer.component(() => {
					background = getAbortSignal();
					// not awaited, so the background work settles before it does
					warp.set('background', delay('background', 50));
				});
				await delay(null, 20);
			});
		});

		expect(main?.aborted).toBe(false);
		expect(background?.aborted).toBe(false);

		const iterator = tail[Symbol.asyncIterator]();
		let result = await iterator.next();
		let chunks = 0;

		while (!result.done) {
			chunks += 1;

			// the last chunk is only generated once every streamed promise has settled
			if (!result.value.includes('return 1}')) {
				expect(main?.aborted).toBe(false);
				expect(background?.aborted).toBe(false);
			}

			result = await iterator.next();
		}

		expect(chunks).toBeGreaterThan(0);
		expect(main?.aborted).toBe(true);
		expect(background?.aborted).toBe(true);
	});

	test('aborts signals right away without background work', async () => {
		let main: AbortSignal | undefined;

		await render(() => {
			main = getAbortSignal();
		});

		expect(main?.aborted).toBe(true);
	});

	test('does not mix up the client state of concurrent streams', async () => {
		const render_one = (value: string) =>
			render((renderer) => {
				renderer.background(async () => {
					await delay(null, 10);
					warp.set(value, delay(value, 10));
				});
			});

		// same (default) `idPrefix`, evaluated on the same page while both are streaming
		const [a, b] = await Promise.all([render_one('a'), render_one('b')]);

		const window: FakeWindow = {};
		run(window, a.head);
		run(window, b.head);
		expect(window.__svelte?.r?.s.size).toBe(2);

		const drain = async (tail: AsyncIterable<string>) => {
			for await (const chunk of tail) run(window, chunk);
		};

		await Promise.all([drain(a.tail), drain(b.tail)]);

		expect(await window.__svelte?.w?.get('test')?.get('a')).toBe('a');
		expect(await window.__svelte?.w?.get('test')?.get('b')).toBe('b');
		expect(window.__svelte?.r).toBeUndefined();
	});

	test('cannot be used with csp.hash', async () => {
		await expect(
			render(
				(renderer) => {
					renderer.background(() => {});
				},
				{ csp: { hash: true } }
			)
		).rejects.toThrow('invalid_csp_streaming');
	});

	test('adds the nonce to streamed scripts', async () => {
		const { tail } = await render(
			(renderer) => {
				renderer.background(() => {
					warp.set('a', delay(1));
				});
			},
			{ csp: { nonce: 'xyz' } }
		);

		for await (const chunk of tail) {
			expect(chunk.startsWith('<script nonce="xyz">')).toBe(true);
		}
	});

	describe('client changes', () => {
		const client = new ClientWarp<string, any>('test');
		const other_client = new ClientWarp<string, any>('other');
		const other = new Warp<string, any>('other');

		/**
		 * Runs the head and the tail against a shared fake `window`, which the client `Warp`s also use,
		 * calling `change` after the head (i.e. while values are still streaming in)
		 */
		async function stream_to_client(
			{ head, tail }: { head: string; tail: AsyncIterable<string> },
			change: () => void
		) {
			const window: FakeWindow = {};
			vi.stubGlobal('window', window);

			run(window, head);
			change();

			for await (const chunk of tail) run(window, chunk);

			expect(window.__svelte?.r).toBeUndefined();
		}

		afterEach(() => {
			vi.unstubAllGlobals();
		});

		test('are not overwritten by values streamed in later', async () => {
			let a: unknown;

			await stream_to_client(
				await render((renderer) => {
					warp.set('a', 1);
					renderer.background(async () => {
						await delay(null, 10);
						warp.set('a2', 'server');
						warp.set('b', 'server');
						warp.set('c', 'server');
						warp.set('d', 'server');
					});
				}),
				() => {
					client.set('b', 'client');
					client.delete('c');
					a = client.getOrInsertComputed('d', () => 'client');
				}
			);

			expect(a).toBe('client');
			expect([...client]).toEqual([
				['a', 1],
				['b', 'client'],
				['d', 'client'],
				['a2', 'server']
			]);
		});

		test('are not overwritten for keys that devalue encodes differently', async () => {
			// long strings are deduplicated into devalue's table
			const long = 'x'.repeat(300);
			const keys = [long, 10n, -0, NaN, true];
			const mixed = new ClientWarp<any, any>('mixed');
			const server = new Warp<any, any>('mixed');

			await stream_to_client(
				await render((renderer) => {
					server.set(long + '!', long);
					renderer.background(async () => {
						await delay(null, 10);
						for (const key of keys) server.set(key, 'server');
					});
				}),
				() => {
					for (const key of keys) mixed.set(key, 'client');
				}
			);

			for (const key of keys) expect(mixed.get(key)).toBe('client');
			expect(mixed.get(0)).toBe('client');
			expect(mixed.size).toBe(keys.length + 1);
		});

		test('hide everything streamed in after a clear', async () => {
			await stream_to_client(
				await render((renderer) => {
					warp.set('a', 1);
					other.set('a', 1);
					renderer.background(async () => {
						await delay(null, 10);
						warp.set('b', 'server');
						other.set('b', 'server');
					});
				}),
				() => {
					client.clear();
					client.set('c', 'client');
				}
			);

			expect([...client]).toEqual([['c', 'client']]);
			expect([...other_client]).toEqual([
				['a', 1],
				['b', 'server']
			]);
		});

		test('do not break references to streamed values that were discarded', async () => {
			const shared = { child: { value: 1 } };
			const discarded = { value: 'discarded' };

			await stream_to_client(
				await render((renderer) => {
					renderer.background(async () => {
						await delay(null, 10);
						// discarded on the client, because it changed these keys
						warp.set('touched', shared);
						other.set('cleared', discarded);
						// in the same batch
						warp.set('same-batch', shared.child);

						await delay(null, 20);
						// in a later batch
						warp.set('later', [shared, discarded]);
					});
				}),
				() => {
					client.set('touched', 'client');
					other_client.clear();
				}
			);

			expect(client.get('touched')).toBe('client');
			expect(other_client.has('cleared')).toBe(false);

			const [s, d] = client.get('later');
			expect(s).toEqual(shared);
			expect(d).toEqual(discarded);
			expect(client.get('same-batch')).toBe(s.child);
		});

		test('are not recorded once the stream has finished', async () => {
			await stream_to_client(
				await render((renderer) => {
					renderer.background(() => {});
				}),
				() => {}
			);

			client.set('after', 'client');
			expect(window.__svelte?.r).toBeUndefined();
		});

		test('are respected by streams inserted after the document has loaded', async () => {
			// e.g. an island whose HTML is fetched and inserted once the page has loaded
			vi.stubGlobal('document', { readyState: 'complete' });

			await stream_to_client(
				await render((renderer) => {
					renderer.background(async () => {
						await delay(null, 10);
						warp.set('a', 'server');
					});
				}),
				() => {
					client.set('a', 'client');
				}
			);

			expect(client.get('a')).toBe('client');
		});

		test('leave the promises of a stream that never finishes pending', async () => {
			const { head, tail } = await render((renderer) => {
				renderer.background(() => {
					warp.set('a', delay('a', 10));
				});
			});

			const window: FakeWindow = {};
			vi.stubGlobal('window', window);
			run(window, head);

			// e.g. the connection dropped before the tail was sent
			await tail[Symbol.asyncIterator]().return?.();

			let settled = false;
			(window.__svelte?.w?.get('test')?.get('a') as Promise<unknown>).finally(
				() => (settled = true)
			);
			await delay(null, 20);
			expect(settled).toBe(false);

			// the stream is still considered in progress, so client changes are still recorded
			client.set('b', 'client');
			expect(window.__svelte?.r?.c.get('test')).toEqual(new Set(['b']));
		});

		test('apply to every stream until none are in progress', async () => {
			const stream = (value: string, ms: number) =>
				render((renderer) => {
					renderer.background(async () => {
						await delay(null, ms);
						warp.set('a', value);
						warp.set(value, value);
					});
				});

			const window: FakeWindow = {};
			vi.stubGlobal('window', window);

			const first = await stream('first', 10);
			run(window, first.head);
			client.set('a', 'client');

			// starts after the change, but while the first stream is still in progress
			const second = await stream('second', 30);
			run(window, second.head);

			for await (const chunk of first.tail) run(window, chunk);
			expect(client.get('first')).toBe('first');
			expect(window.__svelte?.r?.s.size).toBe(1);

			for await (const chunk of second.tail) run(window, chunk);
			expect(client.get('second')).toBe('second');
			expect(client.get('a')).toBe('client');
			expect(window.__svelte?.r).toBeUndefined();

			// nothing is streaming, so the change is forgotten
			const third = await stream('third', 0);
			run(window, third.head);
			for await (const chunk of third.tail) run(window, chunk);
			expect(client.get('a')).toBe('third');
		});
	});

	describe('in WebContainers', () => {
		// eslint-disable-next-line n/prefer-global/process
		const versions = process.versions as Record<string, string | undefined>;

		beforeAll(() => {
			versions.webcontainer = '1';
		});

		afterAll(() => {
			delete versions.webcontainer;
		});

		test('starts the background work once the head has been serialized, and streams its values', async () => {
			const events: string[] = [];

			const { head, tail } = await render((renderer) => {
				renderer.background(async () => {
					events.push('background');
					expect(warp.get('main')).toBe('main');

					warp.set('sync', 'sync');
					warp.set('promise', Promise.resolve('promise'));
					await delay(null, 10);
					warp.set('later', 'later');
				});

				warp.set('main', 'main');
				warp.set('resolved', delay('resolved', 10));
				events.push('main');
			});

			expect(events).toEqual(['main', 'background']);

			const window: FakeWindow = {};
			run(window, head);

			const values = window.__svelte?.w?.get('test');
			expect(values?.get('main')).toBe('main');
			// the render's promises are resolved in the head, the background work's in the tail
			const pending = delay('pending', 5);
			expect(await Promise.race([values?.get('resolved'), pending])).toBe('resolved');
			expect(await Promise.race([values?.get('promise'), pending])).toBe('pending');
			// the values added synchronously are known when the client hydrates
			expect(values?.get('sync')).toBe('sync');
			expect(values?.has('later')).toBe(false);

			for await (const chunk of tail) run(window, chunk);

			expect(await values?.get('promise')).toBe('promise');
			expect(values?.get('later')).toBe('later');
			expect(window.__svelte?.r).toBeUndefined();
		});

		test('runs nested background work straight away', async () => {
			const { head, tail } = await render((renderer) => {
				renderer.background(async (renderer) => {
					await delay(null);
					renderer.background(async () => {
						await delay(null);
						warp.set('nested', 'nested');
					});
				});
			});

			const { values } = await revive_streamed(head, tail);
			expect(values?.get('test')?.get('nested')).toBe('nested');
		});

		test('queues the next render until the background work is done', async () => {
			const events: string[] = [];

			const first = await render((renderer) => {
				renderer.background(async () => {
					await delay(null, 20);
					warp.set('a', 'first');
					events.push('first background');
				});
			});

			const second = await render(() => {
				events.push('second');
				warp.set('a', 'second');
			});

			expect(events).toEqual(['first background', 'second']);

			const { values } = await revive_streamed(first.head, first.tail);
			expect(values?.get('test')?.get('a')).toBe('first');
			expect(revive(second.head)?.get('test')?.get('a')).toBe('second');
		});

		test('does not start the background work if the render fails', async () => {
			let started = false;

			await expect(
				render((renderer) => {
					renderer.background(() => {
						started = true;
					});

					warp.set('bad', () => {});
				})
			).rejects.toThrow('warp_serialization_failed');

			// the next render isn't stuck behind the dropped work
			const { head } = await render(() => {
				warp.set('a', 'a');
			});

			expect(started).toBe(false);
			expect(revive(head)?.get('test')?.get('a')).toBe('a');
		});
	});
});
