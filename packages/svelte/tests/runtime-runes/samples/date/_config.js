import { flushSync } from '../../../../src/main/main-client';
import { test } from '../../test';

const date_proto = Date.prototype;
let date_proto_to_string = date_proto.toString;

export default test({
	html: `<div>getSeconds: 0</div><div>getMinutes: 0</div><div>getHours: 15</div><div>getTime: 1708700400000</div><div>toDateString: Fri Feb 23 2024</div><div>date: [date: 0, 0, 15]</div><button>1 second</button><button>1 minute</button><button>1 hour</button>`,

	before_test() {
		date_proto_to_string = date_proto.toString;

		// This test will fail between different machines because of timezones, so we instead mock it to be a different toString().
		date_proto.toString = function () {
			return `[date: ${this.getSeconds()}, ${this.getMinutes()}, ${this.getHours()}]`;
		};
	},

	after_test() {
		date_proto.toString = date_proto_to_string;
	},

	test({ assert, target }) {
		const [btn, btn2, btn3] = target.querySelectorAll('button');

		flushSync(() => {
			btn?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<div>getSeconds: 1</div><div>getMinutes: 0</div><div>getHours: 15</div><div>getTime: 1708700401000</div><div>toDateString: Fri Feb 23 2024</div><div>date: [date: 1, 0, 15]</div><button>1 second</button><button>1 minute</button><button>1 hour</button>`
		);

		flushSync(() => {
			btn2?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<div>getSeconds: 1</div><div>getMinutes: 1</div><div>getHours: 15</div><div>getTime: 1708700461000</div><div>toDateString: Fri Feb 23 2024</div><div>date: [date: 1, 1, 15]</div><button>1 second</button><button>1 minute</button><button>1 hour</button>`
		);

		flushSync(() => {
			btn3?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<div>getSeconds: 1</div><div>getMinutes: 1</div><div>getHours: 16</div><div>getTime: 1708704061000</div><div>toDateString: Fri Feb 23 2024</div><div>date: [date: 1, 1, 16]</div><button>1 second</button><button>1 minute</button><button>1 hour</button>`
		);
	}
});
