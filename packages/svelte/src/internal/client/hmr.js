import { block, branch, pause_effect } from './reactivity/effects';
import { set, source } from './reactivity/sources';
import { get } from './runtime';

/**
 * @param {{ component: import("#client").Source<(anchor: Comment, props: any) => any>; wrapper: (anchor: Comment, props: any) => any; }} data
 * @param {(anchor: Comment, props: any) => any} new_component
 */
export function hmr(data, new_component) {
	debugger;
	let prev_component = data.component;

	if (prev_component === undefined) {
		prev_component = data.component = source(new_component);
	} else {
		set(prev_component, new_component);
		return data.wrapper;
	}

	const wrapper = (/** @type {Comment} */ anchor, /** @type {any} */ props) => {
		let output;
		/**
		 * @type {import("#client").Effect}
		 */
		let effect;

		block(() => {
			const component = get(data.component);

			if (effect) {
				pause_effect(effect);
			}

			effect = branch(() => {
				output = component(anchor, props);
			});
		});

		return output;
	};

	data.wrapper = wrapper;

	return wrapper;
}
