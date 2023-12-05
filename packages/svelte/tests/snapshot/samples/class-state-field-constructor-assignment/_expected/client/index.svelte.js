// index.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal";

export default function Class_state_field_constructor_assignment($$anchor, $$props) {
	$.push($$props, true);

	class Foo {
		#a = $.source();

		get a() {
			return $.get(this.#a);
		}

		set a(value) {
			$.set(this.#a, value);
		}

		#b = $.source();

		constructor() {
			this.#a.v = 1;
			this.#b.v = 2;
		}
	}

	$.pop();
}