import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();

		const [add, shift, pop] = target.querySelectorAll('button');

		add.click();
		await tick();
		add.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>add</button>
				<button>shift</button>
				<button>pop</button>
				<p>pending=2 map.size=1 map=[1]</p>
				<hr>
				<p>1: true 10</p>
				<p>2: false ...</p>
				<p>3: false ...</p>
				<p>4: false ...</p>
				<p>5: false ...</p>
				<hr>
				<p>1</p>
			`
		);

		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>add</button>
				<button>shift</button>
				<button>pop</button>
				<p>pending=1 map.size=2 map=[1,2]</p>
				<hr>
				<p>1: true 10</p>
				<p>2: true 20</p>
				<p>3: false ...</p>
				<p>4: false ...</p>
				<p>5: false ...</p>
				<hr>
				<p>1</p>
				<p>2</p>
			`
		);

		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>add</button>
				<button>shift</button>
				<button>pop</button>
				<p>pending=0 map.size=3 map=[1,2,3]</p>
				<hr>
				<p>1: true 10</p>
				<p>2: true 20</p>
				<p>3: true 30</p>
				<p>4: false ...</p>
				<p>5: false ...</p>
				<hr>
				<p>1</p>
				<p>2</p>
				<p>3</p>
			`
		);

		add.click();
		await tick();
		add.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>add</button>
				<button>shift</button>
				<button>pop</button>
				<p>pending=2 map.size=3 map=[1,2,3]</p>
				<hr>
				<p>1: true 10</p>
				<p>2: true 20</p>
				<p>3: true 30</p>
				<p>4: false ...</p>
				<p>5: false ...</p>
				<hr>
				<p>1</p>
				<p>2</p>
				<p>3</p>
			`
		);

		pop.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>add</button>
				<button>shift</button>
				<button>pop</button>
				<p>pending=1 map.size=3 map=[1,2,3]</p>
				<hr>
				<p>1: true 10</p>
				<p>2: true 20</p>
				<p>3: true 30</p>
				<p>4: false ...</p>
				<p>5: false ...</p>
				<hr>
				<p>1</p>
				<p>2</p>
				<p>3</p>
			`
		);

		pop.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>add</button>
				<button>shift</button>
				<button>pop</button>
				<p>pending=0 map.size=5 map=[1,2,3,4,5]</p>
				<hr>
				<p>1: true 10</p>
				<p>2: true 20</p>
				<p>3: true 30</p>
				<p>4: true 40</p>
				<p>5: true 50</p>
				<hr>
				<p>1</p>
				<p>2</p>
				<p>3</p>
				<p>4</p>
				<p>5</p>
			`
		);
	}
});
