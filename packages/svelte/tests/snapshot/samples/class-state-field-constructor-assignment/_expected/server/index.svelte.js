import * as $ from 'svelte/internal/server';

export default function Class_state_field_constructor_assignment($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Foo {
			a = 0;
			#b;
			#foo = $.derived(() => ({ bar: this.a * 2 }));

			get foo() {
				return this.#foo();
			}

			set foo($$value) {
				return this.#foo($$value);
			}

			#bar = $.derived(() => ({ baz: this.foo }));

			get bar() {
				return this.#bar();
			}

			set bar($$value) {
				return this.#bar($$value);
			}

			constructor() {
				this.a = 1;
				this.#b = 2;
				this.foo.bar = 3;
				this.bar = 4;
			}
		}
	});
}