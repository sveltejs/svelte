import { afterEach, assert, beforeEach, describe, expect, it } from 'vitest';
import { flushSync, fork, getAbortSignal } from '../../src/index-client';
import { push, pop } from '../../src/internal/client/context';
import { active_effect, get } from '../../src/internal/client/runtime';
import {
	Batch,
	clear,
	current_batch,
	first_batch
} from '../../src/internal/client/reactivity/batch';
import {
	block,
	branch,
	effect_root,
	template_effect,
	user_effect
} from '../../src/internal/client/reactivity/effects';
import { source, state, set } from '../../src/internal/client/reactivity/sources';
import {
	script_binding,
	script_read,
	script_replay,
	script_value
} from '../../src/internal/client/reactivity/script-replay';
import { enable_async_mode_flag, disable_async_mode_flag } from '../../src/internal/flags';
import type { Effect, Source } from '../../src/internal/client/types';

const STATE_SITE = 1;
const STATE_KEY = 2 + STATE_SITE;

type Request = {
	owner: number;
	site: 'a' | 'b';
	value: number;
	signal: AbortSignal;
	settled: boolean;
	resolve: (value: number) => void;
	reject: (error: unknown) => void;
};

let cleanup: Array<() => void>;

beforeEach(() => {
	enable_async_mode_flag();
	cleanup = [];
});

afterEach(async () => {
	for (const destroy of cleanup.reverse()) destroy();
	await drain();
	clear();
	disable_async_mode_flag();
});

async function drain() {
	await new Promise<void>((resolve) => setTimeout(resolve, 0));
	flushSync();
}

function harness() {
	const input = source(0);
	const adoption = source(0);
	const requests: Request[] = [];
	const states = new Map<number, Source<number>>();
	const renders: number[][] = [];
	const render_effects = new Set<Effect>();
	let factories = 0;
	let installations = 0;
	let mounted = 0;
	let destroyed = 0;
	let instance: Effect | undefined;
	let script!: ReturnType<typeof script_replay>;

	function load(owner: number, site: 'a' | 'b', value: number) {
		const signal = getAbortSignal();
		return new Promise<number>((resolve, reject) => {
			const request: Request = {
				owner,
				site,
				value,
				signal,
				settled: false,
				resolve(value) {
					request.settled = true;
					resolve(value);
				},
				reject(error) {
					request.settled = true;
					reject(error);
				}
			};
			requests.push(request);
		});
	}

	push({}, true);
	try {
		flushSync(() => {
			Batch.ensure();
			cleanup.push(
				effect_root(() => {
					block(() => {
						get(input);
						get(adoption);
						if (instance) {
							current_batch!.revalidate_branch(instance);
							return;
						}
						instance = branch(() => {
							installations++;
							script = script_replay(
								(bindings, facade) => {
									const owner = ++factories;
									// Prefix key 1 must not collide with suffix state site 1 (key 3).
									const prefix = facade.state(1, state(-100));
									return {
										environment: [
											{ reactive: true, read: () => get(input) },
											{ reactive: true, read: () => get(prefix) }
										],
										thunks: [
											() => load(owner, 'a', facade.read(0)),
											null,
											null,
											() => load(owner, 'b', facade.read(STATE_KEY)),
											() => {
												const value = facade.state(
													STATE_KEY,
													state(get(bindings[0]) as number)
												) as Source<number>;
												states.set(owner, value);
												user_effect(() => {
													mounted++;
													return () => {
														destroyed++;
													};
												});
												// Native lexical reads happen before this atomic group's publication.
												return [value, get(value)];
											}
										]
									};
								},
								['async', 'state', 'local', 'async'],
								[0, 1, 1, 2],
								[[1, 3, 4]]
							);
							template_effect(
								() => {
									render_effects.add(active_effect!);
									renders.push([
										script_read(script, STATE_KEY),
										get(script_binding(script, 3)),
										script_value(script, 2),
										script_read(script, 1)
									]);
								},
								[],
								[],
								[script.ready[2]]
							);
						});
					});
				})
			);
		});
	} finally {
		pop();
	}

	function request(owner: number, site: 'a' | 'b') {
		const matching = requests.filter(
			(r) => r.owner === owner && r.site === site && !r.settled && !r.signal.aborted
		);
		assert.equal(
			matching.length,
			1,
			`one pending ${owner}:${site}; ${requests.map((r) => `${r.owner}:${r.site}(${r.value})${r.settled ? ' settled' : ''}${r.signal.aborted ? ' aborted' : ''}`).join(', ')}`
		);
		return matching[0];
	}

	function speculate(change: () => void) {
		let batch!: Batch;
		const f = fork(() => {
			batch = current_batch!;
			change();
		});
		cleanup.push(() => f.discard());
		return { fork: f, batch };
	}

	return {
		input,
		adoption,
		requests,
		states,
		renders,
		render_effects,
		request,
		speculate,
		handle: () => get(script_binding(script, STATE_SITE)) as Source<number>,
		get script() {
			return script;
		},
		get factories() {
			return factories;
		},
		get installations() {
			return installations;
		},
		get mounted() {
			return mounted;
		},
		get destroyed() {
			return destroyed;
		}
	};
}

