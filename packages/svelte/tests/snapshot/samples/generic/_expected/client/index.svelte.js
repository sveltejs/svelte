import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/legacy';
import * as $ from 'svelte/internal/client';

export default function Generic($$anchor, $$props) {
	$.push($$props, false);

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

	$.init();
	$.pop();
}