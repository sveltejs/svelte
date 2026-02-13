<script>
	let array = $state(Promise.resolve([1]));
</script>

<ul>
{#each await array as item}
	<li>{item}</li>
{/each}
</ul>

<button onclick={() => array = Promise.resolve([1, 2])}>add</button>
