<script>
	import { fade } from 'svelte/transition';

	export let num = 1;
</script>

{#if num < 5}
	<div out:fade|global>
		<p>wheeee</p>
	</div>
{/if}