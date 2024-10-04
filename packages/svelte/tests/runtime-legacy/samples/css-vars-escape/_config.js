import { test } from '../../test';

export default test({
	html: `
		<span style="display: contents; --color: &quot; onload=&quot;alert('uhoh')&quot; data-nothing=&quot;not important;">
			<div class="svelte-271qee">hi</div>
		</span>
	`
});
