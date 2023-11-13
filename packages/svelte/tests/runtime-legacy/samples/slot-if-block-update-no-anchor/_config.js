import { test } from '../../test';

export default test({
	get props() {
		return { enabled: false };
	},
	test({ assert, target, component }) {
		assert.htmlEqual(target.innerHTML, '<span></span>');
		component.enabled = true;
		assert.htmlEqual(target.innerHTML, '<span>enabled</span>');
	}
});
