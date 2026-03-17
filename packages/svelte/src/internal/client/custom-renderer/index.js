import { branch, effect_root } from "../reactivity/effects";
import { push_renderer } from "./state";

/**
 * @param {*} renderer
 * @returns
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