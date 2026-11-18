import { tick } from 'svelte';
import { connections } from '../../renderer';
import { test } from '../../test-dom.test';

const buttons =
	'<button>increment count</button> <button>increment both</button> <button>shift</button>';
const branch = (/** @type {number} */ n) =>
	`<button>${n}</button> <custom-root><b>branch</b></custom-root>`;

export default test({
	// based on `runtime-runes/samples/async-branch-reintro`: the `{#if}` branch is switched
	// away from in one batch while another pending batch still needs it, so it's kept in an
	// offscreen fragment (including the crossing's host node) and reinserted later
	target: 'dom',
	compileOptions: { experimental: { async: true } },
	async test({ assert, target, serialize_dom }) {
		const html = () => serialize_dom(target).replace(/\s+/g, ' ').trim();

		await tick();
		const [inc_count, inc_both, shift] = target.querySelectorAll('button');

		inc_both.click();
		await tick();
		inc_count.click();
		await tick();
		assert.equal(html(), `${buttons} 0 0 ${branch(0)}`);
		const root = target.querySelector('custom-root');

		// the branch is offscreen while the batch that needs it is pending...
		shift.click();
		await tick();
		assert.equal(html(), `${buttons} 1`);

		// ...and reinserted when it commits
		shift.click();
		await tick();
		assert.equal(html(), `${buttons} 1 2 ${branch(1)}`);
		// the branch (including the crossing's host node) was moved back, not recreated
		assert.equal(target.querySelector('custom-root'), root);

		/** @type {HTMLButtonElement} */ (target.querySelector('button:last-of-type')).click();
		await tick();
		shift.click();
		await tick();
		assert.equal(html(), `${buttons} 2 2 ${branch(2)}`);

		assert.equal(target.querySelector('custom-root'), root);
		assert.equal(connections.open, 1);
	}
});
