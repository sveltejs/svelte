/** @import { Renderer, RendererNodes } from "./types.js" */

/**
 * Creates a custom renderer.
 *
 * The types of the renderer's nodes are inferred from the return types of `createFragment`,
 * `createElement`, `createTextNode` and `createComment`, as long as those methods come before
 * the others. Alternatively, pass them as the type argument:
 *
 * ```ts
 * const renderer = createRenderer<{ fragment: MyFragment; element: MyElement; text: MyText; comment: MyComment }>({
 * 	// ...
 * });
 * ```
 *
 * Only the first type parameter is meant to be passed; the others exist so that the node types can be
 * inferred from the methods (TypeScript can't infer the record itself from them).
 * @template {RendererNodes} [N=RendererNodes]
 * @template {object} [TFragment=N['fragment']]
 * @template {object} [TElement=N['element']]
 * @template {object} [TText=N['text']]
 * @template {object} [TComment=N['comment']]
 * @param {Renderer<{ fragment: TFragment; element: TElement; text: TText; comment: TComment }>} renderer
 * @returns {Renderer<{ fragment: TFragment; element: TElement; text: TText; comment: TComment }>}
 */
export function createRenderer(renderer) {
	return renderer;
}
