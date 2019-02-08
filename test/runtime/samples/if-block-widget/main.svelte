<script>
	import Widget from './Widget.svelte';

	export let visible;
</script>

before
{#if visible}
	<Widget />
{/if}
after
