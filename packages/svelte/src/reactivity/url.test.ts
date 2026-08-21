import { render_effect, effect_root } from '../internal/client/reactivity/effects.js';
import { flushSync } from '../index-client.js';
import { SvelteURL } from './url.js';
import { assert, test } from 'vitest';

test('url.hash', () => {
	const url = new SvelteURL('https://svelte.dev');
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(url.hash);
		});
	});

	flushSync(() => {
		url.hash = 'abc';
	});

	flushSync(() => {
		url.href = 'https://svelte.dev/a/b/c#def';
	});

	flushSync(() => {
		// does not affect hash
		url.pathname = 'e/f';
	});

	assert.deepEqual(log, ['', '#abc', '#def']);

	cleanup();
});

test('url.href', () => {
	const url = new SvelteURL('https://svelte.dev?foo=bar&t=123');
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(url.href);
		});
	});

	flushSync(() => {
		url.search = '?q=kit&foo=baz';
	});

	flushSync(() => {
		// changes from searchParams should be synced to URL instance as well
		url.searchParams.append('foo', 'qux');
	});

	flushSync(() => {
		url.searchParams.delete('foo');
	});

	flushSync(() => {
		url.searchParams.set('love', 'svelte5');
	});

	assert.deepEqual(log, [
		'https://svelte.dev/?foo=bar&t=123',
		'https://svelte.dev/?q=kit&foo=baz',
		'https://svelte.dev/?q=kit&foo=baz&foo=qux',
		'https://svelte.dev/?q=kit',
		'https://svelte.dev/?q=kit&love=svelte5'
	]);

	cleanup();
});

test('url.searchParams', () => {
	const url = new SvelteURL('https://svelte.dev?foo=bar&t=123');
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push('search: ' + url.search);
		});
		render_effect(() => {
			log.push('foo: ' + url.searchParams.get('foo'));
		});
		render_effect(() => {
			log.push('q: ' + url.searchParams.has('q'));
		});
	});

	flushSync(() => {
		url.search = '?q=kit&foo=baz';
	});

	flushSync(() => {
		url.searchParams.append('foo', 'qux');
	});

	flushSync(() => {
		url.searchParams.delete('foo');
	});

	assert.deepEqual(log, [
		'search: ?foo=bar&t=123',
		'foo: bar',
		'q: false',
		'search: ?q=kit&foo=baz',
		'foo: baz',
		'q: true',
		'search: ?q=kit&foo=baz&foo=qux',
		'foo: baz',
		'q: true',
		'search: ?q=kit',
		'foo: null',
		'q: true'
	]);

	cleanup();
});

test('url.searchParams.set updates url when duplicate values collapse to the same joined string', () => {
	const url = new SvelteURL('https://svelte.dev?a=ab&a=c');
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(url.href);
		});
	});

	flushSync(() => {
		url.searchParams.set('a', 'abc');
	});

	assert.deepEqual(log, ['https://svelte.dev/?a=ab&a=c', 'https://svelte.dev/?a=abc']);

	cleanup();
});

test('url.search normalizes value', () => {
	const url = new SvelteURL('https://svelte.dev');
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(url.search);
		});
	});

	flushSync(() => {
		// setting without ? prefix — URL normalizes to "?foo=bar"
		url.search = 'foo=bar';
	});

	flushSync(() => {
		url.search = '?baz=qux';
	});

	flushSync(() => {
		// lone "?" is normalized to ""
		url.search = '?';
	});

	assert.deepEqual(log, ['', '?foo=bar', '?baz=qux', '']);

	cleanup();
});

test('SvelteURL instanceof URL', () => {
	assert.ok(new SvelteURL('https://svelte.dev') instanceof URL);
});

test('url.searchParams subscribers are not notified by changes that leave the search string untouched', () => {
	const url = new SvelteURL('https://svelte.dev/a?foo=bar');
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(url.searchParams.toString());
		});
	});

	flushSync(() => {
		// does not affect the search string
		url.pathname = '/b';
	});

	flushSync(() => {
		// neither does this
		url.href = 'https://svelte.dev/c?foo=bar#hash';
	});

	flushSync(() => {
		// but this does
		url.search = '?foo=baz';
	});

	assert.deepEqual(log, ['foo=bar', 'foo=baz']);

	cleanup();
});

test('url.searchParams.size is not notified by unrelated href changes', () => {
	const url = new SvelteURL('https://svelte.dev/?foo=bar');
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(url.searchParams.size);
		});
	});

	flushSync(() => {
		url.href = 'https://svelte.dev/other?foo=bar';
	});

	flushSync(() => {
		url.searchParams.append('baz', 'qux');
	});

	assert.deepEqual(log, [1, 2]);

	cleanup();
});

test('url.searchParams.forEach re-runs when the search string changes via the URL', () => {
	const url = new SvelteURL('https://svelte.dev/?foo=1');
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			const entries: string[] = [];
			url.searchParams.forEach((value, key) => entries.push(`${key}=${value}`));
			log.push(entries.join('&'));
		});
	});

	flushSync(() => {
		url.href = 'https://svelte.dev/?bar=2';
	});

	assert.deepEqual(log, ['foo=1', 'bar=2']);

	cleanup();
});
