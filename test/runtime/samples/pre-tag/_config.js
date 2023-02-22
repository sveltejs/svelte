export default {
	test({ assert, target }) {
		// Test for <pre> tag
		const elementPre = target.querySelector('#pre');
		// Test for non <pre> tag
		const elementDiv = target.querySelector('#div');
		// Test for <pre> tag in non <pre> tag
		const elementDivWithPre = target.querySelector('#div-with-pre');
		// Test for <pre> tag with leading newline
		const elementPreWithLeadingNewline = target.querySelector('#pre-with-leading-newline');
		const elementPreWithoutLeadingNewline = target.querySelector('#pre-without-leading-newline');
		const elementPreWithMultipleLeadingNewline = target.querySelector('#pre-with-multiple-leading-newlines');

		assert.equal(
			elementPre.innerHTML,
			`  A
  B
  <span>
    C
    D
  </span>
  E
  F
`
		);
		assert.equal(
			elementDiv.innerHTML,
			`A
  B
  <span>C
    D</span>
  E
  F`
		);
		assert.equal(
			elementDivWithPre.innerHTML,
			`<pre>    A
    B
    <span>
      C
      D
    </span>
    E
    F
  </pre>`
		);
		assert.equal(elementPreWithLeadingNewline.children[0].innerHTML, 'leading newline');
		assert.equal(elementPreWithLeadingNewline.children[1].innerHTML, '  leading newline and spaces');
		assert.equal(elementPreWithLeadingNewline.children[2].innerHTML, '\nleading newlines');
		assert.equal(elementPreWithoutLeadingNewline.children[0].innerHTML, 'without spaces');
		assert.equal(elementPreWithoutLeadingNewline.children[1].innerHTML, '  with spaces  ');
		assert.equal(elementPreWithoutLeadingNewline.children[2].innerHTML, ' \nnewline after leading space');
		assert.equal(elementPreWithMultipleLeadingNewline.innerHTML, '\n\nmultiple leading newlines');
	}
};
