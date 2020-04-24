import * as path from 'path';

export default {
	html: `
		import
		<p>1 + 2 + 3 + 4 = 10</p>
		local
		<p>1 + 2 + 3 + 4 = 10</p>
		<button>Add a number</button>
	`,
	before_test() {
		delete require.cache[path.resolve(__dirname, 'data.js')];
	},
	async test({ assert, target, window, }) {
		const btn = target.querySelector('button');
		const clickEvent = new window.MouseEvent('click');

		await btn.dispatchEvent(clickEvent);
		
		assert.htmlEqual(target.innerHTML, `
			import
			<p>1 + 2 + 3 + 4 + 5 = 15</p>
			local
			<p>1 + 2 + 3 + 4 + 5 = 15</p>
			<button>Add a number</button>
		`);

		await btn.dispatchEvent(clickEvent);
		
		assert.htmlEqual(target.innerHTML, `
			import
			<p>1 + 2 + 3 + 4 + 5 + 6 = 21</p>
			local
			<p>1 + 2 + 3 + 4 + 5 + 6 = 21</p>
			<button>Add a number</button>
		`);
	}
};
