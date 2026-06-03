<script>
	import Component from './Component.svelte';
	let state = { title: 'foo' };
</script>

{#if state}
	{@const attributes = { title: state.title }}
	<Component {...attributes} />
{/if}
<button
	onclick={() => {
		state = undefined;
	}}
>
	Del
</button>
