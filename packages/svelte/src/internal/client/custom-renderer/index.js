/** @import { ComponentContext } from '#client' */
/** @import { Component, ComponentType, SvelteComponent } from '../../../index.js' */
import { boundary } from '../dom/blocks/boundary.js';
import { branch, effect_root } from '../reactivity/effects.js';
import { push, pop, component_context } from '../context.js';
import { push_renderer } from './state.js';

/**
 * @template {object} [TFragment=object]
 * @template {object} [TElement=object]
 * @template {object} [TTextNode=object]
 * @template {object} [TComment=object]
 * @template [TNode=TFragment | TElement | TTextNode | TComment]
 * @typedef {Object} Renderer
 * @property {()=>TFragment} createFragment - Creates a fragment, a container for multiple nodes. Inserting a fragment should insert all of it's children.
 * @property {(name: string)=>TElement} createElement - Creates an element with the given name.
 * @property {(data: string)=>TTextNode} createTextNode - Creates a text node with the given data.
 * @property {(data: string)=>TComment} createComment - Creates a comment node with the given data. This is often used as an anchor for inserting elements, it doesn't necessarily need to be rendered
 * @property {(node: TNode)=> "fragment" | "element" | "text" | "comment"} nodeType - Should return the type of the node in string form ("fragment", "element", "text", "comment").
 * @property {(node: TNode)=>string | null} getNodeValue - Return the value of the node...this should be the text value of a text node, the data value of a comment, null for elements and fragments
 * @property {(element: TElement, name: string)=>string | null} getAttribute - Return the value of the attribute with the given name on the element, or null if it doesn't exist
 * @property {(element: TElement, key: string, value: any)=>void} setAttribute - Set the attribute with the given name and value on the element
 * @property {(element: TElement, name: string)=>void} removeAttribute - Remove the attribute with the given name from the element
 * @property {(element: TElement, name: string)=>boolean} hasAttribute - Return true if the element has an attribute with the given name
 * @property {(node: TNode, text: string)=>void} setText - Set the text content of the node to the given value. This should work for both text nodes and elements (setting text content on an element should replace all of it's children with a single text node)
 * @property {(element: TElement | TFragment)=>TNode | null} getFirstChild - Return the first child of the element, or null if it has no children. This should work for both elements and fragments
 * @property {(element: TElement | TFragment)=>TNode | null} getLastChild - Return the last child of the element, or null if it has no children. This should work for both elements and fragments
 * @property {(element: TNode)=>TNode | null} getNextSibling - Return the next sibling of the node, or null if it has no next sibling
 * @property {(parent: TElement | TFragment, element: TNode, anchor: TNode | null)=>void} insert - Insert the element into the parent before the anchor (if the anchor is null, insert at the end). This should work for both elements and fragments as parents
 * @property {(node: TNode)=>void} remove - Remove the node from the tree
 * @property {(element: TNode)=>TNode | null} getParent - Return the parent of the element, or null if it has no parent
 * @property {(target: TNode, type: string, handler: any, options?: any)=>void} addEventListener - Add an event listener of the given type and handler to the target node, with optional options
 * @property {(target: TNode, type: string, handler: any, options?: any)=>void} removeEventListener - Remove an event listener of the given type and handler from the target node, with optional options
 */

/**
 * @template {object} [TFragment=object]
 * @template {object} [TElement=object]
 * @template {object} [TTextNode=object]
 * @template {object} [TComment=object]
 * @param {Renderer<TFragment, TElement, TTextNode, TComment>} renderer
 * @returns {Renderer<TFragment, TElement, TTextNode, TComment> & { render: <Props extends Record<string, any>>(component: ComponentType<SvelteComponent<Props>> | Component<Props, any, any>, options: {} extends Props ? { target: TFragment | TElement | TTextNode | TComment, props?: Props, context?: Map<any, any> } : { target: TFragment | TElement | TTextNode | TComment, props: Props, context?: Map<any, any> }) => () => void }}
 */
export function createRenderer(renderer) {
	return {
		...renderer,
		/**
		 * @template {Record<string, any>} Props
		 * @param {ComponentType<SvelteComponent<Props>> | Component<Props, any, any>} Component
		 * @param {{} extends Props ? { target: TFragment | TElement | TTextNode | TComment, props?: Props, context?: Map<any, any> } : { target: TFragment | TElement | TTextNode | TComment, props: Props, context?: Map<any, any> }} options
		 */
		render(Component, { target, props, context }) {
			var cleanup = push_renderer(renderer);
			try {
				const unmount = effect_root(() => {
					var anchor = renderer.createComment('');
					renderer.insert(/** @type {*} */ (target), anchor, null);
					boundary(/** @type {*} */ (anchor), { pending: () => {} }, (anchor) => {
						push({});
						var ctx = /** @type {ComponentContext} */ (component_context);
						if (context) ctx.c = context;
						branch(() => {
							/** @type {Function} */ (Component)(anchor, props);
						});
						pop();
					});
				});
				return unmount;
			} finally {
				cleanup();
			}
		}
	};
}
