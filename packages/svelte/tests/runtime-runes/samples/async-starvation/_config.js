import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, warnings }) {
		await tick();
		const [increment, resolve_sealed, resolve_latest] = target.querySelectorAll('button');

		for (let i = 0; i < 13; i++) {
			increment.click();
			await tick();
		}

		assert.isTrue(warnings.length === 1 && warnings[0].includes('Your app is stuck in a loop'));
		assert.htmlEqual(
			target.innerHTML,
			'<p>0:0</p><button>increment</button><button>resolve sealed</button><button>resolve latest</button>'
		);

		resolve_sealed.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<p>11:11</p><button>increment</button><button>resolve sealed</button><button>resolve latest</button>'
		);

		resolve_latest.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<p>13:13</p><button>increment</button><button>resolve sealed</button><button>resolve latest</button>'
		);
	}
});
