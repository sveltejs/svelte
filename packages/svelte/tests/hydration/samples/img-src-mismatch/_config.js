import { test } from '../../test';

export default test({
	server_props: {
		src: 'server.jpg'
	},
	props: {
		src: 'client.jpg'
	},
	test(assert, target) {
		// We deliberately don't slow down hydration just for supporting this edge case mismatch.
		assert.htmlEqual(target.innerHTML, '<img src="server.jpg" alt="">');
	},
	errors: [
		'The `src` attribute on `...<img src="server.jpg" alt="">` changed its value between server and client renders. The client value, `client.jpg`, will be ignored in favour of the server value'
	]
});
