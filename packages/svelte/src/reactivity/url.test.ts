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

test('SvelteURL instanceof URL', () => {
	assert.ok(new SvelteURL('https://svelte.dev') instanceof URL);
});
