// index.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal";

export default function Bind_this($$anchor, $$props) {
	$.push($$props, false);
	$.init();

	var fragment = $.comment($$anchor);
	var node = $.first_child(fragment);

	$.bind_this(Foo(node, {}), ($$value) => foo = $$value, () => foo);
	$.close_frag($$anchor, fragment);
	$.pop();
}