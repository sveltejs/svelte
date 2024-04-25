import * as $ from "svelte/internal/server";

export default function Class_state_field_constructor_assignment($$payload, $$props) {
	$.push(true);

	class Foo {
		a;
		#b;

		constructor() {
			this.a = 1;
			this.#b = 2;
		}
	}

	$.pop();
}