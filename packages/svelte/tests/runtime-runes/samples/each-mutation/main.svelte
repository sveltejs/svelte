<script>
	let a = $state([{ text: 'foo' }]);

	let b = $state([{ text: 'foo' }]);

	let text = $state('foo');
	let c = $state([{ get text() { return text.toUpperCase() }, set text(v) { text = v }}]);
</script>

{#each a as item, i}
	<button on:click={() => a[i].text = 'bar'}>{item.text}</button>
{/each}

{#each b as item}
	<button on:click={() => item.text = 'bar'}>{item.text}</button>
{/each}

{#each c as item}
	<button on:click={() => item.text = 'bar'}>{item.text}</button>
{/each}
