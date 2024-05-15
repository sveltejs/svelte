import { test } from '../../test';

export default test({
	html: `
	<div>
		<p class="tooltip">static stuff</p>
	</div>
	<div>
		<p class="tooltip">dynamic stuff</p>
	</div>
	<button>unused</button>
	`
});
