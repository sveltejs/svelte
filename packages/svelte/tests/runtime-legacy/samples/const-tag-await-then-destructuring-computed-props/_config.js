import { test } from '../../test';

export default test({
	html: `
		<p>4, 12, 60</p>
	`,

	async test({ component, target, assert }) {
		component.permutation = [2, 3, 1];
		await (component.promise1 = Promise.resolve({ length: 1, width: 2, height: 3 }));
		try {
			await (component.promise2 = Promise.reject({ length: 97, width: 98, height: 99 }));
		} catch (e) {
			// nothing
		}

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>2, 11, 2</p>
			<p>9506, 28811, 98</p>
		`
		);
	}
});
