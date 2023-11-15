import { test } from '../../test';

export default test({
	html: `
		a: moduleA
		b: moduleB
		moduleA: moduleA
		moduleB: moduleB
	`,
	async test({ assert, target, component }) {
		await component.updateModuleA();

		assert.htmlEqual(
			target.innerHTML,
			`
			a: moduleA
			b: moduleB
			moduleA: moduleA
			moduleB: moduleB
		`
		);

		component.reset();
	}
});
