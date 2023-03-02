export default {
	html: `
		<div style="display: contents; --color: &quot; onload=&quot;alert('uhoh')&quot; data-nothing=&quot;not important;">
			<div class="svelte-271qee">hi</div>
		</div>
	`,
	ssrHtml: `
		<div style="display: contents; --color:&quot; onload=&quot;alert('uhoh')&quot; data-nothing=&quot;not important;">
			<div class="svelte-271qee">hi</div>
		</div>
	`
};
