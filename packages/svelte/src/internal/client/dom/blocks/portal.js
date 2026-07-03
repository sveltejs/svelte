/** @import { Effect, Source, TemplateNode } from '#client' */
/** @import { Batch } from '../../reactivity/batch.js' */
import { DESTROYED, DESTROYING, HEAD_EFFECT } from '#client/constants';
import { capture } from '../../reactivity/async.js';
import { current_batch } from '../../reactivity/batch.js';
import {
	block,
	branch,
	destroy_effect,
	move_effect,
	render_effect
} from '../../reactivity/effects.js';
import { set, source } from '../../reactivity/sources.js';
import { active_effect, get, untrack } from '../../runtime.js';
import {
	hydrate_next,
	hydrate_node,
	hydrating,
	set_hydrate_node,
	set_hydrating,
	skip_nodes
} from '../hydration.js';
import { create_text, get_next_sibling, should_defer_append } from '../operations.js';
import { queue_micro_task } from '../task.js';

/**
 * A branch of a `{#portal ...}` block, rendered into a single target.
 * While the branch is offscreen (its insertion is deferred until a batch
 * commits), `fragment` contains its DOM, otherwise it is `null`.
 * @typedef {{ effect: Effect, fragment: DocumentFragment | null }} PortalBranch
 */

/**
 * Represents a `{@portal ...}` outlet.
 * - `anchor` is the node portaled content is inserted before
 * - `claim` is only used during hydration — it is the position of the last
 *   server-rendered portal content that was claimed by a `{#portal ...}` block
 * - `items` tracks the content of the portals currently rendered into this outlet
 *   (ordered by portal creation order), so that content of portals that are created
 *   (or committed) out of order can be inserted at the right position
 * @typedef {{
 *   anchor: TemplateNode,
 *   claim: TemplateNode | null,
 *   items: Array<{ seq: number, branch: PortalBranch }>
 * }} Outlet
 */

/**
 * All known outlets (and portals waiting for outlets) for a given key.
 * `pending` is only used during hydration — it contains render functions of
 * `{#portal ...}` blocks that were created before their outlet, so that the
 * outlet can have them claim their server-rendered content upon initialisation.
 * @typedef {{
 *   outlets: Source<Outlet[]>,
 *   pending: Set<(outlet: Outlet) => void>
 * }} OutletEntry
 */

/** @type {Map<any, OutletEntry>} */
const outlet_map = new Map();

/**
 * Monotonically increasing sequence number, used to keep content of multiple
 * portals targeting the same outlet in creation order
 */
let portal_seq = 0;

/**
 * @param {any} key
 * @returns {OutletEntry}
 */
function get_outlet_entry(key) {
	let entry = outlet_map.get(key);

	if (entry === undefined) {
		entry = { outlets: source([]), pending: new Set() };
		outlet_map.set(key, entry);
	}

	return entry;
}

/**
 * Run `fn` now (during hydration, where synchronous timing is required for
 * claiming server-rendered content), or in a microtask otherwise. The latter
 * ensures that outlet (un)registrations - which can happen while a batch is
 * being committed - do not interfere with the commit by scheduling portal
 * updates (which would happen in a new batch) at the wrong moment.
 * @param {() => void} fn
 */
function run_outside_batch(fn) {
	if (hydrating) {
		fn();
	} else {
		// TODO this is a hack to get around a (I think) general batch.js bug
		// where setting state while flushing (render) effects can mess with
		// #commit() of the earlier batch that runs afterwards, where roots
		// would not be scheduled for other batches anymore because scheduling
		// an effect might reach a branch that is already unclean, so scheduling
		// thinks "oh we already have this root scheduled" (wrong because not in the context of that batch).
		queue_micro_task(fn);
	}
}

/**
 * Returns the node before which the content of a portal with the given
 * sequence number must be inserted, so that the contents of multiple portals
 * appear in the order in which the portals were created
 * @param {Outlet} outlet
 * @param {number} seq
 * @returns {TemplateNode}
 */
function get_insertion_anchor(outlet, seq) {
	var items = outlet.items;

	// prune branches that were destroyed or moved offscreen
	for (var i = items.length - 1; i >= 0; i -= 1) {
		var { effect, fragment } = items[i].branch;

		if ((effect.f & (DESTROYED | DESTROYING)) !== 0 || effect.nodes === null || fragment !== null) {
			items.splice(i, 1);
		}
	}

	for (var item of items) {
		if (item.seq > seq) {
			return /** @type {TemplateNode} */ (item.branch.effect.nodes?.start);
		}
	}

	return outlet.anchor;
}

