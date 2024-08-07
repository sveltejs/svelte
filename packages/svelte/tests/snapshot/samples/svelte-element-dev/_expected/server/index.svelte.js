Svelte_element_dev[$.FILENAME] = "packages/svelte/tests/snapshot/samples/svelte-element-dev/index.svelte";

import * as $ from "svelte/internal/server";

function Svelte_element_dev($$payload, $$props) {
	$.push(Svelte_element_dev);

	let { tag = 'hr' } = $$props;

	$.validate_dynamic_element_tag(() => tag);
	$.push_element($$payload, tag);
	$.element($$payload, tag);
	$.pop_element();
	$.pop();
}

Svelte_element_dev.render = function () {
	throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte-5-preview.vercel.app/docs/breaking-changes#components-are-no-longer-classes for more information");
};

export default Svelte_element_dev;