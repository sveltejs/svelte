import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/legacy';
import * as $ from 'svelte/internal/client';

export default function Bind_this($$anchor) {
	const $$cleanup = $.setup();

	$.bind_this(Foo($$anchor, { $$legacy: true }), ($$value) => foo = $$value, () => foo);
	$$cleanup();
}