import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Class_state_field_constructor_assignment($$anchor, $$props) {
	$.push($$props, true);

	class Foo {
		constructor() {
			this.a = 1;
			$.set(this.#b, 2);
		}

		#a = $.state();

		get a() {
			return $.get(this.#a);
		}

		set a(value) {
			$.set(this.#a, value, true);
		}

		#b = $.state();
	}

	$.pop();
}