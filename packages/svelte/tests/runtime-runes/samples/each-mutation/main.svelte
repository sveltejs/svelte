<script>
	let works1 = $state([{ text: 'foo' }]);

	let text = $state('foo');
	let works2 = $state([{ get text() { return text }, set text(v) { text = v }}]);
	
	let doesntwork = $state([{ text: 'foo' }]);
</script>

{#each works1 as item, i}
	<button on:click={() => works1[i].text = 'bar'}>{item.text}</button>
{/each}

{#each works2 as item}
	<button on:click={() => item.text = 'bar'}>{item.text}</button>
{/each}

{#each doesntwork as item}
	<button on:click={() => item.text = 'bar'}>{item.text}</button>
{/each}
