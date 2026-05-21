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

// Deterministic PRNG so runs are comparable across baseline/post-change measurements.
// Mulberry32 — simple, fast, well-distributed for our purposes.
/** @param {number} seed */
function rng(seed) {
	return function () {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = seed;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/**
 * @param {any[]} arr
 * @param {() => number} rand
 */
function fisher_yates(arr, rand) {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(rand() * (i + 1));
		const tmp = arr[i];
		arr[i] = arr[j];
		arr[j] = tmp;
	}
	return arr;
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
			// Deterministic shuffle keyed off the iteration number — every run is
			// the same sequence, so baseline vs post-change is a fair comparison.
			const rand = rng(i + 1);
			const arr = fisher_yates($.get(items).slice(), rand);
			$.flush(() => $.set(items, arr));
		}
	};
};
