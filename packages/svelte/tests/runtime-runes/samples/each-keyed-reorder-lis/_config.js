import { flushSync } from 'svelte';
import { test } from '../../test';

// Exercises the LIS fast-path in {#each} reconcile for pure-reorder updates.
// All operations preserve the same set of keys; reconcile must:
//   1) place DOM in the right new order
//   2) keep element identity stable (no recreation across moves)

const initial = [
	{ id: 1, name: 'a' },
	{ id: 2, name: 'b' },
	{ id: 3, name: 'c' },
	{ id: 4, name: 'd' },
	{ id: 5, name: 'e' },
	{ id: 6, name: 'f' },
	{ id: 7, name: 'g' }
];

/** @param {HTMLElement} target */
function snapshot_elements(target) {
	/** @type {Map<string, HTMLElement>} */
	const map = new Map();
	for (const li of target.querySelectorAll('li')) {
		map.set(/** @type {string} */ (li.dataset.id), /** @type {HTMLElement} */ (li));
	}
	return map;
}

/** @param {HTMLElement} target */
function id_order(target) {
	return Array.from(target.querySelectorAll('li')).map((li) => li.dataset.id);
}

/**
 * @param {import('assert').AssertionError extends never ? any : any} assert
 * @param {Map<string, HTMLElement>} before
 * @param {HTMLElement} target
 */
function assert_identity_preserved(assert, before, target) {
	for (const li of target.querySelectorAll('li')) {
		const id = /** @type {string} */ (li.dataset.id);
		assert.equal(
			before.get(id),
			li,
			`element identity preserved for id=${id} (LIS path must move, not recreate)`
		);
	}
}

export default test({
	mode: ['client'],

	props: { items: initial.slice() },

	async test({ assert, target, component }) {
		// ── identity (no-op) — lockstep loop walks to end, returns true without allocating ──
		let before = snapshot_elements(target);
		component.items = initial.slice();
		flushSync();
		assert.deepEqual(id_order(target), ['1', '2', '3', '4', '5', '6', '7']);
		assert_identity_preserved(assert, before, target);

		// ── full reverse — LIS = 1 (one item stays), N-1 moves ──
		before = snapshot_elements(target);
		component.items = component.items.slice().reverse();
		flushSync();
		assert.deepEqual(id_order(target), ['7', '6', '5', '4', '3', '2', '1']);
		assert_identity_preserved(assert, before, target);

		// ── reverse back ──
		before = snapshot_elements(target);
		component.items = component.items.slice().reverse();
		flushSync();
		assert.deepEqual(id_order(target), ['1', '2', '3', '4', '5', '6', '7']);
		assert_identity_preserved(assert, before, target);

		// ── adjacent swap (positions 2,3) — divergence triggers suffix LIS ──
		before = snapshot_elements(target);
		{
			const next = component.items.slice();
			[next[2], next[3]] = [next[3], next[2]];
			component.items = next;
		}
		flushSync();
		assert.deepEqual(id_order(target), ['1', '2', '4', '3', '5', '6', '7']);
		assert_identity_preserved(assert, before, target);

		// ── reset ──
		component.items = initial.slice();
		flushSync();

		// ── far swap (first ↔ last) — two moves ──
		before = snapshot_elements(target);
		{
			const next = component.items.slice();
			[next[0], next[6]] = [next[6], next[0]];
			component.items = next;
		}
		flushSync();
		assert.deepEqual(id_order(target), ['7', '2', '3', '4', '5', '6', '1']);
		assert_identity_preserved(assert, before, target);

		// ── reset ──
		component.items = initial.slice();
		flushSync();

		// ── rotate-right by one (pop+unshift) — single item moves to front ──
		before = snapshot_elements(target);
		{
			const next = component.items.slice();
			const tail = /** @type {{id:number,name:string}} */ (next.pop());
			next.unshift(tail);
			component.items = next;
		}
		flushSync();
		assert.deepEqual(id_order(target), ['7', '1', '2', '3', '4', '5', '6']);
		assert_identity_preserved(assert, before, target);

		// ── rotate-left back ──
		before = snapshot_elements(target);
		{
			const next = component.items.slice();
			const head = /** @type {{id:number,name:string}} */ (next.shift());
			next.push(head);
			component.items = next;
		}
		flushSync();
		assert.deepEqual(id_order(target), ['1', '2', '3', '4', '5', '6', '7']);
		assert_identity_preserved(assert, before, target);

		// ── prefix stable + suffix reorder — lockstep loop walks ids 1..3 then
		//    hits divergence; only the suffix runs LIS ──
		before = snapshot_elements(target);
		component.items = [
			initial[0],
			initial[1],
			initial[2],
			initial[6],
			initial[5],
			initial[4],
			initial[3]
		];
		flushSync();
		assert.deepEqual(id_order(target), ['1', '2', '3', '7', '6', '5', '4']);
		assert_identity_preserved(assert, before, target);

		// ── reset ──
		component.items = initial.slice();
		flushSync();

		// ── deterministic shuffle — every item in a new position ──
		before = snapshot_elements(target);
		component.items = [initial[2], initial[5], initial[0], initial[6], initial[1], initial[3], initial[4]];
		flushSync();
		assert.deepEqual(id_order(target), ['3', '6', '1', '7', '2', '4', '5']);
		assert_identity_preserved(assert, before, target);

		// ── name-only update on a single item, no reorder — lockstep loop only ──
		before = snapshot_elements(target);
		{
			const next = component.items.slice();
			next[3] = { ...next[3], name: 'updated' };
			component.items = next;
		}
		flushSync();
		const updated = /** @type {HTMLElement} */ (target.querySelectorAll('li')[3]);
		assert.equal(updated.textContent, 'updated');
		assert_identity_preserved(assert, before, target);

		// ── empty out then refill (exercises the "removals" exit — LIS hands off
		//    to the legacy path; just confirm correctness here) ──
		component.items = [];
		flushSync();
		assert.deepEqual(id_order(target), []);

		component.items = initial.slice();
		flushSync();
		assert.deepEqual(id_order(target), ['1', '2', '3', '4', '5', '6', '7']);
	}
});
