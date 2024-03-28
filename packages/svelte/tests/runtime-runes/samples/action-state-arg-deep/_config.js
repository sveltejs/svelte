import { test } from '../../test';
import { flushSync, tick } from 'svelte';
import { log } from './log.js';

export default test({
	before_test() {
		log.length = 0;
	},

	html: `<div class="container">{"text":"initial"}</div><button>update tracked state</button><button>Update prop</button>`,

	async test({ assert, target }) {
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

		assert.deepEqual(log, [
			'action $effect: ',
			{ buttonClicked: 0 },
			'action $effect: ',
			{ buttonClicked: 1 }
		]);
	}
});
