let reject;

const thePromise = new Promise((f, r) => {
	reject = r;
});

export default {
	props: {
		show: true,
		thePromise
	},

	html: `
		<p>loading...</p>
	`,

	test({ assert, component, target }) {
		reject(new Error('something broke'));

		return thePromise
			.catch(() => {
				assert.htmlEqual(target.innerHTML, `
					<p>oh no! something broke</p>
				`);

				component.show = false;

				assert.htmlEqual(target.innerHTML, `
					<p>Else</p>
				`);

				component.show = true;

				return assert.htmlEqual(target.innerHTML, `
						<p>oh no! something broke</p>
				`);
			});
	}
};