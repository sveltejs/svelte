import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/client';
import { Warp } from 'svelte';

var root = $.from_html(`<p>loading</p>`);
var root_1 = $.from_html(`<p> </p>`);

export default function Async_boundary_streaming($$anchor, $$props) {
	$.push($$props, true);

	const warp = new Warp('app');
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const pending = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		$.boundary(node, { pending }, ($$anchor) => {
			var p_1 = root_1();
			var text = $.only_child(p_1, true);

			$.template_effect(($0) => $.set_text(text, $0), void 0, [
				() => warp.getOrInsertComputed('data', () => Promise.resolve('data'))
			]);

			$.append($$anchor, p_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}