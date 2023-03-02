const realPromise = Promise.resolve(42);

const promise = () => {};
promise.then = realPromise.then.bind(realPromise);
promise.catch = realPromise.catch.bind(realPromise);

export default {
	props: {
		promise
	},

	test({ assert, target }) {
		return promise.then(() => {
			assert.htmlEqual(target.innerHTML, `
				<p>42</p>
			`);
		});
	}
};
