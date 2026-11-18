import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const cleanup = () => {};

		;;

		function current() {
			return (/* @__PURE__ */ Object.create(null));
		}

		$$renderer.push(`<button>${$.escape(current())}</button>`);
	});
}