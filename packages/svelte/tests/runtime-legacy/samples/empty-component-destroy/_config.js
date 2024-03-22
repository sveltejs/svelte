import { test } from '../../test';

/**
 * @type {{ (...data: any[]): void; (message?: any, ...optionalParams: any[]): void; (...data: any[]): void; (message?: any, ...optionalParams: any[]): void; }}
 */
let log;

export default test({
	html: `
	  <button>destroy component</button>
	`,

	before_test() {
		log = console.log;
	},
	after_test() {
		console.log = log;
	},

	async test({ assert, target, window }) {
		const button = target.querySelector('button');
		const event = new window.MouseEvent('click');
		/**
		 * @type {any[]}
		 */
		const messages = [];
		console.log = (msg) => messages.push(msg);
		// @ts-ignore
		await button.dispatchEvent(event);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>destroy component</button>
		`
		);
		assert.deepEqual(messages, ['destroy']);
	}
});
