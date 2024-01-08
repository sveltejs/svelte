import { key, comment } from './render.js';
import { source, set, get } from './runtime.js';
import { current_hydration_fragment } from './hydration.js';
import { child_frag } from './operations.js';

function find_surrounding_ssr_commments() {
	if (!current_hydration_fragment?.[0]) return null;

	/** @type {Comment | undefined} */
	let before;
	/** @type {Comment | undefined} */
	let after;
	/** @type {Node | null | undefined} */
	let node;

	node = current_hydration_fragment[0].previousSibling;
	while (node) {
		const comment = /** @type {Comment} */ (node);
		if (node.nodeType === 8 && comment.data.startsWith('ssr:')) {
			before = comment;
			break;
		}
		node = node.previousSibling;
	}

	node = current_hydration_fragment.at(-1)?.nextSibling;
	while (node) {
		const comment = /** @type {Comment} */ (node);
		if (node.nodeType === 8 && comment.data.startsWith('ssr:')) {
			after = comment;
			break;
		}
		node = node.nextSibling;
	}

	if (before && after && before.data === after.data) {
		return [before, after];
	}

	return null;
}

/**
 * @template {any[]} ComponentArgs
 * @template {Record<string | symbol, any> | undefined} ComponentReturn
 * @template {(...args: ComponentArgs) => ComponentReturn} Component
 *
 * @param {{
 *    component_signal: ReturnType<typeof source<Component>>,
 *    proxy?: (...args: ComponentArgs) => ComponentReturn
 * }} hot_data
 * @param {Component} new_component
 */
export function hmr(hot_data, new_component) {
	if (hot_data.proxy) {
		set(hot_data.component_signal, new_component);
	} else {
		const component_signal = source(new_component);

		hot_data.component_signal = component_signal;

		// @ts-ignore
		hot_data.proxy = function ($$anchor, ...args) {
			let accessors = /** @type {ComponentReturn} */ ({});

			// During hydration the root component will receive a null $$anchor. The
			// following is a hack to get our `key` a node to render to, all while
			// avoiding it to "consume" the SSR marker.
			// TODO better get the eyes of someone with understanding of hydration on this
			if (!$$anchor && current_hydration_fragment?.[0]) {
				const ssr0 = find_surrounding_ssr_commments();
				if (ssr0) {
					const [before, after] = ssr0;
					current_hydration_fragment.unshift(before);
					current_hydration_fragment.push(after);
					$$anchor = child_frag(current_hydration_fragment);
				}
			}

			key(
				$$anchor,
				() => get(component_signal),
				($$anchor) => {
					const component = get(component_signal);
					// @ts-ignore
					accessors = component($$anchor, ...args);
				}
			);

			return new Proxy(
				{},
				{
					get(_, p) {
						return accessors?.[p];
					},
					set(_, p, value) {
						// @ts-ignore (we actually want to crash on undefined, like non HMR code would do)
						accessors[p] = value;
						return true;
					}
				}
			);
		};
	}

	return hot_data.proxy;
}
