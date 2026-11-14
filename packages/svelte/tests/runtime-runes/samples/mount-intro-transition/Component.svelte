<script>
	import { fade } from 'svelte/transition';

	let { pending } = $props();
</script>

<div in:fade|global={{ duration: 100 }}>DIV</div>

<svelte:boundary {pending}>
	<div in:fade={{ duration: 100 }}>DIV</div>
</svelte:boundary>
