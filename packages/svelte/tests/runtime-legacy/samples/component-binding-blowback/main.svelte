<script>
	import Widget from './Widget.svelte';

	export let x = false;
	export let bar = {
		baz: 42
	};
</script>

{#if x}
	<Widget bind:foo={bar.baz}/>
{/if}
