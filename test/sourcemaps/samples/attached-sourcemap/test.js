import * as assert from 'assert';

const get_line_column = obj => ({ line: obj.line, column: obj.column });

export function test({ input, css, js }) {

	let out_obj, loc_output, actual, loc_input, expected;

	out_obj = js;
	// we need the second occurrence of 'done_replace_script_2' in output.js
	// the first occurrence is mapped back to markup '{done_replace_script_2}'
	loc_output = out_obj.locate_1('done_replace_script_2');
	loc_output = out_obj.locate_1('done_replace_script_2', loc_output.character + 1);
	actual = out_obj.mapConsumer.originalPositionFor(loc_output);
	loc_input = input.locate_1('replace_me_script');
	expected = {
		source: 'input.svelte',
		name: 'replace_me_script',
		...get_line_column(loc_input)
	};
	assert.deepEqual(actual, expected);

	out_obj = css;
	loc_output = out_obj.locate_1('.done_replace_style_2');
	actual = out_obj.mapConsumer.originalPositionFor(loc_output);
	loc_input = input.locate_1('.replace_me_style');
	expected = {
		source: 'input.svelte',
		name: '.replace_me_style',
		...get_line_column(loc_input)
	};
	assert.deepEqual(actual, expected);

	assert.equal(
		js.code.indexOf('\n/*# sourceMappingURL=data:application/json;base64,'),
		-1,
		'magic-comment attachments were NOT removed'
	);

	assert.equal(
		css.code.indexOf('\n/*# sourceMappingURL=data:application/json;base64,'),
		-1,
		'magic-comment attachments were NOT removed'
	);
}
