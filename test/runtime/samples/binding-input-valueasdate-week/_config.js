const SEP_W36_2019_INPUT_VALUE = '2019-W36';
const SEP_W36_2019_DATE_VALUE = new Date('2019-09-03');

const W41_2019_INPUT_VALUE = '2019-10-07';
const W41_2019_DATE_VALUE = new Date(W41_2019_INPUT_VALUE);

export default {
	props: {
		week: SEP_W36_2019_DATE_VALUE
	},

	html: `
		<input type=week>
		<p>[object Date] ${SEP_W36_2019_DATE_VALUE}</p>
	`,

	ssrHtml: `
		<input type=week value='${SEP_W36_2019_INPUT_VALUE}'>
		<p>[object Date] ${SEP_W36_2019_DATE_VALUE}</p>
	`,

	async test({ assert, component, target, window }) {
		const input = target.querySelector('input');
		// https://github.com/jsdom/jsdom/issues/2658
		// assert.equal(input.value, SEP_W36_2019_INPUT_VALUE);
		assert.equal(component.week.toString(), SEP_W36_2019_DATE_VALUE.toString());

		const event = new window.Event('input');

		// https://github.com/jsdom/jsdom/issues/2658
		// input.value = W41_2019_INPUT_VALUE;
		input.valueAsDate = W41_2019_DATE_VALUE;
		await input.dispatchEvent(event);

		assert.equal(component.week.toString(), W41_2019_DATE_VALUE.toString());
		assert.htmlEqual(target.innerHTML, `
			<input type='week'>
			<p>[object Date] ${W41_2019_DATE_VALUE}</p>
		`);

		component.week = SEP_W36_2019_DATE_VALUE;
		// https://github.com/jsdom/jsdom/issues/2658
		// assert.equal(input.value, SEP_W36_2019_INPUT_VALUE);
		assert.equal(input.valueAsDate.toString(), SEP_W36_2019_DATE_VALUE.toString());
		assert.htmlEqual(target.innerHTML, `
			<input type='week'>
			<p>[object Date] ${SEP_W36_2019_DATE_VALUE}</p>
		`);

		// https://github.com/jsdom/jsdom/issues/2658
		// empty string should be treated as undefined
		// input.value = '';

		input.valueAsDate = null;
		await input.dispatchEvent(event);

		assert.equal(component.week, null);
		assert.htmlEqual(target.innerHTML, `
			<input type='week'>
			<p>[object Null] null</p>
		`);
	},
};
