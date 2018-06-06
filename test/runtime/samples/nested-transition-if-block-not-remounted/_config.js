export default {
	data: {
		x: true,
		value: 'one'
	},

	html: `
		<div>
			<input>
			<span>x</span>
		</div>
	`,

	nestedTransitions: true,

	test(assert, component, target, window, raf) {
		const div = target.querySelector('div');
		const { appendChild, insertBefore } = div;

		div.appendChild = div.insertBefore = () => {
			throw new Error('DOM was mutated');
		};

		component.set({ value: 'two' });
	},
};
