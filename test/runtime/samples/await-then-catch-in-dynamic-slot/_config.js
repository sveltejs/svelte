let fulfil;

let thePromise = new Promise(f => {
	fulfil = f;
});

export default {
	props: {
		thePromise
	},

	html: `
		<p slot="pending">loading pending...</p>
    <p>loading then...</p>
    <p>loading catch...</p>
	`,

	test({ assert, component, target }) {
		fulfil(42);

		return thePromise
			.then(() => {
				assert.htmlEqual(target.innerHTML, `
          <p slot="pending">loading pending...</p>
					<p>the value is 42</p>
				`);

				let reject;

				thePromise = new Promise((f, r) => {
					reject = r;
				});

				component.thePromise = thePromise;

				assert.htmlEqual(target.innerHTML, `
      		<p slot="pending">loading pending...</p>
          <p>loading then...</p>
          <p>loading catch...</p>
	      `);

				reject(new Error('something broke'));

				return thePromise.catch(() => {});
			})
			.then(() => {
				assert.htmlEqual(target.innerHTML, `
      		<p slot="pending">loading pending...</p>
					<p>oh no! something broke</p>
				`);
			});
	}
};
