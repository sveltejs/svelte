import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<ul><li><button>Delete</button>\na\na</li><li><button>Delete</button>\nb\nb</li><li><button>Delete</button>\nc\nc</li><li><button>Delete</button>\nd\nd</li></ul>`,

	async test({ assert, target }) {
		/**
		 * @type {{ click: () => void; }}
		 */
		let btn1;

		[btn1] = target.querySelectorAll('button');

		flushSync(() => {
			btn1.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<ul><li><button>Delete</button>\nb\nb</li><li><button>Delete</button>\nc\nc</li><li><button>Delete</button>\nd\nd</li></ul>`
		);

		[btn1] = target.querySelectorAll('button');

		flushSync(() => {
			btn1.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<ul><li><button>Delete</button>\nc\nc</li><li><button>Delete</button>\nd\nd</li></ul>`
		);

		[btn1] = target.querySelectorAll('button');

		flushSync(() => {
			btn1.click();
		});

		assert.htmlEqual(target.innerHTML, `<ul><li><button>Delete</button>\nd\nd</li></ul>`);
	}
});
