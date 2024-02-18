import { test } from '../../test';

export default test({
	async test({ assert, target, component }) {
		assert.htmlEqual(
			target.innerHTML,
			'<p>clicks: 0</p><button>Increment</button><button>Decrement</button><button>Double</button>'
		);
		const [incrementButton, decrementButton, doubleButton] = target.querySelectorAll('button');

		incrementButton?.click();
		await Promise.resolve();
		assert.htmlEqual(
			target.innerHTML,
			'<p>clicks: 1</p><button>Increment</button><button>Decrement</button><button>Double</button>'
		);

		doubleButton?.click();
		await Promise.resolve();
		assert.htmlEqual(
			target.innerHTML,
			'<p>clicks: 2</p><button>Increment</button><button>Decrement</button><button>Double</button>'
		);

		decrementButton?.click();
		await Promise.resolve();
		assert.htmlEqual(
			target.innerHTML,
			'<p>clicks: 1</p><button>Increment</button><button>Decrement</button><button>Double</button>'
		);
	}
});
