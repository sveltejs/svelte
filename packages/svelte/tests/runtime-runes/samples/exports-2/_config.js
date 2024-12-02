import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target, component }) {
		assert.htmlEqual(
			target.innerHTML,
			'<p>clicks: 0</p><button>Increment</button><button>Decrement</button><button>Double</button>'
		);
		const [incrementButton, decrementButton, doubleButton] = target.querySelectorAll('button');

		incrementButton?.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			'<p>clicks: 1</p><button>Increment</button><button>Decrement</button><button>Double</button>'
		);

		doubleButton?.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			'<p>clicks: 2</p><button>Increment</button><button>Decrement</button><button>Double</button>'
		);

		decrementButton?.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			'<p>clicks: 1</p><button>Increment</button><button>Decrement</button><button>Double</button>'
		);
	}
});
