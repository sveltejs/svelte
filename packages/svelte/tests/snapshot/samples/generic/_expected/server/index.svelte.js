import * as $ from 'svelte/internal/server';

export default function Generic($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class GenericBase {
			value;

			constructor(value) {
				this.value = value;
			}
		}

		class Subclass extends GenericBase {
			constructor(value) {
				super(value);
			}
		}
	});
}