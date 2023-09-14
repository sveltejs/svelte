export default {
	withoutNormalizeHtml: true,
	// Unable to test `html` with `<textarea>` content
	// as the textarea#value will not show within `innerHtml`
	ssrHtml: `<textarea id="textarea">  A
  B
</textarea> <div id="div-with-textarea"><textarea>    A
    B
  </textarea></div> <div id="textarea-with-leading-newline"><textarea>leading newline</textarea> <textarea>  leading newline and spaces</textarea> <textarea>

leading newlines</textarea></div> <div id="textarea-without-leading-newline"><textarea>without spaces</textarea> <textarea>  with spaces  </textarea> <textarea> 
newline after leading space</textarea></div> <textarea id="textarea-with-multiple-leading-newlines">


multiple leading newlines</textarea> <div id="div-with-textarea-with-multiple-leading-newlines"><textarea>


multiple leading newlines</textarea></div>`,
	test({ assert, target }) {
		// Test for <textarea> tag
		const element_textarea = target.querySelector('#textarea');
		// Test for <textarea> tag in non <textarea> tag
		const element_div_with_textarea = target.querySelector('#div-with-textarea');
		// Test for <textarea> tag with leading newline
		const element_textarea_with_leading_newline = target.querySelector(
			'#textarea-with-leading-newline'
		);
		const element_textarea_without_leading_newline = target.querySelector(
			'#textarea-without-leading-newline'
		);
		const element_textarea_with_multiple_leading_newline = target.querySelector(
			'#textarea-with-multiple-leading-newlines'
		);
		const element_div_with_textarea_with_multiple_leading_newline = target.querySelector(
			'#div-with-textarea-with-multiple-leading-newlines'
		);

		assert.equal(
			element_textarea.value,
			`  A
  B
`
		);
		assert.equal(
			element_div_with_textarea.children[0].value,
			`    A
    B
  `
		);
		assert.equal(element_textarea_with_leading_newline.children[0].value, 'leading newline');
		assert.equal(
			element_textarea_with_leading_newline.children[1].value,
			'  leading newline and spaces'
		);
		assert.equal(element_textarea_with_leading_newline.children[2].value, '\nleading newlines');
		assert.equal(element_textarea_without_leading_newline.children[0].value, 'without spaces');
		assert.equal(element_textarea_without_leading_newline.children[1].value, '  with spaces  ');
		assert.equal(
			element_textarea_without_leading_newline.children[2].value,
			' \nnewline after leading space'
		);
		assert.equal(
			element_textarea_with_multiple_leading_newline.value,
			'\n\nmultiple leading newlines'
		);
		assert.equal(
			element_div_with_textarea_with_multiple_leading_newline.children[0].value,
			'\n\nmultiple leading newlines'
		);
	}
};
