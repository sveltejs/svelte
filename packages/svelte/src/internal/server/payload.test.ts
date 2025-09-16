import { assert, expect, test } from 'vitest';
import { Payload, TreeState, TreeHeadState } from './payload.js';

test('collects synchronous body content by default', () => {
	const payload = new Payload(new TreeState('sync'));
	payload.push('a');
	payload.child(($$payload) => {
		$$payload.push('b');
	});
	payload.push('c');

	const { head, body } = payload.collect();
	assert.equal(head, '');
	assert.equal(body, 'abc');
});

test('child type switches content area (head vs body)', () => {
	const payload = new Payload(new TreeState('sync'));
	payload.push('a');
	payload.child(($$payload) => {
		$$payload.push('<title>T</title>');
	}, 'head');
	payload.push('b');

	const { head, body } = payload.collect();
	assert.equal(head, '<title>T</title>');
	assert.equal(body, 'ab');
});

test('child inherits parent type when not specified', () => {
	const parent = new Payload(new TreeState('sync'), undefined, undefined, 'head');
	parent.push('<meta name="x"/>');
	parent.child(($$payload) => {
		$$payload.push('<style>/* css */</style>');
	});
	const { head, body } = parent.collect();
	assert.equal(body, '');
	assert.equal(head, '<meta name="x"/><style>/* css */</style>');
});

test('get_path returns the path indexes to a payload', () => {
	const root = new Payload(new TreeState('sync'));
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

	assert.deepEqual(child_a!.get_path(), [0]);
	assert.deepEqual(child_b!.get_path(), [1]);
	assert.deepEqual(child_b_0!.get_path(), [1, 0]);
});

test('creating an async child in a sync context throws', () => {
	const payload = new Payload(new TreeState('sync'));
	payload.push('a');
	expect(() =>
		payload.child(async ($$payload) => {
			await Promise.resolve();
			$$payload.push('x');
		})
	).toThrow('async_in_sync');
});

test('collect_async allows awaiting payload to get aggregated content', async () => {
	const payload = new Payload(new TreeState('async'));
	payload.push('1');
	payload.child(async ($$payload) => {
		await Promise.resolve();
		$$payload.push('2');
	});
	payload.push('3');

	const result = await payload.collect_async();
	assert.deepEqual(result, { head: '', body: '123' });
});

test('compact synchronously aggregates a range and can transform into head/body', () => {
	const payload = new Payload(new TreeState('sync'));
	payload.push('a');
	payload.push('b');
	payload.push('c');

	payload.compact({
		start: 0,
		end: 2,
		fn: (content) => ({ head: '<h>H</h>', body: content.body + 'd' })
	});

	assert.equal(payload.length, 2);
	const { head, body } = payload.collect();
	assert.equal(head, '<h>H</h>');
	assert.equal(body, 'abdc');
});

test('compact schedules followup when compaction input is async', async () => {
	const payload = new Payload(new TreeState('async'));
	payload.push('a');
	payload.child(async ($$payload) => {
		await Promise.resolve();
		$$payload.push('X');
	});
	payload.push('b');

	payload.compact({
		start: 0,
		fn: (content) => ({ body: content.body.toLowerCase(), head: '' })
	});

	const { body, head } = await payload.collect_async();
	assert.equal(head, '');
	assert.equal(body, 'axb');
});

test('copy creates a deep copy of the tree and shares promises reference', () => {
	const payload = new Payload(new TreeState('sync'));
	let child_ref: InstanceType<typeof Payload> | undefined;
	payload.child(($$payload) => {
		child_ref = $$payload;
		$$payload.push('x');
	});
	payload.push('y');

	const copy = payload.copy();
	assert.strictEqual(copy.promises, payload.promises);

	// mutate original
	child_ref!.push('!');
	payload.push('?');

	const original = payload.collect();
	const cloned = copy.collect();

	assert.deepEqual(original, { head: '', body: 'x!y?' });
	assert.deepEqual(cloned, { head: '', body: 'xy' });
});

test('local state is shallow-copied to children', () => {
	const root = new Payload(new TreeState('sync'));
	root.local.select_value = 'A';
	let child: InstanceType<typeof Payload> | undefined;
	root.child(($$payload) => {
		child = $$payload;
	});

	assert.equal(child!.local.select_value, 'A');
	child!.local.select_value = 'B';
	assert.equal(root.local.select_value, 'A');
});

test('subsume replaces tree content and state from other', () => {
	const a = new Payload(new TreeState('async'), undefined, undefined, 'head');
	a.push('<meta />');
	a.local.select_value = 'A';

	const b = new Payload(new TreeState('async'));
	b.child(async ($$payload) => {
		await Promise.resolve();
		$$payload.push('body');
	});
	b.global.css.add({ hash: 'h', code: 'c' });
	b.global.head.title = { path: [1], value: 'Title' };
	b.local.select_value = 'B';
	b.promises.initial = Promise.resolve();

	a.subsume(b);

	assert.equal(a.type, 'body');
	assert.equal(a.local.select_value, 'B');
	assert.strictEqual(a.promises, b.promises);

	// global state transferred
	assert.ok([...a.global.css][0]?.hash === 'h');
	assert.equal(a.global.head.title.value, 'Title');
});

