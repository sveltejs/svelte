/** @import { Effect, EffectNodes, Source, TemplateNode } from '#client' */
/** @import { Batch } from '../../reactivity/batch.js' */
import { DESTROYED, DESTROYING } from '#client/constants';
import { HYDRATION_END, HYDRATION_START, HYDRATION_START_ELSE } from '../../../../constants.js';
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
import { active_effect, get, untrack } from '../../runtime.js';
import {
	hydrate_next,
	hydrate_node,
	hydrating,
	set_hydrate_node,
	set_hydrating
} from '../hydration.js';
import { create_text, get_next_sibling, should_defer_append } from '../operations.js';

/**
 * @typedef {{ anchor: TemplateNode, hydrate: boolean }} Outlet
 * @typedef {{ key: any, anchor: TemplateNode, effect: Effect, fragment: DocumentFragment | null }} PortalBranch
 * @typedef {{ anchor: TemplateNode, hydrate: boolean, client_only: boolean, outlet?: Outlet }} PortalTarget
 */

/** @type {Map<any, Source<Array<Outlet>>>} */
const outlet_map = new Map();

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
	var outlet = { anchor, hydrate: hydrating };

	render_effect(() => {
		const id = get_id();
		if (id == null) return;

		const outlets = outlet_map.get(id) ?? source([]);

		outlet_map.set(id, outlets);
		set(
			outlets,
			untrack(() => [...get(outlets), outlet])
		);

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

	/** @param {Map<any, PortalBranch>} portals */
	function destroy_portals(portals) {
		for (const portal of portals.values()) {
			destroy_effect(portal.effect);
		}

		portals.clear();
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
		} else if (target.hydrate) {
			// An outlet can be discovered before the matching portal block runs. Preserve
			// the global hydration cursor while hydrating from the outlet's own anchor.
			previous_hydrating = hydrating;
			previous_hydrate_node = hydrate_node;
			set_hydrating(true);
			set_hydrate_node((anchor = /** @type {TemplateNode} */ (get_next_sibling(anchor))));
		} else if (target.client_only && hydrating) {
			previous_hydrating = true;
			set_hydrating(false);
		}

		const portal = {
			key,
			anchor: target.anchor,
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
			portal.anchor = hydrate_node;
			target.anchor = hydrate_node;
			if (target.outlet !== undefined) {
				// Future portal instances for this outlet must insert after the hydrated content,
				// not after the original outlet marker.
				target.outlet.anchor = hydrate_node;
				target.outlet.hydrate = false;
			}
			set_hydrate_node(previous_hydrate_node);
		}

		if (previous_hydrating || target.hydrate) {
			set_hydrating(previous_hydrating);
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
				portal.anchor = target.anchor;
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

	block(() => {
		effect = /** @type {Effect} */ (active_effect);

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

			targets.set(target, { anchor, hydrate: false, client_only: true });
		} else if (target != null) {
			const outlets_source = outlet_map.get(target) ?? source([]);
			outlet_map.set(target, outlets_source);

			for (const outlet of get(outlets_source)) {
				targets.set(outlet, {
					anchor: outlet.anchor,
					hydrate: outlet.hydrate,
					client_only: false,
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
				portal.anchor = target.anchor;
				if (defer) batch.unskip_effect(portal.effect);
			} else {
				portal = create_portal(key, target, defer && !target.hydrate);
				(defer && !target.hydrate ? offscreen : onscreen).set(key, portal);
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
			if (/** @type {Effect} */ (effect).f & DESTROYING) {
				destroy_portals(onscreen);
				destroy_portals(offscreen);
				pending.clear();
			}
		};
	});
}
