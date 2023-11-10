import { ok, test } from '../../test';

export default test({
	get props() {
		return { x: true, value: 'one' };
	},

	html: `
		<div>
			<input>
			<span>x</span>
		</div>
	`,

	test({ component, target }) {
		const div = target.querySelector('div');
		ok(div);

		div.appendChild = div.insertBefore = () => {
			throw new Error('DOM was mutated');
		};

		component.value = 'two';
	}
});
