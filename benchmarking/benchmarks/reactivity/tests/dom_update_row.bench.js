import '../../../dom_env.js';
import * as $ from 'svelte/internal/client';
import { mount, unmount } from '../../../../packages/svelte/src/internal/client/render.js';
import { fresh_target } from '../../../dom_env.js';

const ROWS = 100;

// `<li><span> </span></li>` — one row, one text-bearing span
const row_template = $.from_html('<li><span> </span></li>');

/**
 * Hand-written equivalent of a Svelte component that renders an `{#each}` over
 * a list of {id, text} objects, displaying each row's `text`. Keyed by `id` so
 * we exercise the keyed-reconcile path.
 *
 * @param {Node} $$anchor
 * @param {{ items: import('#client').Source<Array<{id:number, text:string}>> }} props
 */
function List($$anchor, { items }) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(
		node,
		0,
		() => $.get(items),
		(item) => item.id,
		($$anchor, item) => {
			var li = row_template();
			var span = /** @type {HTMLElement} */ ($.first_child(li));
			var text = /** @type {Text} */ ($.first_child(span));
			$.template_effect(() => $.set_text(text, item.text));
			$.append($$anchor, li);
		}
	);

	$.append($$anchor, fragment);
}

export default () => {
	const initial = new Array(ROWS);
	for (let i = 0; i < ROWS; i++) initial[i] = { id: i, text: 'row ' + i };
	const items = $.state(initial);

	const target = fresh_target();
	const instance = mount(List, { target, props: { items } });

	return {
		destroy() {
			unmount(instance);
			target.remove();
		},
		run(i) {
			// flip text on a different row each call so we don't no-op
			const idx = i % ROWS;
			const arr = $.get(items).slice();
			arr[idx] = { id: idx, text: 'row ' + idx + '#' + i };
			$.flush(() => $.set(items, arr));
		}
	};
};
