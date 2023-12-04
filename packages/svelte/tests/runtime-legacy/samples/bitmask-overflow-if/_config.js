import { test } from '../../test';

export default test({
	html: `
		012345678910111213141516171819202122232425262728293031323334353637383940
		expected: true
		if: true
		<button></button>
	`,

	async test({ assert, target, window }) {
		const button = target.querySelector('button');
		await button?.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

		assert.htmlEqual(
			target.innerHTML,
			`
			112345678910111213141516171819202122232425262728293031323334353637383940
			expected: false
			if: false
			<div></div>
			<button></button>
		`
		);
	}
});
