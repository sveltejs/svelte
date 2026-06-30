/** @import { Effect, EffectNodes, TemplateNode } from '#client' */
import { HYDRATION_END, HYDRATION_START, HYDRATION_START_ELSE } from '../../../../constants.js';
import { block, remove_effect_dom, render_effect } from '../../reactivity/effects.js';
import { active_effect, set_active_effect } from '../../runtime.js';
import { hydrate_next, hydrate_node, hydrating, set_hydrate_node, set_hydrating } from '../hydration.js';
import { get_next_sibling } from '../operations.js';

/**
 * @typedef {{ anchor: TemplateNode | undefined, pending: PendingPortal[] }} Portal
 * @typedef {{ owner: Effect, content: (anchor: TemplateNode) => void }} PendingPortal
 */

/** @type {Map<any, Portal>} */
const portals = new Map();

/**
 * @param {Portal} portal
 * @param {(anchor: TemplateNode) => void} content
 * @returns {void}
 */
function render_portal(portal, content) {
	let previous_hydrating = false;
	let previous_hydrate_node = null;

	let anchor = /** @type {TemplateNode} */ (portal.anchor);

	if (hydrating) {
		previous_hydrating = true;
		previous_hydrate_node = hydrate_node;
		set_hydrate_node((anchor = /** @type {TemplateNode} */ (get_next_sibling(anchor))));
	}

	const effect = block(() => {
		content(anchor);
		return () => {
			// The parent block will traverse all nodes in the current context, and then state that
			// child effects (like this one) don't need to traverse the nodes anymore because they
			// were already removed by the parent. That's not true in this case because the nodes
			// are somewhere else, so remove them "manually" here.
			const nodes = /** @type {EffectNodes} */ (effect.nodes);
			remove_effect_dom(nodes.start, /** @type {TemplateNode} */ (nodes.end));
		};
	});

	if (previous_hydrating) {
		portal.anchor = hydrate_node; // so that next portal block starts from the correct node
		set_hydrate_node(/** @type {TemplateNode} */ (previous_hydrate_node));
	}
}

/**
 * @param {TemplateNode} node
 * @param {any | (() => any)} id
 * @returns {void}
 */
export function portal_outlet(node, id) {
	var anchor = node;
	const get_id = typeof id === 'function' ? id : () => id;

	if (hydrating) {
		anchor = hydrate_next();
	}

	render_effect(() => {
		id = get_id();

		const portal = portals.get(id) ?? { anchor: undefined, pending: [] };
		portal.anchor = anchor;
		portals.set(id, portal);

		for (const pending of portal.pending) {
			const previous_effect = active_effect;
			set_active_effect(pending.owner);

			try {
				render_portal(portal, pending.content);
			} finally {
				set_active_effect(previous_effect);
			}
		}
		portal.pending.length = 0;

		return () => {
			portals.delete(id);
			// TODO what happens to rendered content, if there's still some? Remove? Error?
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
 * @param {any} target
 * @param {(anchor: TemplateNode) => void} content
 * @returns {void | (() => void)}
 */
export function portal(target, content) {
	if (target == null) return;

	const is_dom_node = target instanceof Element;
	/** @type {TemplateNode} */
	var anchor;
	if (is_dom_node) {
		let previous_hydrating = false;

		// Our rendering logic always prepends elements to the anchor. To not confuse users,
		// adjust the anchor such that the content is portaled _into_ the target.
		anchor = /** @type {TemplateNode} */ (/** @type {Element} */ (target).firstChild);
		if (!anchor) {
			target.appendChild((anchor = document.createTextNode('')));
		}

		if (hydrating) {
			previous_hydrating = true;
			// These are not SSR'd, so temporarily disable hydration to properly insert them
			set_hydrating(false);
		}

		const effect = block(() => {
			content(anchor);
			return () => {
				// The parent block will traverse all nodes in the current context, and then state that
				// child effects (like this one) don't need to traverse the nodes anymore because they
				// were already removed by the parent. That's not true in this case because the nodes
				// are somewhere else, so remove them "manually" here.
				const nodes = /** @type {EffectNodes} */ (effect.nodes);
				remove_effect_dom(nodes.start, /** @type {TemplateNode} */ (nodes.end));
			};
		});

		if (previous_hydrating) {
			set_hydrating(true);
		}
	} else {
		const portal = portals.get(target) ?? { anchor: undefined, pending: [] };
		portals.set(target, portal);

		if (portal.anchor === undefined) {
			const pending = { owner: /** @type {Effect} */ (active_effect), content };
			portal.pending.push(pending);

			return () => {
				const index = portal.pending.indexOf(pending);
				if (index !== -1) portal.pending.splice(index, 1);
			};
		}

		render_portal(portal, content);
	}
}
