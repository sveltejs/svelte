import { test } from '../../test';

// Tests that event delegation still works when the element with the event listener is moved outside the container
export default test({
	async test({ assert, target }) {
		const btn1 = target.parentElement?.querySelector('button');
		const btn2 = target.querySelector('button');

		btn1?.click();
		await Promise.resolve();
		assert.htmlEqual(
			target.parentElement?.innerHTML ?? '',
			'<main><div><button>clicks: 1</button></div></main><button>clicks: 1</button>'
		);

		btn2?.click();
		await Promise.resolve();
		assert.htmlEqual(
			target.parentElement?.innerHTML ?? '',
			'<main><div><button>clicks: 2</button></div></main><button>clicks: 2</button>'
		);
	}
});
