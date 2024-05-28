import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>0</button><button>x0</button><button>y0</button>`,

	test({ assert, target }) {
		const [btn1, btn2, btn3] = target.querySelectorAll('button');

		flushSync(() => {
			btn1.click();
		});

		assert.htmlEqual(target.innerHTML, '<button>1</button><button>x0</button><button>y0</button>');

		flushSync(() => {
			btn1.dispatchEvent(new MouseEvent('mouseenter'));
		});

		assert.htmlEqual(target.innerHTML, '<button>2</button><button>x0</button><button>y0</button>');

		flushSync(() => {
			btn2.click();
		});

		assert.htmlEqual(target.innerHTML, '<button>2</button><button>x1</button><button>y0</button>');

		flushSync(() => {
			btn3.click();
		});

		assert.htmlEqual(target.innerHTML, '<button>2</button><button>x1</button><button>y1</button>');
	}
});
