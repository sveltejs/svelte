import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/legacy';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Delete_member($$anchor) {
	const items = [0, 1, 2];
	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, items.length));
	$.delegated('click', button, () => delete items[1]);
	$.append($$anchor, button);
}

$.delegate(['click']);