import { test } from '../../test';

export default test({
	get props() {
		return {
			thePromise: new Promise((_) => {})
		};
	},

	async test({ assert, component, target }) {
		await (component.thePromise = Promise.resolve([10, 11, 12, 13, 14, 15]));

		assert.htmlEqual(
			target.innerHTML,
			`
				<p>[1] 11</p>
        <p>[3] 13</p>
				<p>[4] 14</p>
			`
		);

		await (component.thePromise = Promise.resolve({ 1: 21, 3: 23, 4: 24 }));

		assert.htmlEqual(
			target.innerHTML,
			`
				<p>[1] 21</p>
				<p>[3] 23</p>
				<p>[4] 24</p>
			`
		);

		try {
			await (component.thePromise = Promise.reject([30, 31, 32, 33, 34, 35]));
		} catch (e) {
			// do nothing
		}

		assert.htmlEqual(
			target.innerHTML,
			`
				<p>[0] 30</p>
				<p>[2] 32</p>
				<p>[5] 35</p>
			`
		);

		try {
			await (component.thePromise = Promise.reject({ 0: 40, 2: 42, 5: 45 }));
		} catch (e) {
			// do nothing
		}

		assert.htmlEqual(
			target.innerHTML,
			`
				<p>[0] 40</p>
				<p>[2] 42</p>
				<p>[5] 45</p>
			`
		);
	}
});
