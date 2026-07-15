import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p> <p> </p> <button>run</button>`, 1);

export default function Async_blocker_traversal($$anchor, $$props) {
	$.push($$props, true);

	// Two separate top-level async groups produce two blocker indices.
	// blocker $$promises[0]
	// blocker $$promises[1]
	// A chain of plain assignments off `first`. Tracing `chain2` must follow the
	// whole chain back to `first` (blocker index 0).
	// An assignment cycle that also touches `second` (blocker index 1). Tracing
	// must terminate despite `p`/`q` referencing each other.
	// `label` references `chain2` many times (each reference re-enters the shared
	// traversal) alongside `first` (a lower blocker index) and `q`. Its blocker must
	// be the max over every binding it reaches, so dropping any reached binding
	// during the shared traversal would change the emitted index.
	function label() {
		return `${first}-${chain2}${chain2}${chain2}${chain2}-${q}`;
	}

	// A function whose returned closure references a blocked binding: the returned
	// function is assumed callable, so the blocker must still propagate.
	function make() {
		return () => second;
	}

	// The `$effect` special case: the effect body is *not* traced, so referencing
	// `first` only inside an effect must not give `only_effect` a blocker.
	function only_effect() {
		$.user_effect(() => {
			console.log(first);
		});
	}

	var first, second, chain0, chain1, chain2, p, q;

	var $$promises = $.run([
		async () => first = await Promise.resolve('a'),
		async () => second = await Promise.resolve('b'),
		() => {
			chain0 = first;
			chain1 = chain0;
			chain2 = chain1;
			p = void 0;
			q = void 0;
			void (p = q);
			void (q = p);
			void (q = second);
		}
	]);

	var fragment = root();
	var p_1 = $.first_child(fragment);
	var text = $.child(p_1, true);

	$.reset(p_1);

	var p_2 = $.sibling(p_1, 2);
	var text_1 = $.child(p_2, true);

	$.reset(p_2);

	var button = $.sibling(p_2, 2);

	$.template_effect(
		($0, $1) => {
			$.set_text(text, $0);
			$.set_text(text_1, $1);
		},
		[() => label(), () => make()()],
		void 0,
		[$$promises[2], $$promises[1]]
	);

	$.delegated('click', button, only_effect);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);