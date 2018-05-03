import { Store } from '../../../../store.js';

export default {
	'skip-ssr': true,

	store: new Store(),

	html: `
		<h1>Hello Brian!</h1>
	`
};