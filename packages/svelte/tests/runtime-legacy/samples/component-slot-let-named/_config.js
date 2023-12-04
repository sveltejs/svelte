import { test } from '../../test';

export default test({
	get props() {
		return { things: [1, 2, 3] };
	},

	html: `
		<div>
			<div slot="foo"><span>1</span></div>
			<div slot="foo"><span>2</span></div>
			<div slot="foo"><span>3</span></div>
		</div>`,

	test({ assert, component, target }) {
		component.things = [1, 2, 3, 4];
		assert.htmlEqual(
			target.innerHTML,
			`
			<div>
				<div slot="foo"><span>1</span></div>
				<div slot="foo"><span>2</span></div>
				<div slot="foo"><span>3</span></div>
				<div slot="foo"><span>4</span></div>
			</div>
		`
		);
	}
});
