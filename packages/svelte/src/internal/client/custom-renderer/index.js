/** @import { Renderer, RendererNodes, DefaultNodes } from "./types.js" */

/**
 * @template {RendererNodes<object, object, object, object>} [T=DefaultNodes]
 * @template {object} [TFragment=T extends DefaultNodes ? object : T['fragment']]
 * @template {object} [TElement=T extends DefaultNodes ? object : T['element']]
 * @template {object} [TTextNode=T extends DefaultNodes ? object : T['text']]
 * @template {object} [TComment=T extends DefaultNodes ? object : T['comment']]
 * @param {Renderer<TFragment, TElement, TTextNode, TComment>} renderer
 * @returns {Renderer<TFragment, TElement, TTextNode, TComment>}
 */
export function createRenderer(renderer) {
	return renderer;
}
