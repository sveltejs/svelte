import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<header><nav><a href="/">Home</a> <a href="/away">Away</a></nav></header> <main><h1> </h1> <div class="static"><p>we don't need to traverse these nodes</p></div> <p>or</p> <p>these</p> <p>ones</p> <!> <p>these</p> <p>trailing</p> <p>nodes</p> <p>can</p> <p>be</p> <p>completely</p> <p>ignored</p></main> <cant-skip><custom-elements></custom-elements></cant-skip> <div><input/></div> <div><source/></div> <select><option>a</option></select> <img src="..." alt="" loading="lazy"/> <div><img src="..." alt="" loading="lazy"/></div>`, 3);

export default function Skip_static_subtree($$anchor, $$props) {
	var fragment = root();
	var main = $.sibling($.first_child(fragment), 2);
	var h1 = $.child(main);
	var text = $.child(h1, true);

	$.reset(h1);

	var node = $.sibling(h1, 10);

	$.html(node, () => $$props.content);
	$.next(14);
	$.reset(main);

	var cant_skip = $.sibling(main, 2);
	var custom_elements = $.child(cant_skip);

	$.set_custom_element_data(custom_elements, 'with', 'attributes');
	$.reset(cant_skip);

	var div = $.sibling(cant_skip, 2);
	var input = $.child(div);

	$.autofocus(input, true);
	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var source = $.child(div_1);

	source.muted = true;
	$.reset(div_1);

	var select = $.sibling(div_1, 2);
	var option = $.child(select);

	option.value = option.__value = 'a';
	$.reset(select);

	var img = $.sibling(select, 2);

	$.next(2);
	$.template_effect(() => $.set_text(text, $$props.title));
	$.append($$anchor, fragment);
}