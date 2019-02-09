<script>
	export let x;

	import Span from './Span.svelte';
</script>

<div>
	{#if x}
		<input on:input="{() => value = this.value}">
		<Span>x</Span>
	{/if}
</div>