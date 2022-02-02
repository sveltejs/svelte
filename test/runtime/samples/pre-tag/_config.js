export default {
	test({ assert, target }) {
		// Test for <pre> tag
		const elementPre = target.querySelector('#pre');
		// Test for non <pre> tag
		const elementDiv = target.querySelector('#div');
		// Test for <pre> tag in non <pre> tag
		const elementDivWithPre = target.querySelector('#div-with-pre');

		// There is a slight difference in innerHTML because there is a difference in HTML optimization (in jsdom)
		// depending on how the innerHTML is set.
		// (There is no difference in the display.)
		// Reassign innerHTML to add the same optimizations to innerHTML.

		// eslint-disable-next-line no-self-assign
		elementPre.innerHTML = elementPre.innerHTML;
		// eslint-disable-next-line no-self-assign
		elementDiv.innerHTML = elementDiv.innerHTML;
		// eslint-disable-next-line no-self-assign
		elementDivWithPre.innerHTML = elementDivWithPre.innerHTML;

		assert.equal(
			elementPre.innerHTML,
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
	}
};
