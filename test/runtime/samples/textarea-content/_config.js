export default {
	test({ assert, target }) {
		// Test for <textarea> tag
		const elementTextarea = target.querySelector('#textarea');
		// Test for <textarea> tag in non <textarea> tag
		const elementDivWithTextarea = target.querySelector('#div-with-textarea');
		// Test for <textarea> tag with leading newline
		const elementTextareaWithLeadingNewline = target.querySelector('#textarea-with-leading-newline');
		const elementTextareaWithoutLeadingNewline = target.querySelector('#textarea-without-leading-newline');
		const elementTextareaWithMultipleLeadingNewline = target.querySelector('#textarea-with-multiple-leading-newlines');
		const elementDivWithTextareaWithMultipleLeadingNewline = target.querySelector('#div-with-textarea-with-multiple-leading-newlines');

		assert.equal(
			elementTextarea.value,
			`  A
  B
`
		);
		assert.equal(
			elementDivWithTextarea.children[0].value,
			`    A
    B
  `
		);
		assert.equal(elementTextareaWithLeadingNewline.children[0].value, 'leading newline');
		assert.equal(elementTextareaWithLeadingNewline.children[1].value, '  leading newline and spaces');
		assert.equal(elementTextareaWithLeadingNewline.children[2].value, '\nleading newlines');
		assert.equal(elementTextareaWithoutLeadingNewline.children[0].value, 'without spaces');
		assert.equal(elementTextareaWithoutLeadingNewline.children[1].value, '  with spaces  ');
		assert.equal(elementTextareaWithoutLeadingNewline.children[2].value, ' \nnewline after leading space');
		assert.equal(elementTextareaWithMultipleLeadingNewline.value, '\n\nmultiple leading newlines');
		assert.equal(elementDivWithTextareaWithMultipleLeadingNewline.children[0].value, '\n\nmultiple leading newlines');
	}
};
