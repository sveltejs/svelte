import { flushSync } from '../../../../src/main/main-client';
import { test } from '../../test';

export default test({
	html: '<div>0</div><button>toggle</button>',
	async test({ assert, component, target, raf }) {
		component.value = 2;

		const [button] = /** @type {NodeListOf<HTMLButtonElement>} */ (
			target.querySelectorAll('button')
		);

		raf.tick(0);

		assert.htmlEqual(target.innerHTML, '<div>2</div><button>toggle</button>');

		flushSync(() => {
			button.click();
		});

		raf.tick(0);

		assert.htmlEqual(target.innerHTML, '<button>toggle</button>');
	}
});
