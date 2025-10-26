import { flushSync, tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>reset</button>
		<button>a</button>
		<button>b</button>
		<button>increment</button>
		<p>pending</p>
	`,

	async test({ assert, target, logs }) {
		const [reset, a, b, increment] = target.querySelectorAll('button');

		a.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>reset</button>
				<button>a</button>
				<button>b</button>
				<button>increment</button>
				<p>42</p>
			`
		);

		increment.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>reset</button>
				<button>a</button>
				<button>b</button>
				<button>increment</button>
				<p>84</p>
			`
		);

		reset.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>reset</button>
				<button>a</button>
				<button>b</button>
				<button>increment</button>
				<p>84</p>
			`
		);

		b.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>reset</button>
				<button>a</button>
				<button>b</button>
				<button>increment</button>
				<p>86</p>
			`
		);

		assert.deepEqual(logs, [
			'outside boundary 1',
			'$effect.pre 42 1',
			'template 42 1',
			'$effect 42 1',
			'$effect.pre 84 2',
			'template 84 2',
			'outside boundary 2',
			'$effect 84 2',
			'$effect.pre 86 2',
			'template 86 2',
			'$effect 86 2'
		]);
	}
});
