import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";

export default function Class_state_field_constructor_assignment($$anchor, $$props) {
	$.push($$props, true);

	class Foo {
		#a = $.state();

		get a() {
			return $.get(this.#a);
		}

		set a(value) {
			$.set(this.#a, $.proxy(value));
		}

		#b = $.state();

		constructor() {
			this.a = 1;
			this.#b.v = 2;
		}
	}

	$.pop();
}