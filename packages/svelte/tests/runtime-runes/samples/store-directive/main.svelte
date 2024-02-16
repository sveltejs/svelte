<script>
	import { writable } from 'svelte/store';

	let action = writable((node) => {
		node.textContent = 'mounted';
	});
</script>

<div use:$action>hello</div>
