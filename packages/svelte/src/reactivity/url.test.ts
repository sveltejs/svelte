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

test('url fine grained tests', () => {
	const url = new ReactiveURL('https://svelte.dev/');

	let changes: Record<string, boolean> = {
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
		searchParams: true
	};
	let test_description: string = '';

	const expect_all_changes_to_be_false = () => {
		for (const key of Object.keys(changes) as Array<keyof typeof url>) {
			assert.equal(
				changes[key],
				false,
				`${test_description}: effect for ${key} was not fired (value=${url[key]})`
			);
		}
	};

	const cleanup = effect_root(() => {
		for (const key of Object.keys(changes) as Array<keyof typeof url>) {
			if (key === 'searchParams') {
				continue;
			}
			render_effect(() => {
				const value = url[key];
				assert.equal(changes[key], true, `${test_description}: for ${key} (value=${value})`);
				changes[key] = false;
			});
		}

		render_effect(() => {
			url.searchParams.get('fohoov');
			assert.equal(changes['searchParams'], true, `${test_description}: for searchParams`);
			changes['searchParams'] = false;
		});
	});

	flushSync(() => {
		expect_all_changes_to_be_false();
		changes = { ...changes, origin: true, host: true, pathname: true, href: true };
		test_description = 'changing href';
		url.href = 'https://www.google.com/test';
	});

	flushSync(() => {
		expect_all_changes_to_be_false();
		changes = { ...changes, protocol: true, origin: true, href: true };
		test_description = 'changing protocol';
		url.protocol = 'http';
	});

	flushSync(() => {
		expect_all_changes_to_be_false();
		test_description = 'changing protocol to same thing';
		url.protocol = 'http';
	});

	flushSync(() => {
		expect_all_changes_to_be_false();
		changes = { ...changes, hash: true, href: true };
		test_description = 'changing hash';
		url.hash = 'new-hash';
	});

	flushSync(() => {
		expect_all_changes_to_be_false();
		test_description = 'changing hash to same thing';
		url.hash = 'new-hash';
	});

	flushSync(() => {
		expect_all_changes_to_be_false();
		changes = { ...changes, hostname: true, host: true, href: true };
		test_description = 'changing hostname';
		url.hostname = 'fohoov';
	});

	flushSync(() => {
		expect_all_changes_to_be_false();
		changes = { ...changes, href: true, search: true, searchParams: true };
		test_description = 'changing search';
		url.search = 'fohoov=true';
	});

	flushSync(() => {
		expect_all_changes_to_be_false();
		test_description = 'changing search to same thing';
		url.search = 'fohoov=true';
	});

	flushSync(() => {
		expect_all_changes_to_be_false();
		changes = { ...changes, href: true, search: true, searchParams: true };
		test_description = 'changing search param fohoov to false';
		url.search = 'fohoov=false';
	});

	flushSync(() => {
		expect_all_changes_to_be_false();
		changes = { ...changes, href: true, search: true, searchParams: true };
		test_description = 'clearing search';
		url.search = '';
	});

	flushSync(() => {
		expect_all_changes_to_be_false();
		test_description = 'clearing search again (expects no change)';
		url.search = '';
	});

	cleanup();
});

test('URL.instanceOf', () => {
	assert.equal(new ReactiveURL('https://svelte.dev') instanceof URL, true);
});
