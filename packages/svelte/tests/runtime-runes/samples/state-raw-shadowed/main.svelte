<script>
	import { preview_state } from './preview.svelte.js';

	let items = $state.raw([]);
	items = [1, 2, 3];

	function preview() {
		let items = $state.raw(['draft']);
		return items.length;
	}

	function preview_reassigned() {
		let items = $state.raw([]);
		items = ['draft', 'published'];
		return items.length;
	}
</script>

<p>{items.length} {preview()} {preview_reassigned()} {preview_state()}</p>

<div>
	{let items = $state.raw(['template'])}
	{items.length}
</div>
