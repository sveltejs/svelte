// Stresses the multi-node DOM unmount path: `{@html}` swaps destroy the old
// fragment and insert a new one each time. Useful for evaluating any change
// to `remove_effect_dom`, `assign_nodes`, or the fragment-clone path.

import { bench, describe } from 'vitest';
import { mount, unmount } from 'svelte';
import * as $ from 'svelte/internal/client';

const NODES = 100;

function make_html(suffix) {
	let out = '';
	for (let i = 0; i < NODES; i++) out += '<p>row ' + i + suffix + '</p>';
	return out;
}

const html_a = make_html('a');
const html_b = make_html('b');

function HtmlSwap($$anchor, { value }) {
	var fragment = $.comment();
	var node = $.first_child(fragment);
	$.html(node, () => $.get(value));
	$.append($$anchor, fragment);
}

describe('html-swap', () => {
	/** @type {HTMLDivElement} */ let target;
	/** @type {ReturnType<typeof $.state>} */ let value;
	/** @type {ReturnType<typeof mount>} */ let instance;
	let toggle = false;

	bench(
		`swap ${NODES}-node {@html} fragment`,
		() => {
			toggle = !toggle;
			$.flush(() => $.set(value, toggle ? html_b : html_a));
		},
		{
			setup() {
				target = document.createElement('div');
				document.body.appendChild(target);
				value = $.state(html_a);
				instance = mount(HtmlSwap, { target, props: { value } });
				toggle = false;
			},
			teardown() {
				unmount(instance);
				target.remove();
			}
		}
	);
});
