export default {
	test(assert, component, target) {
		const promise = Promise.resolve().then(() => component.set({ answer: 42 }));

		component.set({ promise });

		assert.htmlEqual(target.innerHTML, `<p>wait for it...</p>`);

		return promise
			.then(() => {
				assert.htmlEqual(target.innerHTML, `
					<p>the answer is 42!</p>
				`);
			});
	}
};