import { test } from '../../test';

export default test({
	html: '',

	async test({ assert, component, target, window }) {
		component.active = 'default';
		assert.equal(target.querySelector('input[title="default"]'), window.document.activeElement);

		component.active = 'dynamic-false';
		assert.notEqual(
			target.querySelector('input[title="dynamic-false"]'),
			window.document.activeElement
		);

		// when dynamically set autofocus to true, don't autofocus
		component.autofocusFalse = true;
		assert.notEqual(
			target.querySelector('input[title="dynamic-false"]'),
			window.document.activeElement
		);

		component.active = 'dynamic-true';
		assert.equal(
			target.querySelector('input[title="dynamic-true"]'),
			window.document.activeElement
		);

		component.active = 'spread';
		assert.equal(target.querySelector('input[title="spread"]'), window.document.activeElement);

		component.active = 'spread-override';
		assert.notEqual(
			target.querySelector('input[title="spread-override"]'),
			window.document.activeElement
		);
	}
});
