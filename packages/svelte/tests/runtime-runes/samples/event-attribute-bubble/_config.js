import { test } from '../../test';

export default test({
	html: `<button>0</button><button>0</button><button>change handler</button>`,

	async test({ assert, target }) {
		const [b1, b2, b3] = target.querySelectorAll('button');

		b1?.click();
		await Promise.resolve();
		assert.htmlEqual(
			target.innerHTML,
			'<button>1</button><button>1</button><button>change handler</button>'
		);

		b2?.click();
		await Promise.resolve();
		assert.htmlEqual(
			target.innerHTML,
			'<button>2</button><button>2</button><button>change handler</button>'
		);

		b3?.click();
		await Promise.resolve();
		assert.htmlEqual(
			target.innerHTML,
			'<button>2</button><button>2</button><button>change handler</button>'
		);

		b1?.click();
		await Promise.resolve();
		assert.htmlEqual(
			target.innerHTML,
			'<button>1</button><button>1</button><button>change handler</button>'
		);

		b2?.click();
		await Promise.resolve();
		assert.htmlEqual(
			target.innerHTML,
			'<button>0</button><button>0</button><button>change handler</button>'
		);
	}
});
