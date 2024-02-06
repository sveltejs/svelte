import { test } from '../../test';

export default test({
	get props() {
		return { things: [1, 2, 3] };
	},

	html: `
		<div>
			<span>1</span>
			<div class="inner-slot">1</div>
			<span>2</span>
			<div class="inner-slot">2</div>
			<span>3</span>
			<div class="inner-slot">3</div>
		</div>`,

	test({ assert, component, target }) {
		component.things = [1, 2, 3, 4];
		assert.htmlEqual(
			target.innerHTML,
			`
			<div>
				<span>1</span>
				<div class="inner-slot">1</div>
				<span>2</span>
				<div class="inner-slot">2</div>
				<span>3</span>
				<div class="inner-slot">3</div>
				<span>4</span>
				<div class="inner-slot">4</div>
			</div>
		`
		);
	}
});
