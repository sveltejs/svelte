import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.template_fn(
	[
		{
			e: 'header',
			c: [
				{
					e: 'nav',
					c: [
						{ e: 'a', p: { href: '/' }, c: ['Home'] },
						' ',
						{
							e: 'a',
							p: { href: '/away' },
							c: ['Away']
						}
					]
				}
			]
		},
		' ',
		{
			e: 'main',
			c: [
				{ e: 'h1', c: [' '] },
				' ',
				{
					e: 'div',
					p: { class: 'static' },
					c: [
						{
							e: 'p',
							c: ['we don\'t need to traverse these nodes']
						}
					]
				},
				' ',
				{ e: 'p', c: ['or'] },
				' ',
				{ e: 'p', c: ['these'] },
				' ',
				{ e: 'p', c: ['ones'] },
				' ',
				,
				' ',
				{ e: 'p', c: ['these'] },
				' ',
				{ e: 'p', c: ['trailing'] },
				' ',
				{ e: 'p', c: ['nodes'] },
				' ',
				{ e: 'p', c: ['can'] },
				' ',
				{ e: 'p', c: ['be'] },
				' ',
				{ e: 'p', c: ['completely'] },
				' ',
				{ e: 'p', c: ['ignored'] }
			]
		},
		' ',
		{
			e: 'cant-skip',
			c: [{ e: 'custom-elements' }]
		},
		' ',
		{ e: 'div', c: [{ e: 'input' }] },
		' ',
		{ e: 'div', c: [{ e: 'source' }] },
		' ',
		{
			e: 'select',
			c: [{ e: 'option', c: ['a'] }]
		},
		' ',
		{
			e: 'img',
			p: { src: '...', alt: '', loading: 'lazy' }
		},
		' ',
		{
			e: 'div',
			c: [
				{
					e: 'img',
					p: { src: '...', alt: '', loading: 'lazy' }
				}
			]
		}
	],
	3
);

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