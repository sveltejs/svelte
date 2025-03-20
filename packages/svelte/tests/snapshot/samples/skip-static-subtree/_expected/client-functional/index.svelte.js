import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.template_fn(
	() => {
		var header = document.createElement('header');
		var nav = document.createElement('nav');

		header.insertBefore(nav, undefined)

		var a = document.createElement('a');

		nav.insertBefore(a, undefined)
		a.setAttribute('href', '/')

		var text = document.createTextNode('Home');

		a.insertBefore(text, undefined)

		var text_1 = document.createTextNode(' ');

		nav.insertBefore(text_1, undefined)

		var a_1 = document.createElement('a');

		nav.insertBefore(a_1, undefined)
		a_1.setAttribute('href', '/away')

		var text_2 = document.createTextNode('Away');

		a_1.insertBefore(text_2, undefined)

		var text_3 = document.createTextNode(' ');
		var main = document.createElement('main');
		var h1 = document.createElement('h1');

		main.insertBefore(h1, undefined)

		var text_4 = document.createTextNode(' ');

		h1.insertBefore(text_4, undefined)

		var text_5 = document.createTextNode(' ');

		main.insertBefore(text_5, undefined)

		var div = document.createElement('div');

		main.insertBefore(div, undefined)
		div.setAttribute('class', 'static')

		var p = document.createElement('p');

		div.insertBefore(p, undefined)

		var text_6 = document.createTextNode('we don\'t need to traverse these nodes');

		p.insertBefore(text_6, undefined)

		var text_7 = document.createTextNode(' ');

		main.insertBefore(text_7, undefined)

		var p_1 = document.createElement('p');

		main.insertBefore(p_1, undefined)

		var text_8 = document.createTextNode('or');

		p_1.insertBefore(text_8, undefined)

		var text_9 = document.createTextNode(' ');

		main.insertBefore(text_9, undefined)

		var p_2 = document.createElement('p');

		main.insertBefore(p_2, undefined)

		var text_10 = document.createTextNode('these');

		p_2.insertBefore(text_10, undefined)

		var text_11 = document.createTextNode(' ');

		main.insertBefore(text_11, undefined)

		var p_3 = document.createElement('p');

		main.insertBefore(p_3, undefined)

		var text_12 = document.createTextNode('ones');

		p_3.insertBefore(text_12, undefined)

		var text_13 = document.createTextNode(' ');

		main.insertBefore(text_13, undefined)

		var comment = document.createComment('');

		main.insertBefore(comment, undefined)

		var text_14 = document.createTextNode(' ');

		main.insertBefore(text_14, undefined)

		var p_4 = document.createElement('p');

		main.insertBefore(p_4, undefined)

		var text_15 = document.createTextNode('these');

		p_4.insertBefore(text_15, undefined)

		var text_16 = document.createTextNode(' ');

		main.insertBefore(text_16, undefined)

		var p_5 = document.createElement('p');

		main.insertBefore(p_5, undefined)

		var text_17 = document.createTextNode('trailing');

		p_5.insertBefore(text_17, undefined)

		var text_18 = document.createTextNode(' ');

		main.insertBefore(text_18, undefined)

		var p_6 = document.createElement('p');

		main.insertBefore(p_6, undefined)

		var text_19 = document.createTextNode('nodes');

		p_6.insertBefore(text_19, undefined)

		var text_20 = document.createTextNode(' ');

		main.insertBefore(text_20, undefined)

		var p_7 = document.createElement('p');

		main.insertBefore(p_7, undefined)

		var text_21 = document.createTextNode('can');

		p_7.insertBefore(text_21, undefined)

		var text_22 = document.createTextNode(' ');

		main.insertBefore(text_22, undefined)

		var p_8 = document.createElement('p');

		main.insertBefore(p_8, undefined)

		var text_23 = document.createTextNode('be');

		p_8.insertBefore(text_23, undefined)

		var text_24 = document.createTextNode(' ');

		main.insertBefore(text_24, undefined)

		var p_9 = document.createElement('p');

		main.insertBefore(p_9, undefined)

		var text_25 = document.createTextNode('completely');

		p_9.insertBefore(text_25, undefined)

		var text_26 = document.createTextNode(' ');

		main.insertBefore(text_26, undefined)

		var p_10 = document.createElement('p');

		main.insertBefore(p_10, undefined)

		var text_27 = document.createTextNode('ignored');

		p_10.insertBefore(text_27, undefined)

		var text_28 = document.createTextNode(' ');
		var cant_skip = document.createElement('cant-skip');
		var custom_elements = document.createElement('custom-elements');

		cant_skip.insertBefore(custom_elements, undefined)

		var text_29 = document.createTextNode(' ');
		var div_1 = document.createElement('div');
		var input = document.createElement('input');

		div_1.insertBefore(input, undefined)

		var text_30 = document.createTextNode(' ');
		var div_2 = document.createElement('div');
		var source = document.createElement('source');

		div_2.insertBefore(source, undefined)

		var text_31 = document.createTextNode(' ');
		var select = document.createElement('select');
		var option = document.createElement('option');

		select.insertBefore(option, undefined)

		var text_32 = document.createTextNode('a');

		option.insertBefore(text_32, undefined)

		var text_33 = document.createTextNode(' ');
		var img = document.createElement('img');

		img.setAttribute('src', '...')
		img.setAttribute('alt', '')
		img.setAttribute('loading', 'lazy')

		var text_34 = document.createTextNode(' ');
		var div_3 = document.createElement('div');
		var img_1 = document.createElement('img');

		div_3.insertBefore(img_1, undefined)
		img_1.setAttribute('src', '...')
		img_1.setAttribute('alt', '')
		img_1.setAttribute('loading', 'lazy')

		var fragment = document.createDocumentFragment();

		fragment.append(header, text_3, main, text_28, cant_skip, text_29, div_1, text_30, div_2, text_31, select, text_33, img, text_34, div_3)
		return fragment;
	},
	3
);

export default function Skip_static_subtree($$anchor, $$props) {
	var fragment = root();
	var main = $.sibling($.first_child(fragment), 2);
	var h1 = $.child(main);
	var text = $.child(h1, true);

	$.reset(h1);

	var node = $.sibling(h1, 10);

	$.html(node, () => $$props.content, false, false);
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

	option.value = null == (option.__value = 'a') ? '' : 'a';
	$.reset(select);

	var img = $.sibling(select, 2);

	$.next(2);
	$.template_effect(() => $.set_text(text, $$props.title));
	$.append($$anchor, fragment);
}