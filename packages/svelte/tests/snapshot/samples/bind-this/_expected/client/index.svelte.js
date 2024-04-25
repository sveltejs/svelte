import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";

export default function Bind_this($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.bind_this(Foo(node, {}), ($$value) => foo = $$value, () => foo);
	$.append($$anchor, fragment);
}