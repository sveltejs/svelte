export default {
	skip: +/v(\d+)/.exec(process.version)[1] < 8,

	html: `
		<pre>{"wanted":2}</pre>
	`,

	test(assert, component, target) {
		component.set({
			unwanted: 3,
			wanted: 4
		});

 		assert.htmlEqual(target.innerHTML, `
			<pre>{"wanted":4}</pre>
		`);

 		component.set({
			unwanted: 5,
			wanted: 6
		});

 		assert.htmlEqual(target.innerHTML, `
			<pre>{"wanted":6}</pre>
		`);
	}
};