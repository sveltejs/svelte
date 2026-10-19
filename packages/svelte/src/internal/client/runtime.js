/** @import { BatchRecord, Derived, Effect, Reaction, Source, Value } from '#client' */
import { DEV } from 'esm-env';
import { get_descriptors, get_prototype_of, includes, index_of } from '../shared/utils.js';
import {
	destroy_block_effect_children,
	destroy_effect_children,
	effect_tracking,
	execute_effect_teardown
} from './reactivity/effects.js';
import {
	DIRTY,
	MAYBE_DIRTY,
	CLEAN,
	DERIVED,
	DESTROYED,
	BRANCH_EFFECT,
	STATE_SYMBOL,
	BLOCK_EFFECT,
	ROOT_EFFECT,
	CONNECTED,
	REACTION_IS_UPDATING,
	STALE_REACTION,
	ERROR_VALUE,
	MANAGED_EFFECT,
	REACTION_RAN,
	ASYNC,
	ASSIGNED
} from './constants.js';
import { old_values } from './reactivity/sources.js';
import {
	reactivity_loss_tracker,
	execute_derived,
	freeze_derived_effects,
	recent_async_deriveds,
	unfreeze_derived_effects,
	update_derived,
	view_entry
} from './reactivity/deriveds.js';
import { async_mode_flag, tracing_mode_flag } from '../flags/index.js';
import { tracing_expressions } from './dev/tracing.js';
import { get_error } from '../shared/dev.js';
import {
	component_context,
	dev_current_component_function,
	dev_stack,
	is_runes,
	set_component_context,
	set_dev_current_component_function,
	set_dev_stack
} from './context.js';
import {
	Batch,
	batch_values,
	current_batch,
	first_batch,
	flushSync,
	previous_batch,
	schedule_effect,
	view_batch
} from './reactivity/batch.js';
import { handle_error } from './error-handling.js';
import { UNINITIALIZED } from '../../constants.js';
import { captured_signals } from './legacy.js';
import { without_reactive_context } from './dom/elements/bindings/shared.js';
import { set_signal_status, update_derived_status } from './reactivity/status.js';
import * as w from './warnings.js';

export let is_destroying_effect = false;

/** @param {boolean} value */
export function set_is_destroying_effect(value) {
	is_destroying_effect = value;
}

/** @type {null | Reaction} */
export let active_reaction = null;

export let untracking = false;

/** @param {null | Reaction} reaction */
export function set_active_reaction(reaction) {
	active_reaction = reaction;
}

/** @type {null | Effect} */
export let active_effect = null;

/** @param {null | Effect} effect */
export function set_active_effect(effect) {
	active_effect = effect;
}

/**
 * When sources are created within a reaction, reading and writing
 * them within that reaction should not cause a re-run
 * @type {null | Set<Value>}
 */
export let current_sources = null;

/** @param {Value} value */
export function push_reaction_value(value) {
	if (
		active_reaction !== null &&
		((!async_mode_flag && (active_reaction.f & REACTION_IS_UPDATING) !== 0) ||
			(active_reaction.f & DERIVED) !== 0)
	) {
		(current_sources ??= new Set()).add(value);
	}
}

/**
 * The dependencies of the reaction that is currently being executed. In many cases,
 * the dependencies are unchanged between runs, and so this will be `null` unless
 * and until a new dependency is accessed — we track this via `skipped_deps`
 * @type {null | Value[]}
 */
export let new_deps = null;

export let skipped_deps = 0;

/**
 * Tracks writes that the effect it's executed in doesn't listen to yet,
 * so that the dependency can be added to the effect later on if it then reads it
 * @type {null | Value[]}
 */
export let untracked_writes = null;

/** @param {null | Value[]} value */
export function set_untracked_writes(value) {
	untracked_writes = value;
}

/**
 * @type {number} Used by sources and deriveds for handling updates: every new value — whether it is
 * the real-world (i.e. latest) one, or only exists within a batch — gets a new version. Versions
 * identify values, they are only ever compared for equality (except for `$inspect.trace`).
 * Version starts from 1 so that unowned deriveds differentiate between a created effect and a run one for tracing
 **/
export let write_version = 1;

/** @type {number} Used to version each read of a source of derived to avoid duplicating dependencies inside a reaction */
let read_version = 0;

export let update_version = read_version;

/** @param {number} value */
export function set_update_version(value) {
	update_version = value;
}

export function increment_write_version() {
	return ++write_version;
}

/**
 * The version `signal` has in the active view of the world
 * @param {Value} signal
 */
export function version_of(signal) {
	return (
		batch_values === null
			? signal
			: (signal.f & DERIVED) !== 0
				? view_entry(/** @type {Derived} */ (signal))
				: batch_values.get(signal) ?? signal
	).wv;
}

/**
 * Whether the values with the given versions are (still) what `deps` hold in the active view of the world.
 * Dependencies are checked in order and deriveds are brought up to date along the way, so that we
 * don't evaluate a derived that the reaction would no longer read (e.g. `a ? b : c` where `a` changed)
 * @param {Value[] | null} deps
 * @param {number[]} dv
 */
