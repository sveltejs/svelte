import * as $ from 'svelte/internal/server';
import { untrack as read_untracked } from 'svelte';
import * as svelte from 'svelte';
import Component from './Component.svelte';

export default function Props_retained_analysis($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			safe_untrack,
			safe_namespace_untrack,
			safe_inline_event,
			safe_named_event,
			unsafe_blur,
			unsafe_focusout,
			unsafe_component_event,
			unsafe_spread_event,
			unsafe_local_untrack,
			unsafe_mixed_event
		} = $$props;

		read_untracked(() => safe_untrack);
		svelte.untrack(() => safe_namespace_untrack);

		const handle_click = () => safe_named_event;
		const handle_blur = () => unsafe_blur;
		const handle_focusout = () => unsafe_focusout;
		const handle_component_event = () => unsafe_component_event;
		const handle_mixed_event = () => unsafe_mixed_event;

		function untrack(fn) {
			fn();
		}

		untrack(() => unsafe_local_untrack);
		$$renderer.push(`<button>inline</button> <button>named</button> <button>blur</button> <button>focusout</button> <button${$.attributes({ ...{ onclick: () => unsafe_spread_event } })}>spread</button> `);
		Component($$renderer, { onclick: handle_component_event });
		$$renderer.push(`<!----> <button>mixed</button> `);
		Component($$renderer, { onclick: handle_mixed_event });
		$$renderer.push(`<!---->`);
	});
}