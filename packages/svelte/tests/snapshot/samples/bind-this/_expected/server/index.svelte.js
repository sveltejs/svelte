import * as $ from 'svelte/internal/server';

export default function Bind_this($$payload) {
	const $$cleanup = $.setup($$payload);

	Foo($$payload, {});
	$$cleanup($$payload);
}