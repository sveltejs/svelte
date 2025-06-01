import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Class_state_field_constructor_assignment($$anchor, $$props) {
	$.push($$props, true);

	class Foo {
		#a = $.state(0);

		get a() {
			return $.get(this.#a);
		}

		set a(value) {
			$.set(this.#a, value, true);
		}

		#b = $.state();
		#foo = $.derived(() => ({ bar: this.a * 2 }));

		get foo() {
			return $.get(this.#foo);
		}

		set foo(value) {
			$.set(this.#foo, value);
		}

		#bar = $.derived(() => ({ baz: this.foo }));

		get bar() {
			return $.get(this.#bar);
		}

		set bar(value) {
			$.set(this.#bar, value);
		}

		constructor() {
			this.a = 1;
			$.set(this.#b, 2);
			this.foo.bar = 3;
			this.bar = 4;
		}
	}

	$.pop();
}