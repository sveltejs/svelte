import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Props_teardown_optimization($$anchor, $$props) {
	$.push($$props, true);

	let doubled = $.derived(() => $$props.derived_prop * 2);
	let indirect = $.derived(() => $.get_prop_value($$props, 'indirect_prop'));
	let read_function_prop = () => $$props.function_prop;
	let read_function_cleanup_prop = () => $.get_prop_value($$props, 'function_cleanup_prop');

	$.user_effect(() => console.log($$props.effect_prop));
	$.user_effect(() => console.log(read_function_prop()));
	$.user_effect(() => () => console.log($.get_prop_value($$props, 'cleanup_prop')));
	$.user_effect(() => () => console.log($.get(indirect)));
	$.user_effect(() => () => console.log(read_function_cleanup_prop()));
	someFunction(() => $.get_prop_value($$props, 'unknown_prop'));
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, $.get(doubled)));
	$.append($$anchor, text);
	$.pop();
}