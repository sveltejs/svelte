import { flushSync } from 'svelte';
import { test } from '../../test';

// Tests that event delegation still works when the element with the event listener is moved outside the container
export default test({
	test({ assert, target }) {
		const btn1 = target.parentElement?.querySelector('button');
		const btn2 = target.querySelector('button');

		flushSync(() => {
			btn1?.click();
		});

		assert.htmlEqual(
			target.parentElement?.innerHTML ?? '',
			'<main><div><button>clicks: 1</button></div></main><button>clicks: 1</button>'
		);

		flushSync(() => {
			btn2?.click();
		});

		assert.htmlEqual(
			target.parentElement?.innerHTML ?? '',
			'<main><div><button>clicks: 2</button></div></main><button>clicks: 2</button>'
		);
	}
});
