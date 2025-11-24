import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	skip: true,
	async test({ assert, target }) {
		const [add, shift] = target.querySelectorAll('button');

		add.click();
		await tick();
		add.click();
		await tick();
		add.click();
		await tick();

		// TODO pending count / number of pushes is off

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>add</button>
			<button>shift</button>
			<p>pending=6 values.length=1 values=[1]</p>
			<div>not keyed:
				<div>1</div>
			</div>
			<div>keyed:
				<div>1</div>
			</div>
		`
		);

		shift.click();
		await tick();
		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>add</button>
			<button>shift</button>
			<p>pending=4 values.length=2 values=[1,2]</p>
			<div>not keyed:
				<div>1</div>
				<div>2</div>
			</div>
			<div>keyed:
				<div>1</div>
				<div>2</div>
			</div>
		`
		);

		shift.click();
		await tick();
		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>add</button>
			<button>shift</button>
			<p>pending=2 values.length=3 values=[1,2,3]</p>
			<div>not keyed:
				<div>1</div>
				<div>2</div>
				<div>3</div>
			</div>
			<div>keyed:
				<div>1</div>
				<div>2</div>
				<div>3</div>
			</div>
		`
		);

		shift.click();
		await tick();
		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>add</button>
			<button>shift</button>
			<p>pending=0 values.length=4 values=[1,2,3,4]</p>
			<div>not keyed:
				<div>1</div>
				<div>2</div>
				<div>3</div>
				<div>4</div>
			</div>
			<div>keyed:
				<div>1</div>
				<div>2</div>
				<div>3</div>
				<div>4</div>
			</div>
		`
		);
	}
});
