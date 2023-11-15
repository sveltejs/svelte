import { test } from '../../test';

export default test({
	test({ component }) {
		component.foo = { x: 2 };
	}
});
