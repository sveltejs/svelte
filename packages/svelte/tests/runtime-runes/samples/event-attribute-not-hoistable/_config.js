import { test } from '../../test';

export default test({
	html: `<button>0</button><button>x0</button><button>y0</button>`,

	async test({ assert, target }) {
		const [btn1, btn2, btn3] = target.querySelectorAll('button');

		btn1.click();
		await Promise.resolve();
		assert.htmlEqual(target.innerHTML, '<button>1</button><button>x0</button><button>y0</button>');

		btn1.dispatchEvent(new MouseEvent('mouseenter'));
		await Promise.resolve();
		assert.htmlEqual(target.innerHTML, '<button>2</button><button>x0</button><button>y0</button>');

		btn2.click();
		await Promise.resolve();
		assert.htmlEqual(target.innerHTML, '<button>2</button><button>x1</button><button>y0</button>');

		btn3.click();
		await Promise.resolve();
		assert.htmlEqual(target.innerHTML, '<button>2</button><button>x1</button><button>y1</button>');
	}
});
