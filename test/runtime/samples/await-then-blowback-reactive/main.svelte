<script>
	import Widget from './Widget.svelte';
	export let promise = Promise.resolve(['a', 'b']);
	let value;
</script>

{#await promise}
	Loading...
{:then options}
	<Widget {options} bind:value />
	<span>{value}</span>
{/await}
