export default {
	compileOptions: {
		preserveWhitespace: true
	},
	test({ assert, target }) {
		// Test for <pre> tag
		const elementPre = target.querySelector('#pre');
		// Test for non <pre> tag
		const elementDiv = target.querySelector('#div');
		// Test for <pre> tag in non <pre> tag
		const elementDivWithPre = target.querySelector('#div-with-pre');

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
			`
  A
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
			elementDivWithPre.innerHTML,
			`
  <pre>    A
    B
    <span>
      C
      D
    </span>
    E
    F
  </pre>
`
		);
	}
};
