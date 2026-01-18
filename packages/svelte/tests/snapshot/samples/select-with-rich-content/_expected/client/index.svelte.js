import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/legacy';
import * as $ from 'svelte/internal/client';
import Option from './Option.svelte';

const opt = ($$anchor) => {
	var option = root_1();

	$.append($$anchor, option);
};

const option_snippet = ($$anchor) => {
	var option_1 = root_2();

	$.append($$anchor, option_1);
};

const option_snippet2 = ($$anchor) => {
	var option_2 = root_3();

	$.append($$anchor, option_2);
};

const conditional_option = ($$anchor) => {
	var option_3 = root_4();

	$.append($$anchor, option_3);
};

var root_1 = $.from_html(`<option>Snippet</option>`);
var root_2 = $.from_html(`<option>Rendered</option>`);
var root_3 = $.from_html(`<option>Rendered in group</option>`);
var root_4 = $.from_html(`<option>Conditional</option>`);
var option_content = $.from_html(`<span>Rich</span>`, 1);
var root_5 = $.from_html(`<option> </option>`);
var root_6 = $.from_html(`<option>Visible</option>`);
var root_7 = $.from_html(`<option>Keyed</option>`);
var select_content = $.from_html(`<!>`, 1);
var root_8 = $.from_html(`<option> </option>`);
var option_content_1 = $.from_html(`<strong>Bold</strong>`, 1);
var root_9 = $.from_html(`<option> </option>`);
var option_content_2 = $.from_html(`<em>Italic</em> text`, 1);
var option_content_3 = $.from_html(`<span> </span>`, 1);
var root_10 = $.from_html(`<option><!></option>`);
var root_12 = $.from_html(`<option> </option>`);
var root_13 = $.from_html(`<option>Boundary</option>`);
var option_content_4 = $.from_html(`<span>Rich in boundary</span>`, 1);
var root_14 = $.from_html(`<option><!></option>`);
var select_content_1 = $.from_html(`<!>`, 1);
var select_content_2 = $.from_html(`<!>`, 1);
var select_content_3 = $.from_html(`<!>`, 1);
var optgroup_content = $.from_html(`<!>`, 1);
var optgroup_content_1 = $.from_html(`<!>`, 1);
var option_content_5 = $.from_html(`<!>`, 1);
var select_content_4 = $.from_html(`<!>`, 1);
var select_content_5 = $.from_html(`<!>`, 1);
var root = $.from_html(`<select><option><!></option></select> <select></select> <select><!></select> <select><!></select>  <select><!></select> <select></select> <select><optgroup label="Group"><option><!></option></optgroup></select> <select><optgroup label="Group"></optgroup></select> <select><option><!></option></select> <select></select> <select><!></select> <select><!></select> <select><!></select> <select><!></select>  <select><!></select> <select><!></select> <select><optgroup label="Group"><!></optgroup></select>  <select><optgroup label="Group"><!></optgroup></select> <select><option><!></option></select> <select><!></select>  <select><!></select>`, 1);

