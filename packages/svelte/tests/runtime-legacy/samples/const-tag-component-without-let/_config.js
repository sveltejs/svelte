import { test } from '../../test';

export default test({
	html: `
		<div>static dynamic</div>
		<div>static dynamic</div>
		<div>static dynamic</div>
	`,
	async test({ component, target, assert }) {
		component.props = 'xxx';
		assert.htmlEqual(
			target.innerHTML,
			`
			<div>static xxx</div>
			<div>static xxx</div>
			<div>static xxx</div>
		`
		);
	}
});
