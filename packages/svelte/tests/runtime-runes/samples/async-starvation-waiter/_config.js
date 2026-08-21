import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs, warnings }) {
		await tick();
		const [increment, independent, resolve_sealed, resolve_latest] =
			target.querySelectorAll('button');

		for (let i = 0; i < 13; i++) {
			increment.click();
			await tick();
		}

		assert.isTrue(warnings.length === 1 && warnings[0].includes('Your app is stuck in a loop'));

		independent.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<p>0:0:0:0</p><button>increment</button><button>independent</button><button>resolve sealed</button><button>resolve latest</button>'
		);
		assert.deepEqual(logs, []);

		resolve_sealed.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<p>11:1:22:22</p><button>increment</button><button>independent</button><button>resolve sealed</button><button>resolve latest</button>'
		);
		assert.equal(logs.length, 11);

		resolve_latest.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<p>13:1:26:26</p><button>increment</button><button>independent</button><button>resolve sealed</button><button>resolve latest</button>'
		);
		assert.equal(logs.length, 13);
	}
});
