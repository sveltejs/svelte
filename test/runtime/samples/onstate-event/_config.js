export default {
	'skip-ssr': true,

	data: {
		foo: 'woo!'
	},

	html: `
		<p>woo!</p>
		<p>undefined</p>
	`,

	test(assert, component, target) {
		const history = [];

		component.on('state', ({ changed, current, previous }) => {
			history.push({ changed, current, previous });
			component.set({ bar: current.foo.toUpperCase() });
		});

		component.set({ foo: 'yeah!' });
		assert.htmlEqual(target.innerHTML, `
			<p>yeah!</p>
			<p>YEAH!</p>
		`);

		component.set({ unused: 'x' });

		assert.deepEqual(history, [
			{
				changed: { foo: true },
				current: { foo: 'yeah!' },
				previous: { foo: 'woo!' }
			},
			// this is NOT received, because Svelte will not allow
			// an event handler to trigger itself recursively
			// {
			// 	changed: { bar: true },
			// 	current: { foo: 'yeah!', bar: 'YEAH!' },
			// 	previous: { foo: 'yeah!' }
			// },
			{
				changed: { unused: true },
				current: { foo: 'yeah!', bar: 'YEAH!', unused: 'x' },
				previous: { foo: 'yeah!', bar: 'YEAH!' }
			}
		]);
	}
};
