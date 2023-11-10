import { test } from '../../test';

export default test({
	get props() {
		return { depth: 5 };
	},

	html: `
		<span>5</span>
		<span>4</span>
		<span>3</span>
		<span>2</span>
		<span>1</span>
		<span>0</span>
	`
});
