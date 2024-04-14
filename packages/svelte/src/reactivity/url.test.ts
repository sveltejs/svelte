import { render_effect, effect_root } from '../internal/client/reactivity/effects.js';
import { flushSync } from '../index-client.js';
import { ReactiveURL, ReactiveURLSearchParams } from './url.js';
import { assert, test } from 'vitest';

test('url.hash', () => {
	const url = new ReactiveURL('http://google.com');
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
		url.href = 'http://google.com/a/b/c#def';
	});

	flushSync(() => {
		// does not affect hash
		url.pathname = 'e/f';
	});

	assert.deepEqual(log, ['', '#abc', '#def']);

	cleanup();
});

test('url.searchParams', () => {
	const url = new ReactiveURL('https://svelte.dev?foo=bar&t=123');
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

test('URLSearchParams', () => {
	const params = new ReactiveURLSearchParams();
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(params.toString());
		});
	});

	flushSync(() => {
		params.set('a', 'b');
	});

	flushSync(() => {
		params.append('a', 'c');
	});

	assert.deepEqual(log, ['', 'a=b', 'a=b&a=c']);

	cleanup();
});
