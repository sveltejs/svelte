import { test } from '../../test';

export default test({
	get props() {
		return { x: [{ z: 1 }, { z: 2 }] };
	},

	html: `
		<p>does not change</p>
		<p>does not change</p>
	`
});
