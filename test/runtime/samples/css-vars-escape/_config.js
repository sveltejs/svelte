export default {
	html: `
		<div style="display: contents; --color: &quot; onload=&quot;alert('uhoh')&quot; data-nothing=&quot;not important;">
			<div class="svelte-1olrwfe">hi</div>
		</div>
	`,
	ssrHtml: `
		<div style="display: contents; --color:&quot; onload=&quot;alert('uhoh')&quot; data-nothing=&quot;not important;">
			<div class="svelte-1olrwfe">hi</div>
		</div>
	`
};
