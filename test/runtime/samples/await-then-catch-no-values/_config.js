let fulfil;

let thePromise = new Promise(f => {
	fulfil = f;
});

export default {
	props: {
		thePromise
	},

	html: 'waiting',

	test({ assert, component, target }) {
		fulfil(9000);

		return thePromise
			.then(() => {
				assert.htmlEqual(target.innerHTML, 'resolved');

				let reject;

				thePromise = new Promise((f, r) => {
					reject = r;
				});

				component.thePromise = thePromise;

				assert.htmlEqual(target.innerHTML, 'waiting');

				reject(new Error('something broke'));

				return thePromise.catch(() => {});
			})
			.then(() => {
				assert.htmlEqual(target.innerHTML, 'rejected');
			});
	}
};
