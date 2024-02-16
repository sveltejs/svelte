// main.svelte (Svelte VERSION)
// Note: compiler output will change before 5.0 is released!
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal";
import { writable } from 'svelte/store';

var frag = $.template(`<div>Hello!</div> <div>Hello!</div>`, true);

export default function Main($$anchor, $$props) {
	$.push($$props, false);

	const $$subscriptions = {};

	$.unsubscribe_on_destroy($$subscriptions);

	const $animate = () => $.store_get(animate, "$animate", $$subscriptions);
	const animate = writable();

	$.init();

	/* Init */
	var fragment = $.open_frag($$anchor, true, frag);
	var div = $.child_frag(fragment);

	$.in(div, $animate, () => ({ duration: 750, x: 0, y: -200 }), false);

	var div_1 = $.sibling($.sibling(div, true));

	$.action(div_1, ($$node) => $animate()($$node));
	$.close_frag($$anchor, fragment);
	$.pop();
}