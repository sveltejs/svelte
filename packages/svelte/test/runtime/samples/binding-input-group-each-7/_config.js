export default {
	html: `
		<input type="checkbox" value="a" data-index="x-1">
		<input type="checkbox" value="b" data-index="x-1">
		<input type="checkbox" value="c" data-index="x-1">
		<input type="checkbox" value="a" data-index="x-2">
		<input type="checkbox" value="b" data-index="x-2">
		<input type="checkbox" value="c" data-index="x-2">
		<input type="checkbox" value="a" data-index="y-1">
		<input type="checkbox" value="b" data-index="y-1">
		<input type="checkbox" value="c" data-index="y-1">
		<input type="checkbox" value="a" data-index="y-2">
		<input type="checkbox" value="b" data-index="y-2">
		<input type="checkbox" value="c" data-index="y-2">
		<input type="checkbox" value="a" data-index="z-1">
		<input type="checkbox" value="b" data-index="z-1">
		<input type="checkbox" value="c" data-index="z-1">
		<input type="checkbox" value="a" data-index="z-2">
		<input type="checkbox" value="b" data-index="z-2">
		<input type="checkbox" value="c" data-index="z-2">
	`,

	async test({ assert, target, window }) {
		const inputs = target.querySelectorAll('input');
		const checked = new Set();
		const check_inbox = async (i) => {
			checked.add(i);
			inputs[i].checked = true;
			await inputs[i].dispatchEvent(event);
		};

		for (let i = 0; i < 18; i++) {
			assert.equal(inputs[i].checked, checked.has(i));
		}

		const event = new window.Event('change');

		await check_inbox(2);
		for (let i = 0; i < 18; i++) {
			assert.equal(inputs[i].checked, checked.has(i));
		}

		await check_inbox(12);
		for (let i = 0; i < 18; i++) {
			assert.equal(inputs[i].checked, checked.has(i));
		}

		await check_inbox(8);
		for (let i = 0; i < 18; i++) {
			assert.equal(inputs[i].checked, checked.has(i));
		}
	}
};
