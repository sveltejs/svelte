import { test } from '../../test';

export default test({
	get props() {
		return {
			thePromise: new Promise((_) => {}),
			count: 0
		};
	},

	async test({ assert, component, target }) {
		await (component.thePromise = Promise.resolve({
			value: 'success',
			Component: component.Component
		}));

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>Resolved:
				<div>count: 0</div>
				<div>value: success</div>
			</div>
			`
		);

		component.count = 5;

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>Resolved:
				<div>count: 5</div>
				<div>value: success</div>
			</div>
			`
		);

		try {
			await (component.thePromise = Promise.reject({
				value: 'failure',
				Component: component.Component
			}));
		} catch (error) {
			// ignore
		}

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>Rejected:
				<div>count: 5</div>
				<div>value: failure</div>
			</div>
			`
		);

		component.count = 10;

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>Rejected:
				<div>count: 10</div>
				<div>value: failure</div>
			</div>
			`
		);
	}
});
