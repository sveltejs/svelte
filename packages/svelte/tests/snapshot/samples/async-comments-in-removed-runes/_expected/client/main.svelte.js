import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	$.user_effect(() => {
		// removed effect
		const entries = /* @__PURE__ */ Object.create(null);
	});

	const cleanup = $.effect_root(() => {
		const entries = /* #__PURE__ */ Object.create(null);
	});

	;;

	// keep current
	function current() {
		return (/* @__PURE__ */ Object.create(null));
	}

	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(($0) => $.set_text(text, $0), [() => current()]);
	$.delegated('click', button, cleanup);
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);