/**
 * Registers a rendered portal branch with an outlet, keeping `outlet.items` ordered
 * @param {Outlet} outlet
 * @param {number} seq
 * @param {PortalBranch} branch
 */
function register_branch(outlet, seq, branch) {
	var items = outlet.items;
	var index = items.findIndex((item) => item.seq > seq);

	if (index === -1) {
		items.push({ seq, branch });
	} else {
		items.splice(index, 0, { seq, branch });
	}
}

/**
 * @param {TemplateNode} node
 * @param {() => any} get_id
 * @returns {void}
 */
export function portal_outlet(node, get_id) {
	var anchor = node;

	if (hydrating) {
		// `node` is the `<!--[-->` comment — advance to the `<!--portal:N-->` marker.
		// Server-rendered content of `{#portal ...}` blocks comes right after it
		// and is claimed by the corresponding blocks during hydration
		anchor = hydrate_next();
	}

	/** @type {Outlet} */
	var outlet = { anchor, claim: hydrating ? anchor : null, items: [] };

	// TODO this should be a block effect so it runs during traversal. The way it's right now
	// it means that a #portal block with async work will have that async work not coordinated
	// if it's instantiated through this @portal for the first time.
	render_effect(() => {
		const id = get_id();
		if (id == null) return;

		const entry = get_outlet_entry(id);

		var registered = false;
		var cancelled = false;

		const register = () => {
			if (cancelled) return;
			registered = true;

			set(
				entry.outlets,
				untrack(() => [...get(entry.outlets), outlet])
			);

			// during hydration, portals that were created before this outlet claim
			// their server-rendered content now, while the hydration position is known
			for (const render of entry.pending) {
				render(outlet);
			}
		};

		const unregister = () => {
			cancelled = true;
			if (!registered) return;

			set(
				entry.outlets,
				untrack(() => get(entry.outlets).filter((o) => o !== outlet))
			);
		};

		run_outside_batch(register);

		return () => run_outside_batch(unregister);
	});

	if (hydrating) {
		// move past the (claimed) server-rendered portal contents to the
		// closing `<!--]-->` comment, which becomes the outlet anchor.
		// Portals that appear later in the markup claim their server-rendered
		// content through `outlet.claim`.
		var close = skip_nodes(false);

		outlet.anchor = close;

		set_hydrate_node(close);
	}
}

/**
 * @param {() => any} get_target
 * @param {(anchor: TemplateNode) => void} content
 * @returns {void}
 */
