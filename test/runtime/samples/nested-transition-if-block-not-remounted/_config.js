export default {
	props: {
		x: true,
		value: 'one'
	},

	html: `
		<div>
			<input>
			<span>x</span>
		</div>
	`,

	test({ assert, component, target, window, raf }) {
		const div = target.querySelector('div');
		const { appendChild, insertBefore } = div;

		div.appendChild = div.insertBefore = () => {
			throw new Error('DOM was mutated');
		};

		component.value = 'two';
	},
};
