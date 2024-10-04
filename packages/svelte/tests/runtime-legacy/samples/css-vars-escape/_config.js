import { test } from '../../test';

export default test({
	html: `
		<svelte-css-wrapper style="display: contents; --color: &quot; onload=&quot;alert('uhoh')&quot; data-nothing=&quot;not important;">
			<div class="svelte-271qee">hi</div>
		</svelte-css-wrapper>
	`
});
