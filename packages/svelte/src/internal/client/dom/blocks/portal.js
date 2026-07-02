/** @import { Effect, EffectNodes, Source, TemplateNode } from '#client' */
/** @import { Batch } from '../../reactivity/batch.js' */
import { DESTROYED, DESTROYING } from '#client/constants';
import { HYDRATION_END, HYDRATION_START, HYDRATION_START_ELSE } from '../../../../constants.js';
import { capture } from '../../reactivity/async.js';
import { current_batch } from '../../reactivity/batch.js';
import {
	block,
	branch,
	destroy_effect,
	move_effect,
	remove_effect_dom,
	render_effect
} from '../../reactivity/effects.js';
import { set, source } from '../../reactivity/sources.js';
import { active_effect, get, set_active_effect, untrack } from '../../runtime.js';
import {
	hydrate_next,
	hydrate_node,
	hydrating,
	set_hydrate_node,
	set_hydrating
} from '../hydration.js';
import { create_text, get_next_sibling, should_defer_append } from '../operations.js';
import { queue_micro_task } from '../task.js';

/**
 * @typedef {{ anchor: TemplateNode }} Outlet
 * @typedef {{ outlets: Source<Array<Outlet>>, pending: Set<(outlet: Outlet) => void> }} OutletEntry
 * @typedef {{ key: any, effect: Effect, fragment: DocumentFragment | null }} PortalBranch
 * @typedef {{ anchor: TemplateNode, outlet?: Outlet }} PortalTarget
 */

/** @type {Map<any, OutletEntry>} */
const outlet_map = new Map();

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
 * @param {TemplateNode} node
 * @param {() => any} get_id
 * @returns {void}
 */
export function portal_outlet(node, get_id) {
	var anchor = node;

	if (hydrating) {
		anchor = hydrate_next();
	}

	/** @type {Outlet} */
	var outlet = { anchor };

	render_effect(() => {
		const id = get_id();
		if (id == null) return;

		const entry = get_outlet_entry(id);
		const outlets = entry.outlets;

		set(
			outlets,
			untrack(() => [...get(outlets), outlet])
		);

		for (const render of entry.pending) {
			render(outlet);
		}

		return () => {
			set(
				outlets,
				untrack(() => get(outlets).filter((item) => item !== outlet))
			);
		};
	});

	if (hydrating) {
		let depth = 1;
		while (anchor !== null && depth > 0) {
			// TODO we have similar logic in other places, consolidate?
			anchor = /** @type {TemplateNode} */ (get_next_sibling(anchor));
			if (anchor?.nodeType === 8) {
				var comment = /** @type {Comment} */ (anchor).data;
				if (comment === HYDRATION_START || comment === HYDRATION_START_ELSE) depth += 1;
				else if (comment[0] === HYDRATION_END) depth -= 1;
			}
		}
		set_hydrate_node(anchor);
	}
}

/**
 * @param {() => any} get_target
 * @param {(anchor: TemplateNode) => void} content
 * @returns {void | (() => void)}
 */
