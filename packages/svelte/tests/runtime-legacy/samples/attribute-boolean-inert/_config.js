import { ok, test } from '../../test';

export default test({
	get props() {
		return { inert: true };
	},
	test({ assert, target, component }) {
		const div = target.querySelector('div');
		ok(div);
		assert.ok(div.inert);
		component.inert = false;
		assert.ok(!div.inert);
	}
});