export function is_current(deps, dv) {
	for (var i = 0; i < dv.length; i++) {
		var dependency = /** @type {Value[]} */ (deps)[i];

		if (batch_values === null && is_dirty(/** @type {Derived} */ (dependency))) {
			update_derived(/** @type {Derived} */ (dependency));
		}

		if (version_of(dependency) !== dv[i]) return false;
	}

	return true;
}

/**
 * The run of `reaction` that applies in the active view of the world: the record of a block or async
 * effect in the active batch, if it has one (see `update_record`), or else the reaction itself — whose
 * `deps` and `dv` are its global state
 * @param {Reaction} reaction
 * @returns {Reaction | BatchRecord}
 */
function run_of(reaction) {
	return ((reaction.f & (BLOCK_EFFECT | ASYNC)) !== 0 && view_batch?.record(reaction)) || reaction;
}

/**
 * Determines whether a derived or effect is dirty.
 * If it is MAYBE_DIRTY, will set the status to CLEAN.
 * Deriveds are only checked like this in the real world — within the view of a batch,
 * see `view_entry`. Effects are checked against the run that applies (see `run_of`).
 * @param {Reaction} reaction
 * @returns {boolean}
 */
export function is_dirty(reaction) {
	var flags = reaction.f;

	if ((flags & DIRTY) !== 0) {
		return true;
	}

	if ((flags & MAYBE_DIRTY) !== 0) {
		var run = run_of(reaction);
		var deps = run.deps;
		var dv = run.dv;

		if (dv === null) return true;

		if (batch_values === null) {
			for (var i = 0, length = dv.length; i < length; i++) {
				var dependency = /** @type {Value[]} */ (deps)[i];

				if (is_dirty(/** @type {Derived} */ (dependency))) {
					update_derived(/** @type {Derived} */ (dependency));
				}

				if (dependency.wv !== dv[i]) return true;
			}
		} else if (!is_current(deps, dv)) {
			return true;
		}

		if ((flags & CONNECTED) !== 0) {
			set_signal_status(reaction, CLEAN);
		}
	}

	return false;
}

/**
 * @param {Value} signal
 * @param {Effect} effect
 * @param {boolean} [root]
 */
function schedule_possible_effect_self_invalidation(signal, effect, root = true) {
	var reactions = signal.reactions;
	if (reactions === null) return;

	if (!async_mode_flag && current_sources !== null && current_sources.has(signal)) {
		return;
	}

	for (var i = 0; i < reactions.length; i++) {
		var reaction = reactions[i];

		if ((reaction.f & DERIVED) !== 0) {
			schedule_possible_effect_self_invalidation(/** @type {Derived} */ (reaction), effect, false);
		} else if (effect === reaction) {
			schedule_effect(/** @type {Effect} */ (reaction), root ? DIRTY : MAYBE_DIRTY);
		}
	}
}

/** @param {Reaction} reaction */
export function update_reaction(reaction) {
	var previous_deps = new_deps;
	var previous_skipped_deps = skipped_deps;
	var previous_untracked_writes = untracked_writes;
	var previous_reaction = active_reaction;
	var previous_sources = current_sources;
	var previous_component_context = component_context;
	var previous_untracking = untracking;
	var previous_update_version = update_version;

	var flags = reaction.f;

	new_deps = /** @type {null | Value[]} */ (null);
	skipped_deps = 0;
	untracked_writes = null;
	active_reaction = (flags & (BRANCH_EFFECT | ROOT_EFFECT)) === 0 ? reaction : null;

	current_sources = null;
	set_component_context(reaction.ctx);
	untracking = false;
	update_version = ++read_version;

	if (reaction.ac !== null) {
		without_reactive_context(() => {
			/** @type {AbortController} */ (reaction.ac).abort(STALE_REACTION);
		});

		reaction.ac = null;
	}

	try {
		reaction.f |= REACTION_IS_UPDATING;
		var fn = /** @type {Function} */ (reaction.fn);
		var result = fn();
		reaction.f |= REACTION_RAN;
		var read = update_dependencies(reaction, flags, result, false);

		// If we're inside an effect and we have untracked writes, then we need to
		// ensure that if any of those untracked writes result in re-invalidation
		// of the current effect, then that happens accordingly
		if (
			is_runes() &&
			untracked_writes !== null &&
			!untracking &&
			read > 0 &&
			(reaction.f & (DERIVED | MAYBE_DIRTY | DIRTY)) === 0
		) {
			for (var i = 0; i < /** @type {Source[]} */ (untracked_writes).length; i++) {
				schedule_possible_effect_self_invalidation(
					untracked_writes[i],
					/** @type {Effect} */ (reaction)
				);
			}
		}

		// If we are returning to an previous reaction then
		// we need to increment the read version to ensure that
		// any dependencies in this reaction aren't marked with
		// the same version
		if (previous_reaction !== null && previous_reaction !== reaction) {
			read_version++;

			// update the `rv` of the previous reaction's deps — both existing and new —
			// so that they are not added again
			if (previous_reaction.deps !== null) {
				for (let i = 0; i < previous_skipped_deps; i += 1) {
					previous_reaction.deps[i].rv = read_version;
				}
			}

			if (previous_deps !== null) {
				for (const dep of previous_deps) {
					dep.rv = read_version;
				}
			}

			if (untracked_writes !== null) {
				if (previous_untracked_writes === null) {
					previous_untracked_writes = untracked_writes;
				} else {
					previous_untracked_writes.push(.../** @type {Source[]} */ (untracked_writes));
				}
			}
		}

		return result;
	} catch (error) {
		var value = error;

		try {
			value = handle_error(error);
		} finally {
			// Still commit the deps read before the throw, otherwise deriveds connected by this run keep no reader
			// and the reaction never re-runs when they change. For a derived, the error is the value of the run
			// (`get` throws it) — unless an error boundary took care of it
			update_dependencies(reaction, flags, value, value === error);
		}

		return value;
	} finally {
		reaction.f ^= REACTION_IS_UPDATING;
		new_deps = previous_deps;
		skipped_deps = previous_skipped_deps;
		untracked_writes = previous_untracked_writes;
		active_reaction = previous_reaction;
		current_sources = previous_sources;
		set_component_context(previous_component_context);
		untracking = previous_untracking;
		update_version = previous_update_version;
	}
}

