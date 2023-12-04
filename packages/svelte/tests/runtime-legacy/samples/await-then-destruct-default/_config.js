import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await Promise.resolve();
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>a: 3</p>
			<p>b: 2</p>
			<p>c: 3</p>
			<p>a: 1</p>
			<p>b: 2</p>
			<p>c: 3</p>
			<p>a: 3</p>
			<p>b: 2</p>
			<p>c: 3</p>
			<p>a: 1</p>
			<p>b: 2</p>
			<p>c: 3</p>
			`
		);
	}
});
