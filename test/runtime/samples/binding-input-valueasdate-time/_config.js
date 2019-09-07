const LUNCHTIME = new Date(1970, 0, 1, 12, 30);
const TEATIME = new Date(1970, 0, 1, 12, 30);

export default {
	props: {
		time: LUNCHTIME
	},

	html: `
		<input type=time>
		<p>[object Date] ${LUNCHTIME}</p>
	`,

	ssrHtml: `
		<input type=time value='12:30'>
		<p>[object Date] ${LUNCHTIME}</p>
	`,

	async test({ assert, component, target, window }) {
		const input = target.querySelector('input');
		const event = new window.Event('input');

		input.valueAsDate = TEATIME;
		await input.dispatchEvent(event);

		assert.equal(component.time.toString(), TEATIME.toString());
		assert.htmlEqual(target.innerHTML, `
			<input type='time'>
			<p>[object Date] ${TEATIME}</p>
		`);

		component.time = LUNCHTIME;
		assert.equal(input.valueAsDate.toString(), LUNCHTIME.toString());
		assert.htmlEqual(target.innerHTML, `
			<input type='time'>
			<p>[object Date] ${LUNCHTIME}</p>
		`);

		input.valueAsDate = null;
		await input.dispatchEvent(event);

		assert.equal(component.time, null);
		assert.htmlEqual(target.innerHTML, `
			<input type='time'>
			<p>[object Null] null</p>
		`);
	},
};