/**
 * Store the result of the current run of `reaction` where it belongs — the versions of the
 * values it read and, for a derived, its value — and update the edges of the graph.
 *
 * A run belongs to the real world — and becomes the reaction's global state — unless
 * - it is a derived that read values which aren't the latest ones (it is then stored in the batch
 *   whose view of the world it ran in, see `view_entry`)
 * - it is an effect run that belongs to a batch (see `update_record`)
 * - it is a derived evaluated in a teardown, in which case its result is discarded
 *
 * The edges of the graph (`reaction.deps` and the `reactions` of its dependencies) are a
 * superset of the dependencies of every live record, so that changes to any of them reach
 * the reaction. They are only pruned when a global run happens and no batch holds a record.
 * @param {Reaction} reaction
 * @param {number} flags the flags of the reaction before the run
 * @param {any} value the value of the run (only relevant for deriveds)
 * @param {boolean} error whether the value is an error
 * @returns {number} the number of values the run read
 */
function update_dependencies(reaction, flags, value, error) {
	var deps = reaction.deps;
	var length = skipped_deps + (new_deps === null ? 0 : new_deps.length);
	var dv = reaction.dv;

	// (an effect can be destroyed while it runs, e.g. by an error boundary)
	if ((reaction.f & DESTROYED) !== 0 || ((flags & DERIVED) !== 0 && is_destroying_effect)) {
		return length;
	}

	// A run of a derived in the real world is its new global state. Other batches may still see the current one
	// (in a view, whether a derived's run is a global one is decided by `update_record`)
	if (
		(flags & DERIVED) !== 0 &&
		batch_values === null &&
		first_batch !== null &&
		first_batch.next !== null
	) {
		keep_global_run(/** @type {Derived} */ (reaction), flags, value, error);
	}

	// Fast path: the reaction read the same values as before, in the real world
	if (
		new_deps === null &&
		batch_values === null &&
		dv !== null &&
		length === deps?.length &&
		(flags & (BLOCK_EFFECT | ASYNC)) === 0
	) {
		// The run saw what its dependencies hold now — a write during the run after it read
		// the value marks it dirty (see `Batch#schedule`), so it doesn't take effect here
		for (var i = 0; i < length; i++) dv[i] = deps[i].wv;
		if (dv.length !== length) dv.length = length;

		if ((flags & DERIVED) !== 0) set_derived_value(/** @type {Derived} */ (reaction), value, error);

		return length;
	}

	return update_record(reaction, flags, deps, length, value, error);
}

/**
 * Make `value` the (real-world) value of `derived` — it keeps its version if it is the same value
 * @param {Derived} derived
 * @param {any} value
 * @param {boolean} error
 */
function set_derived_value(derived, value, error) {
	// a run replaces a value that was assigned to the derived
	var flags = derived.f & ~ASSIGNED;

	if (error || (flags & ERROR_VALUE) !== 0 || !derived.equals(value)) {
		derived.v = value;
		derived.wv = increment_write_version();
		flags = error ? flags | ERROR_VALUE : flags & ~ERROR_VALUE;
	}

	derived.f = flags;
	update_derived_status(derived);
}

/**
 * Whether `holder` — `derived` itself, or a record of it — holds `value` (errors are never the same value)
 * @param {Derived} derived
 * @param {Derived | BatchRecord | undefined} holder
 * @param {any} value
 */
function holds(derived, holder, value) {
	return (
		holder !== undefined &&
		!(holder === derived
			? (derived.f & ERROR_VALUE) !== 0
			: /** @type {BatchRecord} */ (holder).e) &&
		derived.equals.call(/** @type {Derived} */ (holder), value)
	);
}

/**
 * The general case of `update_dependencies`, which
 * 1. decides where the run belongs: to the batch whose view of the world is active (as a record, see
 *    `Batch#records`), or to the real world (as the reaction's global state)
 * 2. records the versions of the values the run read (`dv`)
 * 3. updates the edges of the graph
 * 4. stores the run where it belongs
 * @param {Reaction} reaction
 * @param {number} flags the flags of the reaction before the run
 * @param {Value[] | null} deps `reaction.deps`, the first `skipped_deps` of which the run read again (in the
 * same order) — what else it read is in `new_deps`
 * @param {number} length the number of values the run read
 * @param {any} value the value of the run (only relevant for deriveds)
 * @param {boolean} error whether the value is an error
 */
