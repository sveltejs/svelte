import * as $ from 'svelte/internal/server';

export default function Props_teardown_optimization($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			derived_prop,
			indirect_prop,
			function_prop,
			function_cleanup_prop,
			effect_prop,
			unknown_prop,
			cleanup_prop
		} = $$props;

		let doubled = $.derived(() => derived_prop * 2);
		let indirect = $.derived(() => indirect_prop);
		let read_function_prop = () => function_prop;
		let read_function_cleanup_prop = () => function_cleanup_prop;

		someFunction(() => unknown_prop);
		$$renderer.push(`<!---->${$.escape(doubled())}`);
	});
}