export function portal(get_target, content) {
	// Portal targets are reconciled at batch boundaries. A target can disappear in one
	// pending batch and reappear in a later one, so effects are kept offscreen until we
	// know whether they are committed or discarded (similar to BranchManager).
	/** @type {Map<any, PortalBranch>} */
	let onscreen = new Map();
	/** @type {Map<any, PortalBranch>} */
	let offscreen = new Map();
	/** @type {Map<Batch, Map<any, PortalTarget>>} */
	let pending = new Map();
	/** @type {{ entry: OutletEntry, render: (outlet: Outlet) => void } | null} */
	let unrendered = null;

	/** @param {Map<any, PortalBranch>} portals */
	function destroy_portals(portals) {
		for (const portal of portals.values()) {
			destroy_effect(portal.effect);
		}

		portals.clear();
	}

	function clear_unrendered() {
		if (unrendered === null) return;

		const { entry, render } = unrendered;
		entry.pending.delete(render);
		unrendered = null;
	}

	/** @param {OutletEntry} entry */
	function set_unrendered(entry) {
		/** @type {(outlet: Outlet) => void} */
		const render = (outlet) => {
			const prev_context = capture();
			portal_context(false);

			try {
				const portal = create_portal(outlet, { anchor: outlet.anchor, outlet }, false);
				onscreen.set(outlet, portal);
			} finally {
				prev_context(false);
			}
		};

		entry.pending.add(render);
		unrendered = { entry, render };
	}

	/**
	 * @param {any} key
	 * @param {PortalTarget} target
	 * @param {boolean} offscreen
	 * @returns {PortalBranch}
	 */
	function create_portal(key, target, offscreen) {
		/** @type {DocumentFragment | null} */
		let fragment = null;
		let anchor = target.anchor;
		let previous_hydrating = false;
		let previous_hydrate_node = null;

		if (offscreen) {
			fragment = document.createDocumentFragment();
			anchor = create_text();
			fragment.append(anchor);

			if (hydrating) {
				// Offscreen branches are new client work, there's no SSR content to claim.
				previous_hydrating = true;
				set_hydrating(false);
			}
		} else if (hydrating) {
			if (target.outlet !== undefined) {
				// An outlet was discovered before this matching portal block. Preserve
				// the global hydration cursor while hydrating from the outlet's own anchor.
				previous_hydrating = true;
				previous_hydrate_node = hydrate_node;
				set_hydrate_node((anchor = /** @type {TemplateNode} */ (get_next_sibling(anchor))));
			} else {
				// This is a DOM portal, they are not SSR'd, so temporarily disable hydration to avoid claiming the wrong nodes.
				previous_hydrating = true;
				set_hydrating(false);
			}
		}

		/** @type {PortalBranch} */
		const portal = {
			key,
			effect: branch(() => {
				content(anchor);
				return () => {
					// The parent block will traverse all nodes in the current context, and then state that
					// child effects (like this one) don't need to traverse the nodes anymore because they
					// were already removed by the parent. That's not true in this case because the nodes
					// are somewhere else, so remove them "manually" here.
					const nodes = /** @type {EffectNodes} */ (portal.effect.nodes);
					remove_effect_dom(nodes.start, /** @type {TemplateNode} */ (nodes.end));
				};
			}),
			fragment
		};

		if (previous_hydrate_node !== null) {
			target.anchor = hydrate_node;
			// Future portal instances for this outlet must insert after the hydrated content,
			// not after the original outlet marker.
			/** @type {Outlet} */ (target.outlet).anchor = hydrate_node;
			set_hydrate_node(previous_hydrate_node);
		}

		if (previous_hydrating) {
			set_hydrating(true);
		}

		return portal;
	}

	/** @returns {Set<any>} */
	function get_future_keys() {
		// Pending newer batches determine whether an offscreen branch should be preserved.
		// This mirrors BranchManager's ability to keep a branch alive across discarded work.
		const keys = new Set();

		for (const targets of pending.values()) {
			for (const key of targets.keys()) {
				keys.add(key);
			}
		}

		return keys;
	}

	/** @param {Batch} batch */
	function discard(batch) {
		pending.delete(batch);
		const future_keys = get_future_keys();

		for (const [key, portal] of offscreen) {
			if (!future_keys.has(key)) {
				destroy_effect(portal.effect);
				offscreen.delete(key);
			}
		}
	}

	/** @param {Batch} batch */
	function commit(batch) {
		if ((effect.f & DESTROYED) !== 0) return;

		const targets = pending.get(batch);
		if (targets === undefined) return;

		for (const [b] of pending) {
			pending.delete(b);
			// keep values for newer batches
			if (b === batch) break;
		}

		const future_keys = get_future_keys();

		// Newly selected targets were rendered into a fragment if this batch was deferred,
		// move them into the real outlet/element now that the batch committed.
		for (const [key, target] of targets) {
			const portal = offscreen.get(key);

			if (portal !== undefined) {
				/** @type {TemplateNode} */ (portal.fragment?.lastChild).remove();
				target.anchor.before(/** @type {DocumentFragment} */ (portal.fragment));
				portal.fragment = null;
				offscreen.delete(key);
				onscreen.set(key, portal);
			}
		}

		for (const [key, portal] of onscreen) {
			if (targets.has(key)) continue;

			onscreen.delete(key);

			if (future_keys.has(key)) {
				// A newer pending batch wants this branch again. Move it out of the DOM instead
				// of destroying it so the later batch can commit without recreating it.
				const fragment = document.createDocumentFragment();
				move_effect(portal.effect, fragment);
				fragment.append(create_text());

				portal.fragment = fragment;
				offscreen.set(key, portal);
			} else {
				destroy_effect(portal.effect);
			}
		}

		for (const [key, portal] of offscreen) {
			if (targets.has(key) || future_keys.has(key)) continue;

			destroy_effect(portal.effect);
			offscreen.delete(key);
		}
	}

	/** @type {Effect} */
	let effect;

	/** @type {ReturnType<typeof capture>} */
	let portal_context;

	block(() => {
		effect = /** @type {Effect} */ (active_effect);
		portal_context = capture();

		const target = get_target();
		/** @type {Map<any, PortalTarget>} */
		const targets = new Map();

		if (target instanceof Element) {
			// Our rendering logic always prepends elements to the anchor. To not confuse users,
			// adjust the anchor such that the content is portaled _into_ the target.
			let anchor = /** @type {TemplateNode} */ (target.firstChild);
			if (!anchor) {
				target.appendChild((anchor = document.createTextNode('')));
			}

			targets.set(target, { anchor });
		} else if (target != null) {
			const entry = get_outlet_entry(target);
			const outlets_source = entry.outlets;
			const outlets = get(outlets_source);

			// We are adding pending portals to the entry, so that outlets can render them when they are discovered.
			set_unrendered(entry);

			for (const outlet of outlets) {
				targets.set(outlet, {
					anchor: outlet.anchor,
					outlet
				});
			}
		}

		const batch = /** @type {Batch} */ (current_batch);
		const defer = should_defer_append();

		// Ensure every target requested by this batch has a branch, but do not destroy
		// branches that are absent from this batch until commit/discard tells us whether
		// this batch actually wins.
		for (const [key, target] of targets) {
			let portal = onscreen.get(key) ?? offscreen.get(key);

			if (portal !== undefined) {
				if (defer) batch.unskip_effect(portal.effect);
			} else {
				portal = create_portal(key, target, defer && !(hydrating && target.outlet !== undefined));
				(portal.fragment !== null ? offscreen : onscreen).set(key, portal);
			}
		}

		pending.set(batch, targets);

		if (defer) {
			for (const [key, portal] of onscreen) {
				if (targets.has(key)) {
					batch.unskip_effect(portal.effect);
				} else {
					batch.skip_effect(portal.effect);
				}
			}

			for (const [key, portal] of offscreen) {
				if (targets.has(key)) {
					batch.unskip_effect(portal.effect);
				} else {
					batch.skip_effect(portal.effect);
				}
			}

			batch.oncommit(commit);
			batch.ondiscard(discard);
		} else {
			commit(batch);
		}

		return () => {
			clear_unrendered();

			if (/** @type {Effect} */ (effect).f & DESTROYING) {
				destroy_portals(onscreen);
				destroy_portals(offscreen);
				pending.clear();
			}
		};
	});
}