function update_record(reaction, flags, deps, length, value, error) {
	// Block and async effects that run while a batch is processed produce a result for that batch (the
	// branch it selected, the value an async expression resolved to for it), which it keeps until it
	// commits. The first run of a block effect is the exception — it creates (and commits) its initial
	// branch. (Whether a derived's run belongs to a batch depends on what it read, see below)
	var batch =
		((flags & ASYNC) !== 0 ||
			(flags & (BLOCK_EFFECT | REACTION_RAN)) === (BLOCK_EFFECT | REACTION_RAN)) &&
		view_batch?.committing === false
			? view_batch
			: null;

	// A derived that has another version in the view than in the real world — because the view undoes an
	// assignment to it, or it was assigned in a fork — never runs for the real world (see `view_entry`)
	if (batch_values !== null && (flags & DERIVED) !== 0) {
		var written = batch_values.get(/** @type {Derived} */ (reaction));

		if (written !== undefined && written.wv !== /** @type {Derived} */ (reaction).wv) {
			batch = view_batch;
		}
	}

	// A global run in the real world updates the versions in place. Anything else needs a new array:
	// a record must not share it with the global state, and a derived's run can turn out to belong
	// to the batch halfway through the loop
	var dv = batch === null && batch_values === null && reaction.dv !== null ? reaction.dv : [];
	var i, dep;

	for (i = 0; i < length; i++) {
		dep =
			i < skipped_deps
				? /** @type {Value[]} */ (deps)[i]
				: /** @type {Value[]} */ (new_deps)[i - skipped_deps];
		dv[i] = seen_version(dep);

		// Within a batch's view, a derived's run belongs to the batch unless everything it read is the latest
		// value: the version it saw is the real-world one, and — for a derived — that one is up to date
		if (
			batch_values !== null &&
			(flags & DERIVED) !== 0 &&
			(dv[i] !== dep.wv || (dep.f & (DERIVED | CLEAN)) === DERIVED)
		) {
			batch = view_batch;
		}
	}

	if (dv.length !== length) dv.length = length;

	if (batch === null && batch_values !== null && (flags & DERIVED) !== 0) {
		keep_global_run(/** @type {Derived} */ (reaction), flags, value, error);
	}

	// The edges — `reaction.deps`, and `reaction` in the `reactions` of each of them — must cover what every
	// live run of the reaction read (its global run, and the records batches hold of it), so that a change to
	// any of those values reaches it. So unless this is a global run and no batch holds a record, edges are
	// only added (and pruned by a later global run). Otherwise they are updated exactly like on `main`
	var keep = batch !== null;
	var tracking = effect_tracking() && (reaction.f & CONNECTED) !== 0;

	/** The values this run read, in order (only needed if edges are kept) @type {Value[] | null} */
	var read = null;

	for (var b = first_batch; !keep && b !== null; b = b.next) {
		keep = b.records?.has(reaction) === true;
	}

	if (keep) {
		read = deps === null ? [] : deps.slice(0, skipped_deps);
		reaction.deps = deps ??= [];

		if (new_deps !== null) {
			for (dep of new_deps) {
				read.push(dep);

				if (!includes.call(deps, dep)) {
					deps.push(dep);
					if (tracking) (dep.reactions ??= []).push(reaction);
				}
			}
		}
	} else if (new_deps !== null || (deps !== null && skipped_deps < deps.length)) {
		// remove the edges to values the run didn't read again, and add those to values it read
		// for the first time
		remove_reactions(reaction, skipped_deps);

		if (deps === null || (skipped_deps === 0 && new_deps !== null)) {
			reaction.deps = deps = new_deps;
		} else {
			deps.length = length;

			for (i = skipped_deps; i < length; i++) {
				deps[i] = /** @type {Value[]} */ (new_deps)[i - skipped_deps];
			}
		}

		if (tracking) {
			for (i = skipped_deps; i < length; i++) {
				dep = /** @type {Value[]} */ (deps)[i];
				(dep.reactions ??= []).push(reaction);
			}
		}
	}

	if (batch !== null) {
		// (the record has its own copy of what the run read, `deps` are the edges)
		(batch.records ??= new Map()).set(
			reaction,
			(flags & DERIVED) !== 0
				? derived_record(
						/** @type {Derived} */ (reaction),
						batch,
						/** @type {Value[]} */ (read),
						dv,
						value,
						error
					)
				: { deps: /** @type {Value[]} */ (read), dv }
		);
	} else {
		// (if edges were kept, `deps` is reordered so that it starts with what the run read)
		set_global_run(reaction, read, dv);

		if ((flags & DERIVED) !== 0) {
			set_derived_value(/** @type {Derived} */ (reaction), value, error);

			// A record of the derived in the active batch is outdated now. (Effects never have one at this point:
			// their runs only become global outside of processing, on their first run, or once the batch commits,
			// whose records are promoted by then)
			view_batch?.records?.delete(reaction);
		}
	}

	return length;
}

