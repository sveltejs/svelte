import { settled, tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],
	compileOptions: { experimental: { async: true } },
	async test({ assert, target, logs, window }) {
		await tick();
		await settled();
		const [button] = target.querySelectorAll('button');
		const [input] = target.querySelectorAll('input');
		const [output] = target.querySelectorAll('output');
		const nodes = [...output.querySelectorAll('span, p, i')];
		const assert_nodes = () => {
			const current = [...output.querySelectorAll('span, p, i')];
			assert.equal(current.length, nodes.length);
			current.forEach((node, index) => assert.equal(node, nodes[index]));
		};
		assert.htmlEqual(output.innerHTML, '<span>2</span> <p>3</p> <i>2</i>');
		assert.equal(input.value, '1');
		assert.deepEqual(
			logs.filter(([kind]) => kind === 'install'),
			[['install', 2]]
		);

		input.value = '3';
		input.dispatchEvent(new window.Event('input', { bubbles: true }));
		await settled();
		assert.htmlEqual(output.innerHTML, '<span>4</span> <p>5</p> <i>4</i>');
		assert_nodes();
		assert.deepEqual(
			logs.filter(([kind]) => kind === 'install'),
			[['install', 2]]
		);
		assert.ok(logs.some(([kind, value]) => kind === 'update' && value === 4));

		button.click();
		await settled();
		assert.htmlEqual(output.innerHTML, '<span>5</span> <p>6</p> <i>5</i>');
		assert.equal(input.value, '4');
		assert_nodes();
		assert.deepEqual(
			logs.filter(([kind]) => kind === 'install'),
			[['install', 2]]
		);
	}
});