test('subsume refuses to switch modes', () => {
	const a = new Payload(new TreeState('sync'), undefined, undefined, 'head');
	a.push('<meta />');
	a.local.select_value = 'A';

	const b = new Payload(new TreeState('async'));
	b.child(async ($$payload) => {
		await Promise.resolve();
		$$payload.push('body');
	});
	b.global.css.add({ hash: 'h', code: 'c' });
	b.global.head.title = { path: [1], value: 'Title' };
	b.local.select_value = 'B';
	b.promises.initial = Promise.resolve();

	expect(() => a.subsume(b)).toThrow(
		"invariant: A payload cannot switch modes. If you're seeing this, there's a compiler bug. File an issue!"
	);
});

test('TreeState uid generator uses prefix and is shared by copy()', () => {
	const state = new TreeState('sync', 'id-');
	assert.equal(state.uid(), 'id-s1');
	const state_copy = state.copy();
	assert.equal(state_copy.uid(), 'id-s2');
	assert.equal(state.uid(), 'id-s3');
});

test('TreeHeadState title ordering favors later lexicographic paths', () => {
	const head = new TreeHeadState(() => '');

	head.title = { path: [1], value: 'A' };
	assert.equal(head.title.value, 'A');

	// equal path -> unchanged
	head.title = { path: [1], value: 'B' };
	assert.equal(head.title.value, 'A');

	// earlier -> unchanged
	head.title = { path: [0, 9], value: 'C' };
	assert.equal(head.title.value, 'A');

	// later -> update
	head.title = { path: [2], value: 'D' };
	assert.equal(head.title.value, 'D');

	// longer but same prefix -> update
	head.title = { path: [2, 0], value: 'E' };
	assert.equal(head.title.value, 'E');

	// shorter (earlier) than current with same prefix -> unchanged
	head.title = { path: [2], value: 'F' };
	assert.equal(head.title.value, 'E');
});

test('push accepts async functions in async context', async () => {
	const payload = new Payload(new TreeState('async'));
	payload.push('a');
	payload.push(async () => {
		await Promise.resolve();
		return 'b';
	});
	payload.push('c');

	const { head, body } = await payload.collect_async();
	assert.equal(head, '');
	assert.equal(body, 'abc');
});

test('push handles async functions with different timing', async () => {
	const payload = new Payload(new TreeState('async'));

	// Fast async function
	payload.push(async () => {
		await Promise.resolve();
		return 'fast';
	});

	// Slow async function
	payload.push(async () => {
		await new Promise((resolve) => setTimeout(resolve, 10));
		return 'slow';
	});

	// Regular string
	payload.push('sync');

	const { head, body } = await payload.collect_async();
	assert.equal(head, '');
	assert.equal(body, 'fastslowsync');
});

test('push async functions work with head content type', async () => {
	const payload = new Payload(new TreeState('async'), undefined, undefined, 'head');
	payload.push(async () => {
		await Promise.resolve();
		return '<title>Async Title</title>';
	});

	const { head, body } = await payload.collect_async();
	assert.equal(body, '');
	assert.equal(head, '<title>Async Title</title>');
});

test('push async functions can be mixed with child payloads', async () => {
	const payload = new Payload(new TreeState('async'));
	payload.push('start-');

	payload.push(async () => {
		await Promise.resolve();
		return 'async-';
	});

	payload.child(($$payload) => {
		$$payload.push('child-');
	});

	payload.push('-end');

	const { head, body } = await payload.collect_async();
	assert.equal(head, '');
	assert.equal(body, 'start-async-child--end');
});

test('push async functions work with compact operations', async () => {
	const payload = new Payload(new TreeState('async'));
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

	const { head, body } = await payload.collect_async();
	assert.equal(head, '');
	assert.equal(body, 'ABC');
});

test('push async functions are not supported in sync context', () => {
	const payload = new Payload(new TreeState('sync'));
	payload.push('a');

	expect(() => {
		payload.push(() => Promise.resolve('b'));
		payload.collect();
	}).toThrow();
});

test('collect_on_destroy yields callbacks in the correct order', async () => {
	const payload = new Payload(new TreeState('async'));
	const destroyed: string[] = [];
	payload.component((payload) => {
		payload.on_destroy(() => destroyed.push('a'));
		// children should not alter relative order
		payload.child(async ($$payload) => {
			await Promise.resolve();
			$$payload.on_destroy(() => destroyed.push('b'));
			$$payload.on_destroy(() => destroyed.push('b*'));

			// but child components should
			$$payload.component(($$inner) => {
				$$inner.on_destroy(() => destroyed.push('c'));
			});
		});
		payload.child((payload) => {
			payload.on_destroy(() => destroyed.push('d'));
		});
		payload.component((payload) => {
			payload.on_destroy(() => destroyed.push('e'));
		});
	});

	await payload.collect_async();
	for (const callback of payload.collect_on_destroy()) {
		callback();
	}
	assert.deepEqual(destroyed, ['c', 'e', 'a', 'b', 'b*', 'd']);
});