/**
 * A run of `derived` that becomes its global state replaces the current one, which other batches may still see:
 * their views differ from the real world, and can undo the writes that made it outdated. It is kept as a record in
 * each of them that doesn't have one, so that they don't evaluate the derived again — which would give an equal value
 * a new version, and re-run what saw the current one (restarting async work, for example). (Like any record, it is
 * only used where it `is_current`)
 * Note that this is mainly an optimization that avoids needless reruns of async effects, but doesn't affect correctness.
 * @param {Derived} derived
 * @param {number} flags the flags of the derived before the run
 * @param {any} value the value of the run
 * @param {boolean} error whether the value is an error
 */
function keep_global_run(derived, flags, value, error) {
	var dv = derived.dv;

	if (
		// no valid run, or one that doesn't depend on anything — which is only run again if it was invalidated
		dv === null ||
		dv.length === 0 ||
		// an assigned value isn't a run, see `view_entry`
		(flags & ASSIGNED) !== 0 ||
		// a derived that uses an abort signal aborted the current run when it ran again
		derived.ac !== null ||
		// the same value keeps its version
		(!error && (flags & ERROR_VALUE) === 0 && derived.equals(value))
	) {
		return;
	}

	for (var batch = first_batch; batch !== null; batch = batch.next) {
		if (batch !== view_batch && !batch.records?.has(derived)) {
			(batch.records ??= new Map()).set(derived, {
				deps: /** @type {Value[]} */ (derived.deps).slice(0, dv.length),
				dv: dv.slice(),
				v: derived.v,
				wv: derived.wv,
				e: (flags & ERROR_VALUE) !== 0
			});
		}
	}
}

/**
 * The version of `signal` that the current run saw. Recording it never evaluates anything: a derived that
 * isn't in the view's cache (anymore) was invalidated by a write during the run, or can't be cached —
 * the run then doesn't count as having seen its current version, just like in the real world, where
 * a derived that changes during the run gets a new version only once it is evaluated again
 * @param {Value} signal
 */
function seen_version(signal) {
	if (batch_values === null) return signal.wv;

	var entry = batch_values.get(signal);
	return entry !== undefined ? entry.wv : (signal.f & DERIVED) !== 0 ? -1 : signal.wv;
}

/**
 * The record of a run of `derived` that belongs to `batch`. Its value keeps the version of the same value
 * in the batch's view (if it held one before), or in the real world, so that reactions which saw it remain valid
 * @param {Derived} derived
 * @param {Batch} batch
 * @param {Value[]} deps
 * @param {number[]} dv
 * @param {any} v
 * @param {boolean} e
 * @returns {BatchRecord}
 */
function derived_record(derived, batch, deps, dv, v, e) {
	var previous = batch.record(derived);

	var wv = e
		? increment_write_version()
		: holds(derived, previous, v)
			? /** @type {number} */ (/** @type {BatchRecord} */ (previous).wv)
			: holds(derived, derived, v)
				? derived.wv
				: increment_write_version();

	return { deps, dv, v, e, wv };
}

/**
 * Make the run that read the values `read` (in this order, `null` if they already are `reaction.deps`)
 * with the versions `dv` the global run of `reaction`
 * @param {Reaction} reaction
 * @param {Value[] | null} read
 * @param {number[]} dv
 */
function set_global_run(reaction, read, dv) {
	var deps = /** @type {Value[]} */ (reaction.deps);
	var i = 0;

	if (read !== null) {
		// The reads must be the start of `deps` (which is what `dv` lines up with). But `deps` can't simply be
		// replaced by them: it's also the list of the graph's edges (the values that have `reaction` among their
		// `reactions`), which covers the runs that batches hold, too (see `update_record`). So the other edges
		// are kept, after the reads — `read` itself is extended to become the new `deps` (a promoted record can
		// still be looked at afterwards, e.g. the entry of a derived assigned in a fork, but only its first
		// `dv.length` entries are checked). If the reads already are the start of `deps` (the common case),
		// nothing changes
		while (i < read.length && deps[i] === read[i]) i++;

		if (i < read.length) {
			for (var dep of deps) {
				if (!includes.call(read, dep)) read.push(dep);
			}

			reaction.deps = read;
		}
	}

	reaction.dv = dv;
}

/**
 * Make the record a batch holds of `reaction` its global state, e.g. because the batch
 * committed, which makes its results the real-world ones (for a derived, that includes its value)
 * @param {Reaction} reaction
 * @param {BatchRecord} record
 */
export function promote_record(reaction, record) {
	set_global_run(reaction, record.deps, record.dv);

	if ((reaction.f & DERIVED) !== 0) {
		var derived = /** @type {Derived} */ (reaction);

		derived.v = record.v;
		derived.wv = /** @type {number} */ (record.wv);
		derived.f = (record.e ? derived.f | ERROR_VALUE : derived.f & ~ERROR_VALUE) & ~ASSIGNED;
		update_derived_status(derived);
	}
}

/**
 * @template V
 * @param {Reaction} signal
 * @param {Value<V>} dependency
 * @returns {void}
 */
