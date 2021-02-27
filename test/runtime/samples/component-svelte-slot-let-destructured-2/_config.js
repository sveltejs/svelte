export default {
	html: `
		<div>
			hello world 0 hello
			<button>Increment</button>
		</div>
		<div>
			hello world 0 hello
			<button>Increment</button>
		</div>
		<div>
			hello world 0 hello
			<button>Increment</button>
		</div>
	`,
	async test({ assert, component, target, window }) {
		const [button1, button2, button3] = target.querySelectorAll('button');
		const event = new window.MouseEvent('click');

		await button1.dispatchEvent(event);
		assert.htmlEqual(target.innerHTML, `
			<div>
				hello world 1 hello
				<button>Increment</button>
			</div>
			<div>
				hello world 0 hello
				<button>Increment</button>
			</div>
			<div>
				hello world 0 hello
				<button>Increment</button>
			</div>
		`);

		await button2.dispatchEvent(event);
		assert.htmlEqual(target.innerHTML, `
			<div>
				hello world 1 hello
				<button>Increment</button>
			</div>
			<div>
				hello world 1 hello
				<button>Increment</button>
			</div>
			<div>
				hello world 0 hello
				<button>Increment</button>
			</div>
		`);

		await button3.dispatchEvent(event);
		assert.htmlEqual(target.innerHTML, `
			<div>
				hello world 1 hello
				<button>Increment</button>
			</div>
			<div>
				hello world 1 hello
				<button>Increment</button>
			</div>
			<div>
				hello world 1 hello
				<button>Increment</button>
			</div>
		`);
	}
};
