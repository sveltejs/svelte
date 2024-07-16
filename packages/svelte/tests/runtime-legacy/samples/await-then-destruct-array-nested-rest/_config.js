import { test } from '../../test';

export default test({
	get props() {
		return {
			thePromise: new Promise((_) => {})
		};
	},

	async test({ assert, component, target }) {
		await (component.thePromise = Promise.resolve([1, 2, 3, 4, 5, 6, 7, 8]));

		assert.htmlEqual(
			target.innerHTML,
			`
				<p>a: 1</p>
				<p>b: 2</p>
				<p>c: 5</p>
				<p>remaining length: 3</p>
			`
		);

		await (component.thePromise = Promise.resolve([9, 10, 11, 12, 13, 14, 15]));

		assert.htmlEqual(
			target.innerHTML,
			`
				<p>a: 9</p>
				<p>b: 10</p>
				<p>c: 13</p>
				<p>remaining length: 2</p>
			`
		);

		try {
			await (component.thePromise = Promise.reject([16, 17, 18, 19, 20, 21, 22]));
		} catch (e) {
			// do nothing
		}

		assert.htmlEqual(
			target.innerHTML,
			`
				<p>c: 16</p>
				<p>d: 17</p>
				<p>e: 18</p>
				<p>f: 19</p>
				<p>g: 22</p>
			`
		);

		try {
			await (component.thePromise = Promise.reject([23, 24, 25, 26, 27, 28, 29, 30, 31]));
		} catch (e) {
			// do nothing
		}

		assert.htmlEqual(
			target.innerHTML,
			`
				<p>c: 23</p>
				<p>d: 24</p>
				<p>e: 25</p>
				<p>f: 26</p>
				<p>g: 29</p>
			`
		);
	}
});
