<script>
	export let visible;
	export let empty;

	import Thing from './Thing.svelte';
</script>

{#if visible}
	<div>
		{#each empty as thing}
			<Thing {thing}/>
		{/each}

		<p>text</p>
	</div>
{/if}