function remove_reaction(signal, dependency) {
	let reactions = dependency.reactions;
	if (reactions !== null) {
		var index = index_of.call(reactions, signal);
		if (index !== -1) {
			var new_length = reactions.length - 1;
			if (new_length === 0) {
				reactions = dependency.reactions = null;
			} else {
				// Swap with last element and then remove.
				reactions[index] = reactions[new_length];
				reactions.pop();
			}
		}
	}

	// If the derived has no reactions, then we can disconnect it from the graph,
	// allowing it to either reconnect in the future, or be GC'd by the VM.
	if (
		reactions === null &&
		(dependency.f & DERIVED) !== 0 &&
		// Destroying a child effect while updating a parent effect can cause a dependency to appear
		// to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
		// allows us to skip the expensive work of disconnecting and immediately reconnecting it
		(new_deps === null || !includes.call(new_deps, dependency))
	) {
		var derived = /** @type {Derived} */ (dependency);

		if ((derived.f & CONNECTED) !== 0) {
			derived.f ^= CONNECTED;
		}

		// In a fork it's possible that a derived is executed and gets reactions, then commits, but is
		// never re-executed. This is possible when the derived is only executed once in the context
		// of a new branch which happens before fork.commit() runs. In this case, the derived still has
		// UNINITIALIZED as its value, and then when it's losing its reactions we need to ensure it stays
		// DIRTY so it is reexecuted once someone wants its value again.
		if (derived.v !== UNINITIALIZED) {
			update_derived_status(derived);
		}

		// Call abort controller, noone's listening to this derived anymore
		if (derived.ac !== null) {
			without_reactive_context(() => {
				/** @type {AbortController} */ (derived.ac).abort(STALE_REACTION);
				derived.ac = null;
				// ensure it reruns right away next time instead of potentially returning a rejected promise as its value
				set_signal_status(derived, DIRTY);
				derived.dv = null;
			});
		}

		// freeze any effects inside this derived
		freeze_derived_effects(derived);

		// Disconnect any reactions owned by this reaction
		remove_reactions(derived, 0);
	}
}

/**
 * @param {Reaction} signal
 * @param {number} start_index
 * @returns {void}
 */
export function remove_reactions(signal, start_index) {
	var dependencies = signal.deps;
	if (dependencies === null) return;

	for (var i = start_index; i < dependencies.length; i++) {
		remove_reaction(signal, dependencies[i]);
	}
}

/**
 * @param {Effect} effect
 * @returns {void}
 */
export function update_effect(effect) {
	var flags = effect.f;

	if ((flags & DESTROYED) !== 0) {
		return;
	}

	set_signal_status(effect, CLEAN);

	var previous_effect = active_effect;

	active_effect = effect;

	if (DEV) {
		var previous_component_fn = dev_current_component_function;
		set_dev_current_component_function(effect.component_function);
		var previous_stack = /** @type {any} */ (dev_stack);
		// only block effects have a dev stack, keep the current one otherwise
		set_dev_stack(effect.dev_stack ?? dev_stack);
	}

	try {
		if ((flags & (BLOCK_EFFECT | MANAGED_EFFECT)) !== 0) {
			destroy_block_effect_children(effect);
		} else {
			destroy_effect_children(effect);
		}

		execute_effect_teardown(effect);
		var teardown = update_reaction(effect);
		effect.teardown = typeof teardown === 'function' ? teardown : null;

		// Whether an effect is dirty is determined by the exact versions of its dependencies (see
		// `update_dependencies`) — this only marks when it last ran, which `$inspect.trace` uses
		effect.wv = write_version;

		// In DEV, increment versions of any sources that were written to during the effect,
		// so that they are correctly marked as dirty when the effect re-runs
		if (DEV && tracing_mode_flag && (effect.f & DIRTY) !== 0 && effect.deps !== null) {
			for (var dep of effect.deps) {
				if (dep.set_during_effect) {
					dep.wv = increment_write_version();
					dep.set_during_effect = false;
				}
			}
		}
	} finally {
		active_effect = previous_effect;

		if (DEV) {
			set_dev_current_component_function(previous_component_fn);
			set_dev_stack(previous_stack);
		}
	}
}

/**
 * Returns a promise that resolves once any pending state changes have been applied.
 * @returns {Promise<void>}
 */
export async function tick() {
	if (async_mode_flag) {
		return new Promise((f) => {
			// Race them against each other - in almost all cases requestAnimationFrame will fire first,
			// but e.g. in case the window is not focused or a view transition happens, requestAnimationFrame
			// will be delayed and setTimeout helps us resolve fast enough in that case
			requestAnimationFrame(() => f());
			setTimeout(() => f());
		});
	}

	await Promise.resolve();

	// By calling flushSync we guarantee that any pending state changes are applied after one tick.
	// TODO look into whether we can make flushing subsequent updates synchronously in the future.
	flushSync();
}

/**
 * Returns a promise that resolves once any state changes, and asynchronous work resulting from them,
 * have resolved and the DOM has been updated
 * @returns {Promise<void>}
 * @since 5.36
 */
export function settled() {
	return Batch.ensure().settled();
}

/**
 * @template V
 * @param {Value<V>} signal
 * @returns {V}
 */
