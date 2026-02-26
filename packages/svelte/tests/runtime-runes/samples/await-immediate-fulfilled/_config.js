import { test } from '../../test';
import { tick } from 'svelte';

export default test({
	async test({ assert, target }) {
		const [resolveImmediate, resolveTimeout, rejectImmediate, rejectTimeout] =
			target.querySelectorAll('button');

		rejectTimeout.click();
		await new Promise((resolve) => setTimeout(resolve, 1));
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>Resolve (immediate)</button>
				<button>Resolve (timeout)</button>
				<button>Reject (immediate)</button>
				<button>Reject (timeout)</button>
				<p> err [Yeah] </p>
			`
		);

		resolveImmediate.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>Resolve (immediate)</button>
				<button>Resolve (timeout)</button>
				<button>Reject (immediate)</button>
				<button>Reject (timeout)</button>
				<p> resolved [?] </p>
			`
		);

		resolveTimeout.click();
		await new Promise((resolve) => setTimeout(resolve, 1));
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>Resolve (immediate)</button>
				<button>Resolve (timeout)</button>
				<button>Reject (immediate)</button>
				<button>Reject (timeout)</button>
				<p> resolved [OK] </p>
			`
		);

		rejectImmediate.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>Resolve (immediate)</button>
				<button>Resolve (timeout)</button>
				<button>Reject (immediate)</button>
				<button>Reject (timeout)</button>
				<p> err [??] </p>
			`
		);
	}
});
