import { afterEach, assert, beforeEach, describe, expect, it } from 'vitest';
import { flushSync, fork, getAbortSignal } from '../../src/index-client';
import { push, pop } from '../../src/internal/client/context';
import {
	block,
	branch,
	effect_root,
	template_effect
} from '../../src/internal/client/reactivity/effects';
import {
	Batch,
	clear,
	current_batch,
	first_batch
} from '../../src/internal/client/reactivity/batch';
import { get } from '../../src/internal/client/runtime';
import { source, set } from '../../src/internal/client/reactivity/sources';
import {
	script_replay,
	script_binding,
	script_value
} from '../../src/internal/client/reactivity/script-replay';
import { enable_async_mode_flag, disable_async_mode_flag } from '../../src/internal/flags';
import type { Effect } from '../../src/internal/client/types';

type Request = {
	site: string;
	input: number;
	signal: AbortSignal;
	resolve: (value: number) => void;
	reject: (error: unknown) => void;
};

let cleanup: Array<() => void>;

beforeEach(() => {
	enable_async_mode_flag();
	cleanup = [];
});

afterEach(async () => {
	for (const fn of cleanup.reverse()) fn();
	await drain();
	clear();
	disable_async_mode_flag();
});

// Drain the actual microtask queue, not a fixed number of promise continuations.
async function drain() {
	await new Promise<void>((resolve) => setTimeout(resolve, 0));
	flushSync();
}

function harness(
	kinds: Array<'async' | 'derived' | 'local'> = ['async', 'async', 'local', 'derived'],
	early_snapshot = false,
	independent = false,
	snapshot_from_input = false
) {
	const input = source(0);
	const adoption = source(0);
	const other = source(0);
	const local = source(0);
	const requests: Request[] = [];
	const renders: number[][] = [];
	let factories = 0;
	let snapshots = 0;
	let installations = 0;
	let instance: Effect | undefined;
	let script: ReturnType<typeof script_replay>;

	function load(site: string, value: number) {
		const signal = getAbortSignal();
		return new Promise<number>((resolve, reject) => {
			requests.push({ site, input: value, signal, resolve, reject });
		});
	}

	push({}, true);
	try {
		flushSync(() => {
			Batch.ensure();
			cleanup.push(
				effect_root(() => {
					// A minimal stable branch owner: adoption is explicit, just as it is for a
					// cached conditional branch. The branch's children are never recreated.
					block(() => {
						get(input);
						get(adoption);
						if (instance) {
							current_batch!.revalidate_branch(instance);
						} else {
							instance = branch(() => {
								script = script_replay(
									(bindings) => {
										factories++;
										const snapshot = () => {
											snapshots++;
											return snapshot_from_input ? get(other) : get(bindings[0]);
										};
										const second = () =>
											load('b', independent ? get(other) : (get(bindings[0]) as number));
										return [
											() => load('a', get(input)),
											early_snapshot ? snapshot : second,
											early_snapshot ? second : snapshot,
											() => (get(bindings[early_snapshot ? 2 : 1]) as number) * 2
										].slice(0, kinds.length);
									},
									kinds,
									kinds.map((_, i) => i)
								);
								installations++;
								template_effect(
									() => {
										renders.push([
											get(script_binding(script, 0)),
											...(kinds.length > 1
												? [get(script_binding(script, early_snapshot ? 2 : 1))]
												: []),
											...(kinds.length > 2 ? [script_value(script, early_snapshot ? 1 : 2)] : []),
											...(kinds.length > 3 ? [get(script_binding(script, 3))] : []),
											get(local)
										]);
									},
									[],
									[],
									[script.ready[kinds.length - 1]]
								);
							});
						}
					});
				})
			);
		});
	} finally {
		pop();
	}

	function request(site: string, value: number) {
		const found = requests.filter((r) => r.site === site && r.input === value && !r.signal.aborted);
		assert.equal(
			found.length,
			1,
			`one active ${site}(${value}), requests: ${requests.map((r) => `${r.site}(${r.input})${r.signal.aborted ? ' aborted' : ''}`).join(', ')}`
		);
		return found[0];
	}

	return {
		input,
		adoption,
		other,
		local,
		requests,
		renders,
		request,
		get script() {
			return script;
		},
		get factories() {
			return factories;
		},
		get snapshots() {
			return snapshots;
		},
		get installations() {
			return installations;
		}
	};
}

function speculative(fn: () => void) {
	const f = fork(fn);
	cleanup.push(() => f.discard());
	return f;
}

