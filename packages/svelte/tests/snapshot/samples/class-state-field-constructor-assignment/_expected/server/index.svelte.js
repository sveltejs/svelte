import * as $ from 'svelte/internal/server';

export default function Class_state_field_constructor_assignment($$payload, $$props) {
	$.push();

	class Foo {
		constructor() {
			this.a = 1;
			this.#b = 2;
		}

		a;
		#b;
	}

	$.pop();
}