describe('post-await state kernel', () => {
	it('adopts equal-valued winning Sources without refetching or recreating presentation', async () => {
		const h = harness();
		const { fork: f } = h.speculate(() => set(h.adoption, 1));
		h.request(2, 'a').resolve(7);
		await drain();
		const pending_fork = h.request(2, 'b');
		const fork_source = h.states.get(2)!;
		h.request(1, 'a').resolve(7);
		await drain();
		const real_source = h.states.get(1)!;
		assert.notEqual(real_source, fork_source);
		h.request(1, 'b').resolve(7);
		await drain();
		assert.equal(h.handle(), real_source);
		assert.deepEqual(h.renders, [[7, 7, 7, -100]]);
		assert.equal(h.requests.length, 4, 'an equal state value must not refetch on Source adoption');
		assert.equal(pending_fork.signal.aborted, false);

		pending_fork.resolve(7);
		await drain();
		await f.commit();
		await drain();
		assert.equal(h.handle(), real_source);
		assert.deepEqual(
			h.renders,
			[[7, 7, 7, -100]],
			'equal visible values must not rerun the renderer'
		);
		assert.equal(h.requests.length, 4);
		assert.equal(h.render_effects.size, 1);
		assert.equal(h.installations, 1);
		assert.equal(h.mounted, 1);
		assert.equal(h.destroyed, 0);
		assert.equal(first_batch, null);
	});

	it('keeps edited established state and its Source identity when an older fork commits', async () => {
		const h = harness();
		const { fork: f } = h.speculate(() => set(h.input, 1));
		h.request(2, 'a').resolve(1);
		await drain();
		h.request(2, 'b').resolve(10);
		await drain();
		h.request(1, 'a').resolve(2);
		await drain();
		h.request(1, 'b').resolve(20);
		await drain();
		const winning = h.handle();
		assert.equal(winning, h.states.get(1));
		assert.notEqual(winning, h.states.get(2));

		flushSync(() => set(winning, 3));
		await drain();
		// Publishing the real update rebases the fork; each may need its own valid
		// result, so preserve the two labelled requests instead of a value-keyed Map.
		const real_update = h.requests.filter(
			(r) => r.site === 'b' && r.value === 3 && !r.signal.aborted && !r.settled
		);
		assert.equal(real_update.length, 1);
		real_update[0].resolve(30);
		await drain();
		const fork_update = h.requests.filter(
			(r) => r.site === 'b' && r.value === 3 && !r.signal.aborted && !r.settled
		);
		assert.equal(fork_update.length, 1);
		fork_update[0].resolve(30);
		await drain();
		await f.commit();
		await drain();
		assert.equal(h.handle(), winning);
		assert.deepEqual(h.renders.at(-1), [3, 30, 2, -100]);
		assert.equal(h.factories, 2);
		assert.equal(h.render_effects.size, 1);
		assert.equal(h.installations, 1);
		assert.equal(h.mounted, 1);
		assert.equal(h.destroyed, 0);
	});

	it('retains a failed fork’s private Source and original error across unrelated publication', async () => {
		const h = harness();
		const { fork: f, batch } = h.speculate(() => set(h.input, 1));
		h.request(2, 'a').resolve(1);
		await drain();
		const private_source = h.states.get(2)!;
		const error = new Error('private state failure');
		h.request(2, 'b').reject(error);
		await drain();
		h.request(1, 'a').resolve(0);
		await drain();
		h.request(1, 'b').resolve(0);
		await drain();
		const winning = h.handle();
		batch.activate();
		try {
			assert.equal(h.handle(), private_source);
			assert.equal(script_read(h.script, STATE_KEY), 1);
		} finally {
			batch.deactivate();
		}
		const calls = h.requests.length;
		await expect(f.commit()).rejects.toBe(error);
		await expect(f.commit()).rejects.toBe(error);
		assert.equal(h.requests.length, calls);
		assert.equal(h.handle(), winning);
		assert.deepEqual(h.renders.at(-1), [0, 0, 0, -100]);
		flushSync(() => set(private_source, 999));
		await drain();
		assert.equal(h.factories, 2, 'a retired Source cannot resurrect its initializer');
		assert.equal(h.handle(), winning);
	});

	it('carries an external suffix-state edit into a fresh initializer before taking its snapshot', async () => {
		const h = harness();
		h.request(1, 'a').resolve(0);
		await drain();
		const initial = h.handle();
		const stale = h.request(1, 'b');
		flushSync(() => set(initial, 7));
		await drain();
		assert.equal(h.factories, 2);
		assert.equal(stale.signal.aborted, true);
		h.request(2, 'a').resolve(0);
		await drain();
		assert.equal(h.request(2, 'b').value, 7);
		h.request(2, 'b').resolve(70);
		await drain();
		const winning = h.handle();
		assert.notEqual(winning, initial);
		assert.deepEqual(
			h.renders.at(-1),
			[7, 70, 7, -100],
			'suffix override must not collide with prefix state'
		);
		stale.resolve(999);
		await drain();
		assert.deepEqual(h.renders.at(-1), [7, 70, 7, -100]);

		flushSync(() => set(winning, 8));
		await drain();
		h.request(2, 'b').resolve(80);
		await drain();
		assert.equal(h.handle(), winning);
		assert.equal(h.factories, 2);
		assert.deepEqual(h.renders.at(-1), [8, 80, 7, -100]);
		assert.equal(h.mounted, 1);
		assert.equal(h.destroyed, 0);
	});
});
