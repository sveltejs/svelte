const promise = Promise.resolve(42);

export default {
	get props() {
		return { promise };
	},

	test({ assert, target }) {
		return promise.then(() => {
			assert.htmlEqual(
				target.innerHTML,
				`
				<p>42</p>
				<p>true</p>
			`
			);
		});
	}
};