export default function Select_with_rich_content($$anchor) {
	let items = [1, 2, 3];
	let show = true;
	let html = '<option>From HTML</option>';
	var fragment = root();
	var select = $.first_child(fragment);
	var option_4 = $.child(select);

	$.customizable_select(option_4, () => {
		var anchor = $.child(option_4);
		var fragment_1 = option_content();

		$.append(anchor, fragment_1);
	});

	$.reset(select);

	var select_1 = $.sibling(select, 2);

	$.each(select_1, 5, () => items, $.index, ($$anchor, item) => {
		var option_5 = root_5();
		var text = $.child(option_5, true);

		$.reset(option_5);

		var option_5_value = {};

		$.template_effect(() => {
			$.set_text(text, $.get(item));

			if (option_5_value !== (option_5_value = $.get(item))) {
				option_5.__value = $.get(item);
			}
		});

		$.append($$anchor, option_5);
	});

	$.reset(select_1);

	var select_2 = $.sibling(select_1, 2);
	var node = $.child(select_2);

	{
		var consequent = ($$anchor) => {
			var option_6 = root_6();

			$.append($$anchor, option_6);
		};

		$.if(node, ($$render) => {
			if (show) $$render(consequent);
		});
	}

	$.reset(select_2);

	var select_3 = $.sibling(select_2, 2);
	var node_1 = $.child(select_3);

	$.key(node_1, () => items, ($$anchor) => {
		var option_7 = root_7();

		$.append($$anchor, option_7);
	});

	$.reset(select_3);

	var select_4 = $.sibling(select_3, 2);

	$.customizable_select(select_4, () => {
		var anchor_1 = $.child(select_4);
		var fragment_2 = select_content();
		var node_2 = $.first_child(fragment_2);

		opt(node_2);
		$.append(anchor_1, fragment_2);
	});

	var select_5 = $.sibling(select_4, 2);

	$.each(select_5, 5, () => items, $.index, ($$anchor, item) => {
		const x = $.derived_safe_equal(() => $.get(item) * 2);
		var option_8 = root_8();
		var text_1 = $.child(option_8, true);

		$.reset(option_8);

		var option_8_value = {};

		$.template_effect(() => {
			$.set_text(text_1, $.get(x));

			if (option_8_value !== (option_8_value = $.get(x))) {
				option_8.__value = $.get(x);
			}
		});

		$.append($$anchor, option_8);
	});

	$.reset(select_5);

	var select_6 = $.sibling(select_5, 2);
	var optgroup = $.child(select_6);
	var option_9 = $.child(optgroup);

	$.customizable_select(option_9, () => {
		var anchor_2 = $.child(option_9);
		var fragment_3 = option_content_1();

		$.append(anchor_2, fragment_3);
	});

	$.reset(optgroup);
	$.reset(select_6);

	var select_7 = $.sibling(select_6, 2);
	var optgroup_1 = $.child(select_7);

	$.each(optgroup_1, 5, () => items, $.index, ($$anchor, item) => {
		var option_10 = root_9();
		var text_2 = $.child(option_10, true);

		$.reset(option_10);

		var option_10_value = {};

		$.template_effect(() => {
			$.set_text(text_2, $.get(item));

			if (option_10_value !== (option_10_value = $.get(item))) {
				option_10.__value = $.get(item);
			}
		});

		$.append($$anchor, option_10);
	});

	$.reset(optgroup_1);
	$.reset(select_7);

	var select_8 = $.sibling(select_7, 2);
	var option_11 = $.child(select_8);

	$.customizable_select(option_11, () => {
		var anchor_3 = $.child(option_11);
		var fragment_4 = option_content_2();

		$.next();
		$.append(anchor_3, fragment_4);
	});

	option_11.value = option_11.__value = 'a';
	$.reset(select_8);

	var select_9 = $.sibling(select_8, 2);

	$.each(select_9, 5, () => items, $.index, ($$anchor, item) => {
		var option_12 = root_10();

		$.customizable_select(option_12, () => {
			var anchor_4 = $.child(option_12);
			var fragment_5 = option_content_3();
			var span = $.first_child(fragment_5);
			var text_3 = $.child(span, true);

			$.reset(span);
			$.template_effect(() => $.set_text(text_3, $.get(item)));
			$.append(anchor_4, fragment_5);
		});

		$.append($$anchor, option_12);
	});

	$.reset(select_9);

	var select_10 = $.sibling(select_9, 2);
	var node_3 = $.child(select_10);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_6 = $.comment();
			var node_4 = $.first_child(fragment_6);

			$.each(node_4, 1, () => items, $.index, ($$anchor, item) => {
				var option_13 = root_12();
				var text_4 = $.child(option_13, true);

				$.reset(option_13);

				var option_13_value = {};

				$.template_effect(() => {
					$.set_text(text_4, $.get(item));

					if (option_13_value !== (option_13_value = $.get(item))) {
						option_13.__value = $.get(item);
					}
				});

				$.append($$anchor, option_13);
			});

			$.append($$anchor, fragment_6);
		};

		$.if(node_3, ($$render) => {
			if (show) $$render(consequent_1);
		});
	}

	$.reset(select_10);

	var select_11 = $.sibling(select_10, 2);
	var node_5 = $.child(select_11);

	$.boundary(node_5, {}, ($$anchor) => {
		var option_14 = root_13();

		$.append($$anchor, option_14);
	});

	$.reset(select_11);

	var select_12 = $.sibling(select_11, 2);
	var node_6 = $.child(select_12);

	$.boundary(node_6, {}, ($$anchor) => {
		var option_15 = root_14();

		$.customizable_select(option_15, () => {
			var anchor_5 = $.child(option_15);
			var fragment_7 = option_content_4();

			$.append(anchor_5, fragment_7);
		});

		$.append($$anchor, option_15);
	});

	$.reset(select_12);

	var select_13 = $.sibling(select_12, 2);

	$.customizable_select(select_13, () => {
		var anchor_6 = $.child(select_13);
		var fragment_8 = select_content_1();
		var node_7 = $.first_child(fragment_8);

		Option(node_7, {});
		$.append(anchor_6, fragment_8);
	});

	var select_14 = $.sibling(select_13, 2);

	$.customizable_select(select_14, () => {
		var anchor_7 = $.child(select_14);
		var fragment_9 = select_content_2();
		var node_8 = $.first_child(fragment_9);

		option_snippet(node_8);
		$.append(anchor_7, fragment_9);
	});

	var select_15 = $.sibling(select_14, 2);

	$.customizable_select(select_15, () => {
		var anchor_8 = $.child(select_15);
		var fragment_10 = select_content_3();
		var node_9 = $.first_child(fragment_10);

		$.html(node_9, () => html);
		$.append(anchor_8, fragment_10);
	});

	var select_16 = $.sibling(select_15, 2);
	var optgroup_2 = $.child(select_16);

	$.customizable_select(optgroup_2, () => {
		var anchor_9 = $.child(optgroup_2);
		var fragment_11 = optgroup_content();
		var node_10 = $.first_child(fragment_11);

		Option(node_10, {});
		$.append(anchor_9, fragment_11);
	});

	$.reset(select_16);

	var select_17 = $.sibling(select_16, 2);
	var optgroup_3 = $.child(select_17);

	$.customizable_select(optgroup_3, () => {
		var anchor_10 = $.child(optgroup_3);
		var fragment_12 = optgroup_content_1();
		var node_11 = $.first_child(fragment_12);

		option_snippet2(node_11);
		$.append(anchor_10, fragment_12);
	});

	$.reset(select_17);

	var select_18 = $.sibling(select_17, 2);
	var option_16 = $.child(select_18);

	$.customizable_select(option_16, () => {
		var anchor_11 = $.child(option_16);
		var fragment_13 = option_content_5();
		var node_12 = $.first_child(fragment_13);

		$.html(node_12, () => '<strong>Bold HTML</strong>');
		$.append(anchor_11, fragment_13);
	});

	$.reset(select_18);

	var select_19 = $.sibling(select_18, 2);

	$.customizable_select(select_19, () => {
		var anchor_12 = $.child(select_19);
		var fragment_14 = select_content_4();
		var node_13 = $.first_child(fragment_14);

		$.each(node_13, 1, () => items, $.index, ($$anchor, item) => {
			Option($$anchor, {});
		});

		$.append(anchor_12, fragment_14);
	});

	var select_20 = $.sibling(select_19, 2);

	$.customizable_select(select_20, () => {
		var anchor_13 = $.child(select_20);
		var fragment_16 = select_content_5();
		var node_14 = $.first_child(fragment_16);

		{
			var consequent_2 = ($$anchor) => {
				conditional_option($$anchor);
			};

			$.if(node_14, ($$render) => {
				if (show) $$render(consequent_2);
			});
		}

		$.append(anchor_13, fragment_16);
	});

	$.append($$anchor, fragment);
}