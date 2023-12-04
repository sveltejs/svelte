import { test } from '../../test';

export default test({
	html: `
		<p>override default slot</p>
	`,

	test({ component }) {
		component.nested.foo = 'b';
	}
});
