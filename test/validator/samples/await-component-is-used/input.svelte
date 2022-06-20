<script>
	import Component from './Component.svelte';

	export let promise;
</script>

{#await promise}
	<p>Loading</p>
{:then data}
	<Component {data} />
{:catch err}
	<p>Error: {err}</p>
{/await}