export function portal(get_target, content) {
	var seq = portal_seq++;

	/**
	 * Branches that are currently in the DOM, keyed by target
	 * (an {@link Outlet}, or an element in case of `{#portal some_dom_node}`).
	 * Since a portal renders into every outlet with a matching key,
	 * there can be multiple branches at any given time
	 * @type {Map<Outlet | Element, PortalBranch>}
	 */
	var onscreen = new Map();

	/**
	 * Branches that are rendered into a `DocumentFragment` because their
	 * insertion is deferred until their batch commits, keyed by target
	 * @type {Map<Outlet | Element, PortalBranch>}
	 */
	var offscreen = new Map();

	/**
	 * The target (outlet key or element) and resolved targets each in-flight
	 * batch wants this portal to render into. An entry is only removed once
	 * its batch commits or is discarded
	 * @type {Map<Batch, { target: any, targets: Set<Outlet | Element> }>}
	 */
	var batches = new Map();

	/** @type {Effect} */
	var self;

	/**
	 * Creates a branch for the given target, either directly in the DOM
	 * (claiming server-rendered content, if it exists) or offscreen
	 * @param {Outlet | Element} target
	 * @param {boolean} offscreen_render
	 */
	function create_branch(target, offscreen_render) {
		var outlet = target instanceof Element ? null : target;

		/** @type {PortalBranch} */
		var portal_branch = { effect: /** @type {any} */ (null), fragment: null };

		if (hydrating && outlet !== null && outlet.claim !== null && !offscreen_render) {
			// claim the server-rendered content, which sits after the previously
			// claimed content (or after the `<!--portal:N-->` marker)
			var previous_hydrate_node = hydrate_node;
			var start = /** @type {TemplateNode} */ (get_next_sibling(outlet.claim));

			set_hydrate_node(start);

			var effect = branch(() => content(start));

			// the trailing `<!---->` of this portal's server-rendered chunk
			// becomes the branch's personal anchor
			var anchor = hydrate_node;

			if (effect.nodes === null) {
				effect.nodes = { start, end: anchor, a: null, t: null };
			} else {
				// make sure the whole chunk (including boundary comments) belongs
				// to the branch, so that it is moved/removed in its entirety
				effect.nodes.start = start;
				effect.nodes.end = anchor;
			}

			outlet.claim = anchor;

			set_hydrate_node(previous_hydrate_node);

			portal_branch.effect = effect;
			onscreen.set(target, portal_branch);
			register_branch(outlet, seq, portal_branch);
		} else {
			// render from scratch — content is created before a personal anchor,
			// which is part of the branch so it travels with it
			var was_hydrating = hydrating;
			if (was_hydrating) set_hydrating(false);

			var personal_anchor = create_text();

			try {
				if (offscreen_render) {
					var fragment = document.createDocumentFragment();
					fragment.append(personal_anchor);
					portal_branch.fragment = fragment;
				} else if (target instanceof Element) {
					target.appendChild(personal_anchor);
				} else {
					get_insertion_anchor(/** @type {Outlet} */ (outlet), seq).before(personal_anchor);
				}

				portal_branch.effect = branch(() => content(personal_anchor));
			} finally {
				if (was_hydrating) set_hydrating(true);
			}

			if (portal_branch.effect.nodes === null) {
				portal_branch.effect.nodes = {
					start: personal_anchor,
					end: personal_anchor,
					a: null,
					t: null
				};
			} else {
				// include the personal anchor in the effect's node range
				portal_branch.effect.nodes.end = personal_anchor;
			}

			if (offscreen_render) {
				offscreen.set(target, portal_branch);
			} else {
				onscreen.set(target, portal_branch);

				if (outlet !== null) {
					register_branch(outlet, seq, portal_branch);
				}
			}
		}

		// portaled DOM lives at the outlet, outside the node range of ancestor
		// effects — this flag ensures it is removed when the branch is destroyed,
		// even if an ancestor was already removed from the DOM
		portal_branch.effect.f |= HEAD_EFFECT;
	}

	/**
	 * Brings the DOM in line with the given target selection — inserts wanted
	 * offscreen branches, and removes deselected onscreen branches (moving them
	 * offscreen if another in-flight batch still needs them)
	 * @param {Set<Outlet | Element>} targets
	 */
	function apply(targets) {
		// move offscreen branches that were selected into the DOM
		for (var target of targets) {
			var portal_branch = offscreen.get(target);

			if (portal_branch !== undefined) {
				offscreen.delete(target);
				onscreen.set(target, portal_branch);

				var fragment = /** @type {DocumentFragment} */ (portal_branch.fragment);
				portal_branch.fragment = null;

				if (target instanceof Element) {
					target.appendChild(fragment);
				} else {
					get_insertion_anchor(target, seq).before(fragment);
					register_branch(target, seq, portal_branch);
				}
			}
		}

		// remove onscreen branches that were deselected...
		for (const [t, b] of onscreen) {
			if (targets.has(t)) continue;

			if (is_wanted(t)) {
				// ...unless another in-flight batch still needs the branch, in
				// which case it is moved offscreen rather than destroyed
				var f = document.createDocumentFragment();
				move_effect(b.effect, f);
				b.fragment = f;
				offscreen.set(t, b);
			} else {
				destroy_effect(b.effect);
			}

			onscreen.delete(t);
		}

		// destroy offscreen branches that no batch needs anymore
		for (const [t, b] of offscreen) {
			if (!targets.has(t) && !is_wanted(t)) {
				destroy_effect(b.effect);
				offscreen.delete(t);
			}
		}
	}

	/**
	 * True if an in-flight batch wants this portal to render into `target`
	 * @param {Outlet | Element} target
	 */
	function is_wanted(target) {
		for (const { targets } of batches.values()) {
			if (targets.has(target)) return true;
		}

		return false;
	}

	/**
	 * @param {Batch} batch
	 */
	function commit(batch) {
		// if this batch was made obsolete, or the portal was destroyed, bail
		if (!batches.has(batch) || (self.f & (DESTROYED | DESTROYING)) !== 0) return;

		var { target } = /** @type {{ target: any, targets: Set<Outlet | Element> }} */ (
			batches.get(batch)
		);

		remove(batch);

		// The outlets for this batch's key may have changed since the batch last
		// ran (an outlet can be (un)registered by another batch, without this
		// block necessarily re-running within this batch), so the target
		// selection is computed from the now-committed state
		/** @type {Set<Outlet | Element>} */
		var targets = new Set();

		if (target != null) {
			if (target instanceof Element) {
				targets.add(target);
			} else {
				for (var outlet of get_outlet_entry(target).outlets.v) {
					targets.add(outlet);
				}
			}
		}

		apply(targets);
	}

	/**
	 * Removes the bookkeeping of a batch that committed or was discarded,
	 * and of any batches that are no longer in-flight
	 * @param {Batch} batch
	 */
	function remove(batch) {
		batches.delete(batch);

		for (const b of batches.keys()) {
			if (!b.linked) batches.delete(b);
		}
	}

	/**
	 * @param {Batch} batch
	 */
	function discard(batch) {
		if ((self.f & (DESTROYED | DESTROYING)) !== 0) return;

		remove(batch);

		for (const [t, b] of offscreen) {
			if (!is_wanted(t)) {
				destroy_effect(b.effect);
				offscreen.delete(t);
			}
		}
	}

	block(() => {
		self = /** @type {Effect} */ (active_effect);

		var target = get_target();
		var batch = /** @type {Batch} */ (current_batch);
		var defer = should_defer_append();

		/** @type {Set<Outlet | Element>} */
		var targets = new Set();

		/** @type {(() => void) | undefined} */
		var teardown;

		/** the outlet key this run targets, if any */
		var key = target != null && !(target instanceof Element) ? target : null;

		// Register dependencies on the outlets of the current key, but also on those
		// of keys other in-flight batches are interested in. Otherwise, if this run
		// switches to a different key, changes to the other keys' outlets would no
		// longer re-run this block within those batches
		/** @type {Set<any>} */
		var keys = new Set();

		if (key != null) keys.add(key);

		for (const info of batches.values()) {
			if (info.target != null && !(info.target instanceof Element)) {
				keys.add(info.target);
			}
		}

		for (const k of keys) {
			var outlets = get(get_outlet_entry(k).outlets);

			if (k === key) {
				for (var outlet of outlets) {
					targets.add(outlet);
				}
			}
		}

		if (target != null) {
			if (target instanceof Element) {
				targets.add(target);
			} else if (hydrating) {
				// an outlet with our key may appear later during this hydration
				// pass (`{#portal ...}` before `{@portal ...}` in the markup).
				// Register a callback so it can have us claim our server-rendered
				// content at its position
				var entry = get_outlet_entry(target);
				var restore = capture();

				/** @param {Outlet} o */
				var render = (o) => {
					if ((self.f & (DESTROYED | DESTROYING)) !== 0) return;

					var previous = capture();
					restore(false);

					try {
						if (!onscreen.has(o) && !offscreen.has(o)) {
							create_branch(o, false);
						}
					} finally {
						previous(false);
					}
				};

				entry.pending.add(render);
				teardown = () => entry.pending.delete(render);
			}
		}

		for (var t of targets) {
			if (!onscreen.has(t) && !offscreen.has(t)) {
				create_branch(t, defer);
			}
		}

		batches.set(batch, { target, targets });

		// even if this batch's changes are applied right away, we need to know
		// when the batch is done, so that its bookkeeping can be removed
		batch.oncommit(commit);
		batch.ondiscard(discard);

		if (defer) {
			for (const [t, b] of onscreen) {
				if (targets.has(t)) {
					batch.unskip_effect(b.effect);
				} else {
					batch.skip_effect(b.effect);
				}
			}

			for (const [t, b] of offscreen) {
				if (targets.has(t)) {
					batch.unskip_effect(b.effect);
				} else {
					batch.skip_effect(b.effect);
				}
			}
		} else {
			apply(targets);
		}

		return teardown;
	});
}
