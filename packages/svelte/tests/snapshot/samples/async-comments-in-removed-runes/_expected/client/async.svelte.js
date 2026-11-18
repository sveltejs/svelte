import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Async($$anchor, $$props) {
	$.push($$props, true);

	// removed async effect
	/* @__PURE__ */
	/* #__PURE__ */
	// keep current
	function current() {
		return (/* @__PURE__ */ Object.create(null));
	}

	var $$promises = $.run([
		() => Promise.resolve(),
		() => {
			void $.user_effect(() => {
				// removed async effect
				const entries = /* @__PURE__ */ Object.create(null);
			});

			void $.user_pre_effect(() => {
				const entries = /* #__PURE__ */ Object.create(null);
			});
		}
	]);

	var // keep current
	/* @__PURE__ */
	p = root();

	var text = $.only_child(p, true);

	$.template_effect(($0) => $.set_text(text, $0), [() => current()]);
	$.append($$anchor, p);
	$.pop();
}