import { render_effect, effect_root } from '../internal/client/reactivity/effects.js';
import { flushSync } from '../index-client.js';
import { ReactiveURL } from './url.js';
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
		'search: ?q=kit',
		'foo: null'
	]);

	cleanup();
});

test('url.href', () => {
	const url = new ReactiveURL('https://svelte.dev?foo=bar&t=123');
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

test('fine grained tests', () => {
	const url = new ReactiveURL('https://svelte.dev/');

	let changes: Record<keyof typeof url, boolean> = {
		hash: true,
		host: true,
		hostname: true,
		href: true,
		origin: true,
		username: true,
		password: true,
		pathname: true,
		port: true,
		protocol: true,
		search: true,
		searchParams: true,
		toJSON: true,
		toString: true
	};

	const reset_change = () => {
		for (const key of Object.keys(changes) as (keyof typeof url)[]) {
			changes[key] = false;
		}
	};

	const cleanup = effect_root(() => {
		render_effect(() => {
			url.hash;
			assert.equal(changes.hash, true);
		});

		render_effect(() => {
			url.host;
			assert.equal(changes.host, true);
		});

		render_effect(() => {
			url.hostname;
			assert.equal(changes.hostname, true);
		});

		render_effect(() => {
			url.href;
			assert.equal(changes.href, true);
		});

		render_effect(() => {
			url.origin;
			assert.equal(changes.origin, true);
		});

		render_effect(() => {
			url.search;
			assert.equal(changes.search, true);
		});

		render_effect(() => {
			url.searchParams.get('fohoov');
			assert.equal(changes.searchParams, true);
		});

		render_effect(() => {
			url;
			reset_change();
		});
	});

	flushSync(() => {
		changes = { ...changes, origin: true, host: true, pathname: true, href: true };
		url.href = 'https://www.google.com/test';
	});

	flushSync(() => {
		changes = { ...changes, origin: true, href: true };
		url.protocol = 'http';
	});

	flushSync(() => {
		url.protocol = 'http';
	});

	flushSync(() => {
		changes = { ...changes, hash: true, href: true };
		url.hash = 'new-hash';
	});

	flushSync(() => {
		url.hash = 'new-hash';
	});

	flushSync(() => {
		changes = { ...changes, hostname: true, href: true };
		url.hostname = 'fohoov';
	});

	flushSync(() => {
		changes = { ...changes, search: true, searchParams: true };
		url.search = 'fohoov=true';
	});

	flushSync(() => {
		url.search = 'fohoov=true';
	});

	flushSync(() => {
		changes = { ...changes, search: true, searchParams: true };
		url.search = 'fohoov=false';
	});

	flushSync(() => {
		changes = { ...changes, search: true, searchParams: true };
		url.search = '';
	});

	flushSync(() => {
		url.search = '';
	});

	cleanup();
});
