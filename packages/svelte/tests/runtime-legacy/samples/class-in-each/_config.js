import { test } from '../../test';

export default test({
	get props() {
		return {
			things: ['one', 'two', 'three'],
			selected: 'two'
		};
	},

	html: `
		<div></div>
		<div class="selected"></div>
		<div></div>
	`,

	test({ assert, component, target }) {
		component.selected = 'three';
		assert.htmlEqual(
			target.innerHTML,
			`
			<div></div>
			<div class=""></div>
			<div class="selected"></div>
		`
		);
	}
});
