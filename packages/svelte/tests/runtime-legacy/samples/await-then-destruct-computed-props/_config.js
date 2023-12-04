import { test } from '../../test';

export default test({
	async test({ assert, component, target }) {
		await Promise.resolve();
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>propA: 3</p>
			<p>propB: 7</p>
			<p>num: 3</p>
			<p>rest: {"prop3":{"prop9":9,"prop10":10}}</p>
			<p>propZ: 5</p>
			<p>propY: 6</p>
			<p>rest: {"propX":7,"propW":8}</p>
			`
		);

		await (component.object = Promise.resolve({
			prop1: 'one',
			prop2: 'two',
			prop3: { prop7: 'seven' },
			prop4: { prop10: 'ten' }
		}));
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>propA: seven</p>
			<p>propB: ten</p>
			<p>num: 5</p>
			<p>rest: {"prop1":"one","prop2":"two"}</p>
			<p>propZ: 5</p>
			<p>propY: 6</p>
			<p>rest: {"propX":7,"propW":8}</p>
			`
		);
	}
});
