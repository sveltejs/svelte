export default {
	html: `
		<input />
		<input />
		<div></div>
	`,

	async test({ assert, component, target, window }) {
		let count = 0;
		component.callback = () => {
			count++;
		};

		const [input1, input2] = target.querySelectorAll("input");

		input1.value = "1";
		await input1.dispatchEvent(new window.Event("input"));

		assert.htmlEqual(
			target.innerHTML,
			`
				<input />
				<input />
				<div>1</div>
			`
		);
		assert.equal(input1.value, "1");
		assert.equal(input2.value, "1");
		assert.equal(count, 1);

		input2.value = "123";
		await input2.dispatchEvent(new window.Event("input"));

		assert.htmlEqual(
			target.innerHTML,
			`
				<input />
				<input />
				<div>123</div>
			`
		);
		assert.equal(input1.value, "123");
		assert.equal(input2.value, "123");
		assert.equal(count, 2);

		input1.value = "456";
		await input1.dispatchEvent(new window.Event("input"));

		assert.htmlEqual(
			target.innerHTML,
			`
				<input />
				<input />
				<div>456</div>
			`
		);
		assert.equal(input1.value, "456");
		assert.equal(input2.value, "456");
		assert.equal(count, 3);
	},
};
