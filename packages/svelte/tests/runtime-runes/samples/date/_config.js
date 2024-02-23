import { flushSync } from '../../../../src/main/main-client';
import { test } from '../../test';

export default test({
	html: `<div>getSeconds: 0</div><div>getMinutes: 0</div><div>getHours: 15</div><div>getTime: 1708700400000</div><div>toDateString: Fri Feb 23 2024</div><button>1 second</button><button>1 minute</button><button>1 hour</button>`,

	test({ assert, target }) {
		const [btn, btn2, btn3] = target.querySelectorAll('button');

		flushSync(() => {
			btn?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<div>getSeconds: 1</div><div>getMinutes: 0</div><div>getHours: 15</div><div>getTime: 1708700401000</div><div>toDateString: Fri Feb 23 2024</div><button>1 second</button><button>1 minute</button><button>1 hour</button>`
		);

		flushSync(() => {
			btn2?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<div>getSeconds: 1</div><div>getMinutes: 1</div><div>getHours: 15</div><div>getTime: 1708700461000</div><div>toDateString: Fri Feb 23 2024</div><button>1 second</button><button>1 minute</button><button>1 hour</button>`
		);

		flushSync(() => {
			btn3?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<div>getSeconds: 1</div><div>getMinutes: 1</div><div>getHours: 16</div><div>getTime: 1708704061000</div><div>toDateString: Fri Feb 23 2024</div><button>1 second</button><button>1 minute</button><button>1 hour</button>`
		);
	}
});
