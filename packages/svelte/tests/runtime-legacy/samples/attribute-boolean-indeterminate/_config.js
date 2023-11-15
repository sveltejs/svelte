import { ok, test } from '../../test';

export default test({
	get props() {
		return { indeterminate: true };
	},

	test({ assert, component, target, variant }) {
		if (variant === 'dom') {
			// hydration also has indeterminate which is harmless but would break the test unnecessarily
			assert.htmlEqual(target.innerHTML, '<input type="checkbox">');
		}

		const input = target.querySelector('input');
		ok(input);

		assert.ok(input.indeterminate);
		component.indeterminate = false;
		assert.ok(!input.indeterminate);
	}
});
