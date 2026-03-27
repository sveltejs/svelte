import { branch, effect_root } from '../reactivity/effects';
import { push_renderer } from './state';

/**
 * @template [TFragment=any]
 * @template [TElement=any]
 * @template [TTextNode=any]
 * @template [TComment=any]
 * @template [TNode=TElement | TTextNode | TComment | TFragment]
 * @typedef {Object} Renderer
 * @property {()=>TFragment} createFragment
 * @property {(name: string)=>TElement} createElement
 * @property {(data: string)=>TTextNode} createTextNode
 * @property {(element: TElement, key: string, value: any)=>void} setAttribute
 * @property {(node: TNode, text: string)=>void} setText
 * @property {(data: string)=>TComment} createComment
 * @property {(element: TNode)=>TNode} getFirstChild
 * @property {(element: TNode)=>TNode} getLastChild
 * @property {(element: TNode)=>TNode} getNextSibling
 * @property {(parent: TNode, element: TNode, anchor: TNode | null)=>void} insert
 * @property {(node: TNode)=>void} remove
 * @property {(element: TNode)=>TNode} getParent
 */

/**
 * @template [const TFragment=unknown]
 * @template [const TElement=unknown]
 * @template [const TTextNode=unknown]
 * @template [const TComment=unknown]
 * @param {Renderer<TFragment, TElement, TTextNode, TComment>} renderer
 * @returns {Renderer<TFragment, TElement, TTextNode, TComment> & { render: (Component: any, options: { target: TNode, props?: any }) => () => void }}
 */
export function createRenderer(renderer) {
	return {
		...renderer,
		/**
		 * @param {*} Component
		 * @param {*} options
		 */
		render(Component, { target, props }) {
			var cleanup = push_renderer(renderer);
			const unmount = effect_root(() => {
				var anchor = renderer.createComment('');
				renderer.insert(target, anchor, null);
				branch(() => {
					Component(anchor, props);
				});
			});
			cleanup();
			return unmount;
		}
	};
}
