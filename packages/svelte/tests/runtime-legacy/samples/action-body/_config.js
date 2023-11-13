import { test } from '../../test';

export default test({
	html: '<div></div>',

	async test({ assert, target, window }) {
		const enter = new window.MouseEvent('mouseenter');
		const leave = new window.MouseEvent('mouseleave');

		await window.document.body.dispatchEvent(enter);
		assert.htmlEqual(
			target.innerHTML,
			`
			<div>
				<div class="tooltip">Perform an Action</div>
			</div>
		`
		);

		await window.document.body.dispatchEvent(leave);
		assert.htmlEqual(target.innerHTML, '<div></div>');
	}
});
