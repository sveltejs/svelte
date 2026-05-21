import '../../../dom_env.js';
import * as $ from 'svelte/internal/client';
import { mount, unmount } from '../../../../packages/svelte/src/internal/client/render.js';
import { fresh_target } from '../../../dom_env.js';

const ROWS = 100;

const row_template = $.from_html('<li><span> </span></li>');

/**
 * @param {Node} $$anchor
 * @param {{ items: any }} props
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
			// swap row 1 and ROWS-2 — exercises reconcile's "match later items first" path
			const a = 1 + (i % (ROWS - 2));
			const b = ROWS - 1 - (i % (ROWS - 2));
			if (a === b) return;
			const arr = $.get(items).slice();
			const tmp = arr[a];
			arr[a] = arr[b];
			arr[b] = tmp;
			$.flush(() => $.set(items, arr));
		}
	};
};
