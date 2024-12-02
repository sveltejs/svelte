import { flushSync } from 'svelte';
import { test } from '../../test';

// https://github.com/sveltejs/svelte/issues/6112
export default test({
	test({ assert, target, component, window }) {
		let inputs = target.querySelectorAll('input');

		/** @param {Set<number>} set */
		const check = (set) => {
			for (let i = 0; i < inputs.length; i++) {
				assert.equal(inputs[i].checked, set.has(i));
			}
		};

		assert.htmlEqual(
			target.innerHTML,
			`
				<div>1</div>
				<div>2
					<div class="arg">
						<input type="radio" value="a">
						<input type="radio" value="b">
					</div>
					<div class="arg">
						<input type="radio" value="c">
						<input type="radio" value="d">
					</div>
				</div>
				<div>3
					<div class="arg">
						<input type="radio" value="a">
						<input type="radio" value="b">
					</div>
					<div class="arg">
						<input type="radio" value="c">
						<input type="radio" value="d">
					</div>
				</div>
			`
		);

		check(new Set([0, 2, 5, 6]));

		const event = new window.Event('change');

		// dom to value
		inputs[3].checked = true;
		inputs[3].dispatchEvent(event);
		flushSync();

		check(new Set([0, 3, 5, 6]));
		assert.equal(component.pipelineOperations[1].operation.args[1].value, 'd');

		// remove item
		component.pipelineOperations = component.pipelineOperations.slice(1);

		assert.htmlEqual(
			target.innerHTML,
			`
				<div>2
					<div class="arg">
						<input type="radio" value="a">
						<input type="radio" value="b">
					</div>
					<div class="arg">
						<input type="radio" value="c">
						<input type="radio" value="d">
					</div>
				</div>
				<div>3
					<div class="arg">
						<input type="radio" value="a">
						<input type="radio" value="b">
					</div>
					<div class="arg">
						<input type="radio" value="c">
						<input type="radio" value="d">
					</div>
				</div>
			`
		);

		inputs = target.querySelectorAll('input');
		check(new Set([0, 3, 5, 6]));

		inputs[2].checked = true;
		inputs[2].dispatchEvent(event);
		flushSync();

		check(new Set([0, 2, 5, 6]));
	}
});
