/** @import { ComponentContext } from '#client' */
/** @import { AnyNode, Renderer, RendererNodes } from "./types.js" */
/** @import { Component, ComponentType, SvelteComponent } from '../../../index.js' */
import { boundary } from '../dom/blocks/boundary.js';
import { branch, effect_root } from '../reactivity/effects.js';
import { push, pop, component_context } from '../context.js';
import { push_renderer } from './state.js';
import { get_parent_node, remove_child } from '../dom/operations.js';

/**
 * @template {RendererNodes} T
 * @param {Renderer<T>} renderer
 * @returns {Renderer<T> & { render: <Props extends Record<string, any>, Exports extends Record<string, any>>(component: ComponentType<SvelteComponent<Props>> | Component<Props, Exports, any>, options: {} extends Props ? { target: AnyNode<T>, props?: Props, context?: Map<any, any> } : { target: AnyNode<T>, props: Props, context?: Map<any, any> }) => { component: Exports, unmount: () => void } }}
 */
export function createRenderer(renderer) {
	const compound_renderer = {
		...renderer,
		/**
		 * @template {Record<string, any>} Props
		 * @template {Record<string, any>} Exports
		 * @param {ComponentType<SvelteComponent<Props>> | Component<Props, Exports, any>} Component
		 * @param {{} extends Props ? { target: AnyNode<T>, props?: Props, context?: Map<any, any> } : { target: AnyNode<T>, props: Props, context?: Map<any, any> }} options
		 */
		render(Component, { target, props, context }) {
			var pop_renderer = push_renderer(compound_renderer);

			try {
				/** @type {Exports} */
				// @ts-expect-error will be defined because the render effect runs synchronously
				var component = undefined;

				const unmount = effect_root(() => {
					var anchor = compound_renderer.createComment('');
					compound_renderer.insert(/** @type {*} */ (target), anchor, null);
					boundary(/** @type {*} */ (anchor), { pending: () => {} }, (anchor) => {
						push({});
						var ctx = /** @type {ComponentContext} */ (component_context);
						if (context) ctx.c = context;
						branch(() => {
							component = /** @type {Function} */ (Component)(anchor, props ?? {}) || {};
						});
						pop();
					});

					return () => {
						var parent = get_parent_node(/** @type {*} */ (anchor));
						if (parent) remove_child(parent, /** @type {*} */ (anchor));
					};
				});
				return { component, unmount };
			} finally {
				pop_renderer();
			}
		}
	};
	return compound_renderer;
}
