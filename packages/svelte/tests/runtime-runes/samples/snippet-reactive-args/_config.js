import { test } from '../../test';

export default test({
	html: `
		<p>snippet: 0</p>
		<button>toggle</button>
		<button>increase count</button>
	`,
	props: {
		get log() {
			return [];
		}
	},

	async test({ assert, target, component }) {
		const [toggle, increment] = target.querySelectorAll('button');

		await increment?.click();
		assert.htmlEqual(
			target.innerHTML,
			`
				<p>snippet: 1</p>
				<button>toggle</button>
				<button>increase count</button>
			`
		);
		assert.deepEqual(component.log, []);

		await toggle?.click();
		assert.htmlEqual(
			target.innerHTML,
			`
				<p>component: 1</p>
				<button>toggle</button>
				<button>increase count</button>
			`
		);
		assert.deepEqual(component.log, [1]);

		await increment?.click();
		assert.htmlEqual(
			target.innerHTML,
			`
				<p>component: 2</p>
				<button>toggle</button>
				<button>increase count</button>
			`
		);
		assert.deepEqual(component.log, [1]);

		await toggle?.click();
		assert.htmlEqual(
			target.innerHTML,
			`
				<p>snippet: 2</p>
				<button>toggle</button>
				<button>increase count</button>
			`
		);
		assert.deepEqual(component.log, [1]);
	}
});