export function get(signal) {
	var flags = signal.f;
	var is_derived = (flags & DERIVED) !== 0;

	captured_signals?.add(signal);

	/** The reaction that reads `signal` after an `await`, if any */
	var late_reader = null;

	// Register the dependency on the current reaction signal.
	if (active_reaction !== null && !untracking) {
		// if we're in a derived that is being read inside an _async_ derived,
		// it's possible that the effect was already destroyed. In this case,
		// we don't add the dependency, because that would create a memory leak
		var destroyed = active_effect !== null && (active_effect.f & DESTROYED) !== 0;

		if (!destroyed && (current_sources === null || !current_sources.has(signal))) {
			var deps = active_reaction.deps;

			if ((active_reaction.f & REACTION_IS_UPDATING) !== 0) {
				// we're in the effect init/update cycle
				if (signal.rv < read_version) {
					signal.rv = read_version;

					// If the signal is accessing the same dependencies in the same
					// order as it did last time, increment `skipped_deps`
					// rather than updating `new_deps`, which creates GC cost
					if (new_deps === null && deps !== null && deps[skipped_deps] === signal) {
						skipped_deps++;
					} else if (new_deps === null) {
						new_deps = [signal];
					} else {
						new_deps.push(signal);
					}
				}
			} else {
				late_reader = active_reaction;

				// We're adding a dependency outside the init/update cycle (i.e. after an `await`).
				// We have to deduplicate deps/reactions in this case or remove_reactions could
				// disconnect deps/reactions that are actually still in use (if skip_deps says
				// "disconnect all after this index" and some of the signals are also present in
				// list prior to the cutoff index, i.e. that should be kept).
				active_reaction.deps ??= [];
				if (!includes.call(active_reaction.deps, signal)) {
					active_reaction.deps.push(signal);
				}

				var reactions = signal.reactions;

				if (reactions === null) {
					signal.reactions = [active_reaction];
				} else if (!includes.call(reactions, active_reaction)) {
					reactions.push(active_reaction);
				}
			}
		}
	}

	if (DEV) {
		if (
			!untracking &&
			reactivity_loss_tracker &&
			// By checking that current/previous batch are null we filter out false positives.
			// reactivity_loss_tracker is only reset after a microtask, so if a flush happens
			// before that, we get warnings for things we shouldn't warn on.
			current_batch === null &&
			previous_batch === null &&
			!reactivity_loss_tracker.warned &&
			(reactivity_loss_tracker.effect.f & REACTION_IS_UPDATING) === 0 &&
			!reactivity_loss_tracker.effect_deps.has(signal)
		) {
			reactivity_loss_tracker.warned = true;

			w.await_reactivity_loss(/** @type {string} */ (signal.label));

			var trace = get_error('traced at');
			// eslint-disable-next-line no-console
			if (trace) console.warn(trace);
		}

		recent_async_deriveds.delete(signal);

		if (
			tracing_mode_flag &&
			!untracking &&
			tracing_expressions !== null &&
			active_reaction !== null &&
			tracing_expressions.reaction === active_reaction
		) {
			// Used when mapping state between special blocks like `each`
			if (signal.trace) {
				signal.trace();
			} else {
				trace = get_error('traced at');

				if (trace) {
					var entry = tracing_expressions.entries.get(signal);

					if (entry === undefined) {
						entry = { traces: [] };
						tracing_expressions.entries.set(signal, entry);
					}

					var last = entry.traces[entry.traces.length - 1];

					// traces can be duplicated, e.g. by `snapshot` invoking both
					// both `getOwnPropertyDescriptor` and `get` traps at once
					if (trace.stack !== last?.stack) {
						entry.traces.push(trace);
					}
				}
			}
		}
	}

	if (is_destroying_effect) {
		// teardowns see the values from before the update; nothing read here is recorded
		if (old_values.has(signal)) {
			return old_values.get(signal);
		}

		if (is_derived) {
			var derived = /** @type {Derived} */ (signal);
			var value = derived.v;

			// if the derived is dirty and has reactions, or depends on the values that just changed, re-execute
			// (a derived can be maybe_dirty due to the effect destroy removing its last reaction)
			if (
				((derived.f & CLEAN) === 0 && derived.reactions !== null) ||
				depends_on_old_values(derived)
			) {
				value = execute_derived(derived);
			}

			old_values.set(derived, value);

			return value;
		}
	}

	/**
	 * The value (and version) as the active view of the world sees it, if it differs from the real
	 * world — for a derived, this is the derived itself if its global state applies (see `view_entry`)
	 * @type {{ v: any, wv: number, e?: boolean } | undefined}
	 */
	var view;

	if (is_derived) {
		derived = /** @type {Derived} */ (signal);

		// connect disconnected deriveds when reading them inside a connected reaction
		var should_connect =
			(derived.f & CONNECTED) === 0 &&
			!untracking &&
			active_reaction !== null &&
			(active_reaction.f & CONNECTED) !== 0;

		var is_new = (derived.f & REACTION_RAN) === 0;

		if (should_connect) {
			// set the flag before the derived is (re)evaluated, so that
			// it is added as a reaction to its dependencies
			derived.f |= CONNECTED;
		}

		if (batch_values !== null) {
			view = view_entry(derived);
		} else if (is_dirty(derived)) {
			update_derived(derived);
		}

		if (should_connect && !is_new) {
			unfreeze_derived_effects(derived);
			reconnect(derived);
		}
	} else if (batch_values !== null) {
		view = batch_values.get(signal);
	}

	if (late_reader !== null) {
		record_late_read(late_reader, signal, view === undefined ? signal.wv : view.wv);
	}

	if (view !== undefined && view !== signal) {
		// (only records of deriveds can have an error, see `update_record`)
		if (view.e) throw view.v;
		return view.v;
	}

	if ((signal.f & ERROR_VALUE) !== 0) {
		throw signal.v;
	}

	return signal.v;
}

