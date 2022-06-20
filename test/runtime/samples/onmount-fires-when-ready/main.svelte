<script>
	import Widget from './Widget.svelte';

	export let foo;
</script>

<div>
	<Widget/>

	{#if foo}
		<Widget/>
	{/if}
</div>
