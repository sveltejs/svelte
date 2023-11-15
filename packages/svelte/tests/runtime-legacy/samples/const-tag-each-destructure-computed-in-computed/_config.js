import { test } from '../../test';

export default test({
	html: `
		<button>6, 12, 8, 24</button>
		<button>45, 35, 63, 315</button>
		<button>60, 48, 80, 480</button>
	`,

	async test({ component, target, assert }) {
		component.boxes = [{ length: 10, width: 20, height: 30 }];

		assert.htmlEqual(target.innerHTML, '<button>200, 600, 300, 6000</button>');
	}
});
