Devtools_dev_output[$.FILENAME] = 'packages/svelte/tests/snapshot/samples/devtools-dev-output/index.svelte';

import * as $ from 'svelte/internal/server';
import { counter } from './state.svelte.js';

function Devtools_dev_output($$renderer, $$props) {
	$$renderer.component(
		($$renderer) => {
			let count = 0;
			let doubled = $.derived(() => count * 2);
			const todo = { done: false };

			$$renderer.push(`<button>`);
			$.push_element($$renderer, 'button', 17, 0);
			$$renderer.push(`${$.escape(count)} ${$.escape(doubled())} ${$.escape(todo.done)} ${$.escape(counter.value)}</button>`);
			$.pop_element();
		},
		Devtools_dev_output
	);
}

Devtools_dev_output.render = function () {
	throw new Error('Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information');
};

export default Devtools_dev_output;