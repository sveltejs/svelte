<script>
	import Widget from './Widget.svelte';

	export let clicked;
</script>

{#each ['x'] as letter}
	<Widget handleClick="{() => clicked = letter}"/>
{/each}
