import { assert, describe, it } from 'vitest';
import { effect_root } from '../../src/internal/client/reactivity/effects';
import { push, pop } from '../../src/internal/client/context';
import { proxy, remove_onchange } from '../../src/internal/client/proxy';

function run(fn: () => void) {
	push({}, true);
	const destroy = effect_root(() => {
		fn();
	});
	pop();
	destroy();
}

describe('proxy onchange kernel', () => {
	it('fires synchronously on deep mutation', () => {
		run(() => {
			let count = 0;
			const state = proxy({ a: { b: 1 } } as any, () => count++);

			state.a.b = 2;
			assert.equal(count, 1);

			state.a.b = 3;
			assert.equal(count, 2);
		});
	});

	it('does not fire when a write does not change the value', () => {
		run(() => {
			let count = 0;
			const state = proxy({ x: 1 } as any, () => count++);

			state.x = 2;
			assert.equal(count, 1);

			state.x = 2;
			assert.equal(count, 1);
		});
	});

	it('veto case 1 (shared-array flaw): detached children go silent', () => {
		run(() => {
			let count = 0;
			const items = proxy([{ foo: 'a' }, { foo: 'b' }, { foo: 'c' }] as any[], () => count++);

			const last = items[2];
			assert.equal(count, 0);

			items.pop();
			assert.equal(count, 1);

			// the popped item is no longer in the tree — mutating it must not fire
			last.foo = 'blah';
			assert.equal(count, 1);
		});
	});

	it('veto case 2 (parent-chain dealbreaker): existing proxies can join observed trees', () => {
		run(() => {
			let foo = 0;
			let bar = 0;
			const inner = proxy({ x: 0 } as any, () => bar++);
			const tree = proxy({} as any, () => foo++);

			tree.slot = inner;
			assert.equal(foo, 1);
			assert.equal(bar, 0);

			// mutating inner through its own reference notifies BOTH trees
			inner.x = 1;
			assert.equal(foo, 2);
			assert.equal(bar, 1);

			// and through the tree as well
			tree.slot.x = 2;
			assert.equal(foo, 3);
			assert.equal(bar, 2);

			delete tree.slot;
			assert.equal(foo, 4);
			assert.equal(bar, 2);

			// detached again — only its own root fires
			inner.x = 3;
			assert.equal(foo, 4);
			assert.equal(bar, 3);
		});
	});

	it('veto case 3 (Set aliasing bug): same child under two keys survives one deletion', () => {
		run(() => {
			let count = 0;
			const tree = proxy({} as any, () => count++);

			tree.a = { z: 0 };
			assert.equal(count, 1);

			tree.b = tree.a;
			assert.equal(count, 2);

			delete tree.a;
			assert.equal(count, 3);

			// still reachable via `b` — must still fire
			tree.b.z = 1;
			assert.equal(count, 4);

			const child = tree.b;
			delete tree.b;
			assert.equal(count, 5);

			// now fully detached — silent
			child.z = 2;
			assert.equal(count, 5);
		});
	});

	it('array methods fire once per call', () => {
		run(() => {
			let count = 0;
			const arr = proxy([] as any[], () => count++);

			arr.push(1);
			assert.equal(count, 1);

			arr.push(2, 3);
			assert.equal(count, 2);

			arr.splice(0, 1);
			assert.equal(count, 3);
		});
	});

	it('works without a parent effect (module-level state)', () => {
		let count = 0;
		const state = proxy({ n: 0 } as any, () => count++);

		state.n = 1;
		assert.equal(count, 1);
	});

	it('lazily-read nested objects are covered once traversed', () => {
		run(() => {
			let count = 0;
			const state = proxy({ nested: { deep: { v: 0 } } } as any, () => count++);

			// mutation requires traversal, traversal establishes links
			state.nested.deep.v = 1;
			assert.equal(count, 1);

			const deep = state.nested.deep;
			deep.v = 2;
			assert.equal(count, 2);
		});
	});

	it('callback reads see the post-mutation tree', () => {
		run(() => {
			let seen = -1;
			const state: any = proxy({ x: 0 } as any, () => (seen = state.x));

			state.x = 42;
			assert.equal(seen, 42);
		});
	});

	it('does not fire when the first write of a property does not change it', () => {
		run(() => {
			let count = 0;
			const state = proxy({ x: 1 } as any, () => count++);

			state.x = 1;
			assert.equal(count, 0);

			state.x = 2;
			assert.equal(count, 1);
		});
	});

	it('attached callbacks can be detached again (#15069 reassignment path)', () => {
		run(() => {
			const logs: string[] = [];
			const b = proxy({ count: 0 } as any, () => logs.push('b'));
			const c = () => logs.push('c');
			proxy(b, c);

			b.count = 1;
			assert.deepEqual(logs, ['b', 'c']);

			remove_onchange(b, c);

			b.count = 2;
			assert.deepEqual(logs, ['b', 'c', 'b']);
		});
	});

	it('attaching to an existing proxy covers already-materialized children', () => {
		run(() => {
			let count = 0;
			const state = proxy({ a: { b: 0 } } as any);
			const a = state.a;

			proxy(state, () => count++);

			a.b = 1;
			assert.equal(count, 1);
		});
	});

	it('references captured before a subtree joins an observed tree still notify', () => {
		run(() => {
			let count = 0;
			const inner = proxy({ nested: { v: 0 } } as any);
			const captured = inner.nested;

			const tree = proxy({} as any, () => count++);
			tree.slot = inner;
			assert.equal(count, 1);

			captured.v = 1;
			assert.equal(count, 2);
		});
	});

	it('children created while detached are covered after re-attachment', () => {
		run(() => {
			let count = 0;
			const state = proxy({ child: { v: 0 } } as any, () => count++);

			const child = state.child;
			state.child = null;
			assert.equal(count, 1);

			child.v = 1;
			child.deep = { z: 0 };
			const deep = child.deep;
			assert.equal(count, 1);

			state.child = child;
			assert.equal(count, 2);

			deep.z = 1;
			assert.equal(count, 3);
		});
	});

	it('replacing a subtree detaches the old one', () => {
		run(() => {
			let count = 0;
			const state = proxy({ child: { v: 0 } } as any, () => count++);

			const old = state.child;
			old.v = 1;
			assert.equal(count, 1);

			state.child = { v: 100 };
			assert.equal(count, 2);

			old.v = 2;
			assert.equal(count, 2);

			state.child.v = 101;
			assert.equal(count, 3);
		});
	});
});
