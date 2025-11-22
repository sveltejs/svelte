<script lang="ts">
	import type { Action } from 'svelte/action';

	const myaction: Action = (node, data) => {
		// ...
	};
</script>

<div use:myaction={data}>...</div>
