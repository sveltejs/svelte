export default {
	get props() {
		return {
			thePromise: new Promise((_) => {}),
			count: 0
		};
	},

	html: `
		<div><p>loading...</p></div>
	`,

	async test({ assert, component, target }) {
		await (component.thePromise = Promise.resolve(component.Component));

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>Resolved:
				<div>count: 0</div>
			</div>
			`
		);

		component.count = 5;

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>Resolved:
				<div>count: 5</div>
			</div>
			`
		);

		try {
			await (component.thePromise = Promise.reject(component.Component));
		} catch (error) {
			// ignore
		}

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>Rejected:
				<div>count: 5</div>
			</div>
			`
		);

		component.count = 10;

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>Rejected:
				<div>count: 10</div>
			</div>
			`
		);
	}
};
