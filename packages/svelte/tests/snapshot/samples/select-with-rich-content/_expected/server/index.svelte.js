import * as $ from 'svelte/internal/server';
import Option from './Option.svelte';

function opt($$renderer) {
	$$renderer.option({}, ($$renderer) => {
		$$renderer.push(`Snippet`);
	});
}

function option_snippet($$renderer) {
	$$renderer.option({}, ($$renderer) => {
		$$renderer.push(`Rendered`);
	});
}

function option_snippet2($$renderer) {
	$$renderer.option({}, ($$renderer) => {
		$$renderer.push(`Rendered in group`);
	});
}

function conditional_option($$renderer) {
	$$renderer.option({}, ($$renderer) => {
		$$renderer.push(`Conditional`);
	});
}

export default function Select_with_rich_content($$renderer) {
	let items = [1, 2, 3];
	let show = true;
	let html = '<option>From HTML</option>';

	$$renderer.push(`<select>`);

	$$renderer.option(
		{},
		($$renderer) => {
			$$renderer.push(`<span>Rich</span>`);
		},
		void 0,
		void 0,
		void 0,
		void 0,
		true
	);

	$$renderer.push(`</select> <select><!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		$$renderer.option({}, item);
	}

	$$renderer.push(`<!--]--></select> <select>`);

	if (show) {
		$$renderer.push('<!--[-->');

		$$renderer.option({}, ($$renderer) => {
			$$renderer.push(`Visible`);
		});
	} else {
		$$renderer.push('<!--[!-->');
	}

	$$renderer.push(`<!--]--></select> <select><!---->`);

	{
		$$renderer.option({}, ($$renderer) => {
			$$renderer.push(`Keyed`);
		});
	}

	$$renderer.push(`<!----></select>  <select>`);
	opt($$renderer);
	$$renderer.push(`<!----><!></select> <select><!--[-->`);

	const each_array_1 = $.ensure_array_like(items);

	for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
		let item = each_array_1[$$index_1];
		const x = item * 2;

		$$renderer.option({}, x);
	}

	$$renderer.push(`<!--]--></select> <select><optgroup label="Group">`);

	$$renderer.option(
		{},
		($$renderer) => {
			$$renderer.push(`<strong>Bold</strong>`);
		},
		void 0,
		void 0,
		void 0,
		void 0,
		true
	);

	$$renderer.push(`</optgroup></select> <select><optgroup label="Group"><!--[-->`);

	const each_array_2 = $.ensure_array_like(items);

	for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
		let item = each_array_2[$$index_2];

		$$renderer.option({}, item);
	}

	$$renderer.push(`<!--]--></optgroup></select> <select>`);

	$$renderer.option(
		{ value: 'a' },
		($$renderer) => {
			$$renderer.push(`<em>Italic</em> text`);
		},
		void 0,
		void 0,
		void 0,
		void 0,
		true
	);

	$$renderer.push(`</select> <select><!--[-->`);

	const each_array_3 = $.ensure_array_like(items);

	for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
		let item = each_array_3[$$index_3];

		$$renderer.option(
			{},
			($$renderer) => {
				$$renderer.push(`<span>${$.escape(item)}</span>`);
			},
			void 0,
			void 0,
			void 0,
			void 0,
			true
		);
	}

	$$renderer.push(`<!--]--></select> <select>`);

	if (show) {
		$$renderer.push('<!--[-->');
		$$renderer.push(`<!--[-->`);

		const each_array_4 = $.ensure_array_like(items);

		for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
			let item = each_array_4[$$index_4];

			$$renderer.option({}, item);
		}

		$$renderer.push(`<!--]-->`);
	} else {
		$$renderer.push('<!--[!-->');
	}

	$$renderer.push(`<!--]--></select> <select><!--[-->`);

	{
		$$renderer.option({}, ($$renderer) => {
			$$renderer.push(`Boundary`);
		});
	}

	$$renderer.push(`<!--]--></select> <select><!--[-->`);

	{
		$$renderer.option(
			{},
			($$renderer) => {
				$$renderer.push(`<span>Rich in boundary</span>`);
			},
			void 0,
			void 0,
			void 0,
			void 0,
			true
		);
	}

	$$renderer.push(`<!--]--></select> <select>`);
	Option($$renderer, {});
	$$renderer.push(`<!----><!></select>  <select>`);
	option_snippet($$renderer);
	$$renderer.push(`<!----><!></select> <select>${$.html(html)}<!></select> <select><optgroup label="Group">`);
	Option($$renderer, {});
	$$renderer.push(`<!----><!></optgroup></select>  <select><optgroup label="Group">`);
	option_snippet2($$renderer);
	$$renderer.push(`<!----><!></optgroup></select> <select>`);

	$$renderer.option(
		{},
		($$renderer) => {
			$$renderer.push(`${$.html('<strong>Bold HTML</strong>')}`);
		},
		void 0,
		void 0,
		void 0,
		void 0,
		true
	);

	$$renderer.push(`</select> <select><!--[-->`);

	const each_array_5 = $.ensure_array_like(items);

	for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
		let item = each_array_5[$$index_5];

		Option($$renderer, {});
	}

	$$renderer.push(`<!--]--><!></select>  <select>`);

	if (show) {
		$$renderer.push('<!--[-->');
		conditional_option($$renderer);
	} else {
		$$renderer.push('<!--[!-->');
	}

	$$renderer.push(`<!--]--><!></select>`);
}