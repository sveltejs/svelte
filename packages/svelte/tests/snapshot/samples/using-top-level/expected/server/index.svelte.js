Using_top_level[$.FILENAME] = 'packages/svelte/tests/snapshot/samples/using-top-level/index.svelte';

import * as $ from 'svelte/internal/server';

function Using_top_level($$payload, $$props) {
	$.push(Using_top_level);

	let { message } = $$props;

	using x = {
		message,
		[Symbol.dispose]() {
			console.log(`disposing ${message}`);
		}
	};

	$$payload.out += `<p>`;
	$.push_element($$payload, 'p', 12, 0);
	$$payload.out += `${$.escape(x.message)}</p>`;
	$.pop_element();
	$.pop();
}

Using_top_level.render = function () {
	throw new Error('Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information');
};

export default Using_top_level;