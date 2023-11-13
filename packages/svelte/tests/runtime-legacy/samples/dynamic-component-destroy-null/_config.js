import { test } from '../../test';

export default test({
	get props() {
		return { x: true };
	},

	test({ component }) {
		component.x = false;
	}
});
