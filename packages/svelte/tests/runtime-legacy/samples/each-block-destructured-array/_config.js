import { test } from '../../test';

export default test({
	get props() {
		return {
			animalPawsEntries: [
				['raccoon', 'hands'],
				['eagle', 'wings']
			]
		};
	},

	html: `
		<p>raccoon: hands</p>
		<p>eagle: wings</p>
	`,

	test({ assert, component, target }) {
		component.animalPawsEntries = [['foo', 'bar']];
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>foo: bar</p>
		`
		);
	}
});
