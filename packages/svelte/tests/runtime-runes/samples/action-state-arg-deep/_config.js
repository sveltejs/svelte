import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	html: `<div class="container">{"text":"initial"}</div><button>update tracked state</button><button>Update prop</button>`,

	async test({ assert, target, logs }) {
		const [btn1, btn2] = target.querySelectorAll('button');

		flushSync(() => {
			btn2.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<div class="container">{"text":"updated"}</div><button>update tracked state</button><button>Update prop</button>`
		);

		flushSync(() => {
			btn1.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<div class="container">{"text":"updated"}</div><button>update tracked state</button><button>Update prop</button>`
		);

		assert.deepEqual(logs, [
			'action $effect: ',
			{ buttonClicked: 0 },
			'action $effect: ',
			{ buttonClicked: 1 }
		]);
	}
});
