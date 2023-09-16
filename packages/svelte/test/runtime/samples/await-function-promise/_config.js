const real_promise = Promise.resolve(42);

const promise = () => {};
promise.then = real_promise.then.bind(real_promise);
promise.catch = real_promise.catch.bind(real_promise);

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
			`
			);
		});
	}
};