describe('script replay kernel', () => {
	it('keeps producers reactive after sealing without replaying ordinary snapshots', async () => {
		const h = harness();
		assert.deepEqual(h.renders, []);
		h.request('a', 0).resolve(10);
		await drain();
		assert.deepEqual(h.renders, []);
		h.request('b', 10).resolve(20);
		await drain();
		assert.deepEqual(h.renders.at(-1), [10, 20, 10, 40, 0]);
		const factories = h.factories;
		const snapshots = h.snapshots;
		flushSync(() => {
			set(h.input, 1);
			set(h.local, 7);
		});
		h.request('a', 1).resolve(11);
		await drain();
		h.request('b', 11).resolve(21);
		await drain();
		assert.deepEqual(h.renders.at(-1), [11, 21, 10, 42, 7]);
		assert.equal(h.factories, factories);
		assert.equal(h.snapshots, snapshots);
		assert.equal(h.installations, 1);
	});

	it('isolates checkpoints and locals in mixed-order real/fork chains', async () => {
		const h = harness();
		const f = speculative(() => set(h.input, 1));
		h.request('a', 1).resolve(11);
		await drain();
		assert.deepEqual(h.renders, []);
		h.request('a', 0).resolve(10);
		await drain();
		h.request('b', 11).resolve(21);
		await drain();
		assert.deepEqual(h.renders, [], 'a completed fork must not reveal the pending real view');
		h.request('b', 10).resolve(20);
		await drain();
		assert.deepEqual(h.renders.at(-1), [10, 20, 10, 40, 0]);
		flushSync(() => set(h.local, 9));
		await f.commit();
		await drain();
		assert.deepEqual(h.renders.at(-1), [11, 21, 10, 42, 9]);
		assert.equal(h.installations, 1);
	});

	it('admits two independent same-input attempts without leaking their first write', async () => {
		const h = harness(['async']);
		const real = h.requests[0];
		const f = speculative(() => set(h.adoption, 1));
		assert.equal(h.requests.length, 2);
		const speculative_request = h.requests[1];
		assert.equal(real.signal.aborted, false);
		speculative_request.resolve(20);
		await drain();
		assert.deepEqual(h.renders, []);
		real.resolve(10);
		await drain();
		assert.deepEqual(h.renders.at(-1), [10, 0]);
		f.discard();
		await drain();
		assert.deepEqual(h.renders.at(-1), [10, 0]);
	});

	it('discards promptly even when user work never settles and ignores late results', async () => {
		const h = harness(['async']);
		const f = speculative(() => set(h.input, 1));
		const losing = h.request('a', 1);
		f.discard();
		assert.equal(losing.signal.aborted, true, 'abort happens synchronously on discard');
		h.request('a', 0).resolve(10);
		await drain();
		assert.deepEqual(h.renders.at(-1), [10, 0]);
		assert.equal(first_batch, null, 'discarded user promise cannot keep the batch list alive');
		const calls = h.requests.length;
		losing.resolve(999);
		await drain();
		assert.equal(h.requests.length, calls);
		assert.deepEqual(h.renders.at(-1), [10, 0]);
	});

	it('retains a private failed fork across unrelated real success and repeated commit', async () => {
		const h = harness(['async']);
		const f = speculative(() => set(h.input, 1));
		const error = new Error('private failure');
		h.request('a', 1).reject(error);
		await drain();
		h.request('a', 0).resolve(10);
		await drain();
		assert.deepEqual(h.renders.at(-1), [10, 0]);
		const calls = h.requests.length;
		for (let i = 0; i < 2; i++) {
			await expect(f.commit()).rejects.toBe(error);
			assert.equal(h.requests.length, calls, 'committing failure cannot retry the loader');
		}
		assert.deepEqual(h.renders.at(-1), [10, 0], 'failed commit cannot partially publish');
	});

	it('replays an invalidated prefix coherently before sealing and rejects late generations', async () => {
		const h = harness(['async', 'local', 'async', 'derived'], true);
		h.request('a', 0).resolve(10);
		await drain();
		const old = h.request('b', 10);
		assert.equal(h.snapshots, 1);
		flushSync(() => set(h.input, 1));
		h.request('a', 1).resolve(11);
		await drain();
		h.request('b', 11).resolve(21);
		await drain();
		assert.deepEqual(h.renders.at(-1), [11, 21, 11, 42, 0]);
		old.resolve(999);
		await drain();
		assert.deepEqual(h.renders.at(-1), [11, 21, 11, 42, 0]);
		assert.equal(h.installations, 1);
	});

	it('revalidates a plain snapshot input only until the initializer is published', async () => {
		const h = harness(['async', 'local', 'async', 'derived'], true, false, true);
		h.request('a', 0).resolve(10);
		await drain();
		const stale = h.request('b', 10);
		flushSync(() => set(h.other, 1));
		await drain();
		h.request('a', 0).resolve(10);
		await drain();
		h.request('b', 10).resolve(20);
		await drain();
		assert.deepEqual(h.renders.at(-1), [10, 20, 1, 40, 0]);
		const snapshots = h.snapshots;
		flushSync(() => set(h.other, 2));
		stale.resolve(999);
		await drain();
		assert.deepEqual(h.renders.at(-1), [10, 20, 1, 40, 0]);
		assert.equal(h.snapshots, snapshots, 'published ordinary locals are not reactive deriveds');
	});

	it('forwards successive abort-driven replacements through the complete merge chain', async () => {
		const h = harness(['async']);
		const first = h.request('a', 0);
		flushSync(() => set(h.input, 1));
		const second = h.request('a', 1);
		flushSync(() => set(h.input, 2));
		h.request('a', 2).resolve(12);
		await drain();
		assert.deepEqual(h.renders.at(-1), [12, 0]);
		assert.equal(first.signal.aborted, true);
		assert.equal(second.signal.aborted, true);
		assert.equal(first_batch, null, 'no intermediate replacement waiter remains stranded');
		first.resolve(999);
		second.reject(new Error('late rejection'));
		await drain();
		assert.deepEqual(h.renders.at(-1), [12, 0]);
	});

	it('reports a cached fatal error without waiting for an unrelated never-settling initializer', async () => {
		const left = harness(['async']);
		const right = harness(['async']);
		const f = speculative(() => {
			set(left.input, 1);
			set(right.input, 1);
		});
		const error = new Error('cached fatal error');
		left.request('a', 1).reject(error);
		await drain();
		let caught: unknown;
		void f.commit().catch((e) => {
			caught = e;
		});
		await drain();
		assert.equal(caught, error, 'cached failure must not wait on the unrelated pending sibling');
		f.discard();
		assert.equal(right.requests.find((r) => r.input === 1)?.signal.aborted, true);
	});

	it('allows a genuinely superseding successful input to replace a failed fork outcome', async () => {
		const h = harness(['async']);
		const f = speculative(() => set(h.input, 1));
		h.request('a', 1).reject(new Error('superseded failure'));
		await drain();
		flushSync(() => set(h.input, 2));
		// Replaying the same new input in independent views is allowed. Resolve the
		// labelled queue, not a Map keyed only by input which would lose one request.
		for (const request of h.requests) if (request.input === 2) request.resolve(12);
		await drain();
		for (const request of h.requests) if (request.input === 2) request.resolve(12);
		await drain();
		const failed_calls = h.requests.filter((r) => r.input === 1).length;
		await f.commit();
		await drain();
		assert.deepEqual(h.renders.at(-1), [12, 0]);
		assert.equal(h.requests.filter((r) => r.input === 1).length, failed_calls);
	});

	it('does not let a different successful producer erase a private cached failure', async () => {
		const h = harness(['async', 'async'], false, true);
		h.request('a', 0).resolve(10);
		await drain();
		h.request('b', 0).resolve(20);
		await drain();
		const f = speculative(() => {
			set(h.input, 1);
			set(h.other, 1);
		});
		const error = new Error('a failed, b succeeded');
		const second = h.request('b', 1);
		h.request('a', 1).reject(error);
		await drain();
		second.resolve(21);
		await drain();
		const calls = h.requests.length;
		await expect(f.commit()).rejects.toBe(error);
		assert.equal(h.requests.length, calls, 'success at b cannot authorize retrying failed a');
		assert.deepEqual(h.renders.at(-1), [10, 20, 0]);
	});

	it('delivers rejection to a commit requested while still pending', async () => {
		const h = harness(['async']);
		h.request('a', 0).resolve(10);
		await drain();
		const f = speculative(() => set(h.input, 1));
		const error = new Error('pending fork failure');
		const committed = f.commit();
		const rejected = expect(committed).rejects.toBe(error);
		h.request('a', 1).reject(error);
		await rejected;
		await drain();
		assert.deepEqual(h.renders.at(-1), [10, 0]);
	});
});
