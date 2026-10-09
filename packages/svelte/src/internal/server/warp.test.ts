import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import type { Component } from 'svelte';
import { Renderer } from './renderer.js';
import { disable_async_mode_flag, enable_async_mode_flag } from '../flags/index.js';
import { withWarp } from './render-context.js';
import { Warp } from './warp.js';
import { hydratable } from './hydratable.js';
import { getAbortSignal } from './abort-signal.js';

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

/** Runs the warp `<script>`s in `head` against a fake `window`, and returns the revived values */
function revive(head: string) {
	const window: { __svelte?: { w?: Map<string, Map<unknown, unknown>> } } = {};

	for (const [, script] of head.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
		new Function('window', script)(window);
	}

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

		await expect(promise).rejects.toThrow('warp_set_after_render');
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
});

describe('streaming', () => {
	function delay<T>(value: T, ms = 0) {
		return new Promise<T>((fulfil) => setTimeout(() => fulfil(value), ms));
	}

	/** Collects the tail, and returns the revived values once everything has been evaluated */
	async function revive_streamed(head: string, tail: AsyncIterable<string>) {
		const window: { __svelte?: { w?: Map<string, Map<unknown, unknown>> } } = {};
		const run = (html: string) => {
			for (const [, script] of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
				new Function('window', script)(window);
			}
		};

		run(head);

		const chunks: string[] = [];
		for await (const chunk of tail) {
			chunks.push(chunk);
			run(chunk);
		}

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

	test('streams values that are pending when the head is generated', async () => {
		const { head, tail } = await render((renderer) => {
			warp.set('settled', Promise.resolve('settled'));
			renderer.background(() => {
				warp.set('pending', delay('later', 10));
			});
		});

		// the settled promise is resolved in the head script, while the pending one is not
		expect(head).toMatch(/s\.r\(\d+,0,"settled"\)/);
		expect(head).not.toContain('"later"');

		const { values, chunks } = await revive_streamed(head, tail);
		expect(chunks.length).toBeGreaterThan(0);
		expect(await values?.get('test')?.get('settled')).toBe('settled');
		expect(await values?.get('test')?.get('pending')).toBe('later');
	});

	test('streams values that are added after the head is generated', async () => {
		const { head, tail } = await render((renderer) => {
			renderer.background(async () => {
				const user = await warp.getOrInsertComputed('user', () => delay({ id: 1 }, 10));
				warp.getOrInsertComputed(`posts:${user.id}`, () => delay(['a', 'b'], 10));
			});
		});

		const { values } = await revive_streamed(head, tail);
		expect(await values?.get('test')?.get('user')).toEqual({ id: 1 });
		expect(await values?.get('test')?.get('posts:1')).toEqual(['a', 'b']);
	});

	test('adds values that depend on a promise in the same chunk that resolves it', async () => {
		const { head, tail } = await render((renderer) => {
			renderer.background(async () => {
				const user = await warp.getOrInsertComputed('user', () => delay({ id: 1 }, 10));
				warp.set(`name:${user.id}`, 'Rich');
			});
		});

		const window: { __svelte?: { w?: Map<string, Map<unknown, unknown>> } } = {};
		new Function('window', head.match(/<script>([\s\S]*?)<\/script>/)![1])(window);

		const user = window.__svelte?.w?.get('test')?.get('user') as Promise<unknown>;
		let found: unknown;
		user.then(() => (found = window.__svelte?.w?.get('test')?.get('name:1')));

		for await (const chunk of tail) {
			new Function('window', chunk.replace(/^<script>/, '').replace(/<\/script>$/, ''))(window);
		}

		await user;
		expect(found).toBe('Rich');
	});

	test('stops background work if the tail is abandoned', async () => {
		let signal: AbortSignal | undefined;
		let destroyed = false;

		const { tail } = await render((renderer) => {
			renderer.background((renderer) => {
				renderer.component((renderer) => {
					signal = getAbortSignal();
					renderer.on_destroy(() => (destroyed = true));
					warp.set('never', new Promise(() => {}));
					return new Promise(() => {});
				});
			});
		});

		const iterator = tail[Symbol.asyncIterator]();
		expect(signal?.aborted).toBe(false);
		await iterator.return?.();

		expect(signal?.aborted).toBe(true);
		expect(destroyed).toBe(true);
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
});
