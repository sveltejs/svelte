<script>
	import { fade } from 'svelte/transition';
	let show = $state(true);
</script>

<h1>Outside</h1>

{#if show}
	<button onclick={()=> show = false} transition:fade|global={{ duration: 100 }}>Hide</button>
{/if}
