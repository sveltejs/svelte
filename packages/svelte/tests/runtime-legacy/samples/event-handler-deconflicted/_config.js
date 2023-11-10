import { test } from '../../test';

export default test({
	get props() {
		return { click_handler: 'x' };
	},

	html: `
		<button>x</button>
	`
});
