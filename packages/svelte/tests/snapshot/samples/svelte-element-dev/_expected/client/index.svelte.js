import "svelte/internal/disclose-version";

$.mark_module_start();
Svelte_element_dev[$.FILENAME] = "packages/svelte/tests/snapshot/samples/svelte-element-dev/index.svelte";

import * as $ from "svelte/internal/client";

export default function Svelte_element_dev($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Svelte_element_dev);
	$.validate_prop_bindings($$props, [], [], Svelte_element_dev);

	let tag = $.prop($$props, "tag", 3, 'hr');
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.validate_dynamic_element_tag(tag);
	$.element(node, tag, false, undefined, undefined, [5, 0]);
	$.append($$anchor, fragment);
	return $.pop({ ...$.legacy_api() });
}

$.mark_module_end(Svelte_element_dev);