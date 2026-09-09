import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { untrack as read_untracked } from 'svelte';
import * as svelte from 'svelte';
import Component from './Component.svelte';

var root = $.from_html(`<button>inline</button> <button>named</button> <button>blur</button> <button>focusout</button> <button>spread</button> <!> <button>mixed</button> <!>`, 1);

export default function Props_retained_analysis($$anchor, $$props) {
	$.push($$props, true);

	let unsafe_blur = $.prop($$props, 'unsafe_blur', 35),
		unsafe_focusout = $.prop($$props, 'unsafe_focusout', 35),
		unsafe_component_event = $.prop($$props, 'unsafe_component_event', 35),
		unsafe_spread_event = $.prop($$props, 'unsafe_spread_event', 35),
		unsafe_local_untrack = $.prop($$props, 'unsafe_local_untrack', 35),
		unsafe_mixed_event = $.prop($$props, 'unsafe_mixed_event', 35);

	read_untracked(() => $$props.safe_untrack);
	svelte.untrack(() => $$props.safe_namespace_untrack);

	const handle_click = () => $$props.safe_named_event;
	const handle_blur = () => unsafe_blur();
	const handle_focusout = () => unsafe_focusout();
	const handle_component_event = () => unsafe_component_event();
	const handle_mixed_event = () => unsafe_mixed_event();

	function untrack(fn) {
		fn();
	}

	untrack(() => unsafe_local_untrack());

	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);
	var button_4 = $.sibling(button_3, 2);

	$.attribute_effect(button_4, () => ({ ...{ onclick: () => unsafe_spread_event() } }));

	var node = $.sibling(button_4, 2);

	Component(node, { onclick: handle_component_event });

	var button_5 = $.sibling(node, 2);
	var node_1 = $.sibling(button_5, 2);

	Component(node_1, { onclick: handle_mixed_event });
	$.delegated('click', button, () => $$props.safe_inline_event);
	$.delegated('click', button_1, handle_click);
	$.event('blur', button_2, handle_blur);
	$.delegated('focusout', button_3, handle_focusout);
	$.delegated('click', button_5, handle_mixed_event);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'focusout']);