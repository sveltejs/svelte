/** @import { Renderer, RendererNodes } from "./types.js" */

/**
 * Creates a custom renderer. Pass the types of the renderer's nodes as the type argument,
 * so that the methods' parameters are typed:
 *
 * ```ts
 * const renderer = createRenderer<{ fragment: MyFragment; element: MyElement; text: MyText; comment: MyComment }>({
 * 	createFragment: () => ...,
 * 	// ...
 * });
 * ```
 *
 * The renderer is returned as-is.
 * @template {RendererNodes} [N=RendererNodes]
 * @template {Renderer<N>} [R=Renderer<N>]
 * @param {R} renderer
 * @returns {R}
 */
export function createRenderer(renderer) {
	return renderer;
}
