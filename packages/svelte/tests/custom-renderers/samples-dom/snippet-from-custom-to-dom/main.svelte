<script>
	import Child from './Child.svelte';
</script>

{#snippet greeting(name)}
	<span>hello {name}</span>
{/snippet}

<div>
	<Child {greeting}></Child>
</div>
