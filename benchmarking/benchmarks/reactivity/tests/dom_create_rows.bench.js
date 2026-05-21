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
	// Pre-build the row array once — measure DOM creation, not array creation.
	const rows = new Array(ROWS);
	for (let i = 0; i < ROWS; i++) rows[i] = { id: i, text: 'row ' + i };

	// Single persistent target — each run mounts a fresh instance into it
	const target = fresh_target();

	return {
		destroy() {
			target.remove();
		},
		run() {
			const items = $.state(rows);
			const instance = mount(List, { target, props: { items } });
			unmount(instance);
		}
	};
};
