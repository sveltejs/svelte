import { fork, tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, instance, target }) {
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>next</button><button>resolve</button><h1>0</h1>');

		const [next, resolve] = target.querySelectorAll('button');
		next.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>next</button><button>resolve</button><div></div><p>DIV</p>'
		);

		const div = target.querySelector('div');
		next.click();
		await tick();
		assert.equal(target.querySelector('div'), div);
		assert.equal(target.querySelectorAll('p').length, 1);

		resolve.click();
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>next</button><button>resolve</button><h1>2</h1>');

		// Once resolved, a subsequent await must not show the pending snippet again.
		next.click();
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>next</button><button>resolve</button><h1>2</h1>');

		resolve.click();
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>next</button><button>resolve</button><h1>3</h1>');

		// Speculative pending changes must not replace the committed boundary.
		const h1 = target.querySelector('h1');
		const discarded = fork(() => instance.stop_loading());
		await tick();
		assert.equal(target.querySelector('h1'), h1);
		discarded.discard();
		resolve.click();
		await tick();
		assert.equal(target.querySelector('h1'), h1);

		const committed = fork(() => instance.stop_loading());
		await tick();
		assert.equal(target.querySelector('h1'), h1);
		resolve.click();
		await committed.commit();
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>next</button><button>resolve</button><h1>3</h1>');
		assert.notEqual(target.querySelector('h1'), h1);

		// The replacement must retain an anchor for later pending resolution.
		next.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>next</button><button>resolve</button><div></div><p>DIV</p>'
		);
		resolve.click();
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>next</button><button>resolve</button><h1>4</h1>');
	}
});