/**
 * Record that `reaction` read `signal` (with the given version) after an `await`, i.e. after
 * its run — as part of the record of that run
 * @param {Reaction} reaction
 * @param {Value} signal
 * @param {number} version
 */
function record_late_read(reaction, signal, version) {
	var run = run_of(reaction);
	var deps = /** @type {Value[]} */ (run.deps);
	var dv = run.dv;

	if (dv === null) return;

	var i = deps.indexOf(signal);
	if (i === -1) i = deps.push(signal) - 1;

	if (i >= dv.length) {
		// move it next to the other values read by the run, so that `dv` lines up with the start of `deps`
		deps[i] = deps[dv.length];
		deps[dv.length] = signal;
		dv.push(version);
	}
}

/**
 * (Re)connect a disconnected derived, so that it is notified
 * of changes in `mark_reactions`
 * @param {Derived} derived
 */
function reconnect(derived) {
	derived.f |= CONNECTED;

	if (derived.deps === null) return;

	for (const dep of derived.deps) {
		var reactions = dep.reactions;

		if (reactions === null) {
			dep.reactions = [derived];
		} else if (!includes.call(reactions, derived)) {
			reactions.push(derived);
		}

		if ((dep.f & DERIVED) !== 0 && (dep.f & CONNECTED) === 0) {
			unfreeze_derived_effects(/** @type {Derived} */ (dep));
			reconnect(/** @type {Derived} */ (dep));
		}
	}
}

/** @param {Derived} derived */
function depends_on_old_values(derived) {
	if (derived.v === UNINITIALIZED) return true; // we don't know, so assume the worst
	if (derived.deps === null) return false;

	for (const dep of derived.deps) {
		if (old_values.has(dep)) {
			return true;
		}

		if ((dep.f & DERIVED) !== 0 && depends_on_old_values(/** @type {Derived} */ (dep))) {
			return true;
		}
	}

	return false;
}

/**
 * Like `get`, but checks for `undefined`. Used for `var` declarations because they can be accessed before being declared
 * @template V
 * @param {Value<V> | undefined} signal
 * @returns {V | undefined}
 */
export function safe_get(signal) {
	return signal && get(signal);
}

/**
 * When used inside a [`$derived`](https://svelte.dev/docs/svelte/$derived) or [`$effect`](https://svelte.dev/docs/svelte/$effect),
 * any state read inside `fn` will not be treated as a dependency.
 *
 * ```ts
 * $effect(() => {
 *   // this will run when `data` changes, but not when `time` changes
 *   save(data, {
 *     timestamp: untrack(() => time)
 *   });
 * });
 * ```
 * @template T
 * @param {() => T} fn
 * @returns {T}
 */
export function untrack(fn) {
	var previous_untracking = untracking;
	try {
		untracking = true;
		return fn();
	} finally {
		untracking = previous_untracking;
	}
}

/**
 * Possibly traverse an object and read all its properties so that they're all reactive in case this is `$state`.
 * Does only check first level of an object for performance reasons (heuristic should be good for 99% of all cases).
 * @param {any} value
 * @returns {void}
 */
export function deep_read_state(value) {
	if (typeof value !== 'object' || !value || value instanceof EventTarget) {
		return;
	}

	if (STATE_SYMBOL in value) {
		deep_read(value);
	} else if (!Array.isArray(value)) {
		for (let key in value) {
			const prop = value[key];
			if (typeof prop === 'object' && prop && STATE_SYMBOL in prop) {
				deep_read(prop);
			}
		}
	}
}

/**
 * Deeply traverse an object and read all its properties
 * so that they're all reactive in case this is `$state`
 * @param {any} value
 * @param {Set<any>} visited
 * @returns {void}
 */
export function deep_read(value, visited = new Set()) {
	if (
		typeof value === 'object' &&
		value !== null &&
		// We don't want to traverse DOM elements
		!(value instanceof EventTarget) &&
		!visited.has(value)
	) {
		visited.add(value);
		// When working with a possible SvelteDate, this
		// will ensure we capture changes to it.
		if (value instanceof Date) {
			value.getTime();
		}
		for (let key in value) {
			try {
				deep_read(value[key], visited);
			} catch (e) {
				// continue
			}
		}
		const proto = get_prototype_of(value);
		if (
			proto !== Object.prototype &&
			proto !== Array.prototype &&
			proto !== Map.prototype &&
			proto !== Set.prototype &&
			proto !== Date.prototype
		) {
			const descriptors = get_descriptors(proto);
			for (let key in descriptors) {
				const get = descriptors[key].get;
				if (get) {
					try {
						get.call(value);
					} catch (e) {
						// continue
					}
				}
			}
		}
	}
}
