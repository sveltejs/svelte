<script>
	let text = $state('click me');
	let text2 = $state('');
	let spread = { onclick: () => text = 'click spread' };
</script>

<button onclick={() => text = 'click onclick'} {...spread}>
	{text}
</button>

<button {...spread} onclick={() => text = 'click onclick'}>
	{text}
</button>

<button onclick={() => text = 'click onclick'} {...spread} on:click={() => text2 = '!'}>
	{text}{text2}
</button>

<button on:click={() => text2 = '?'} {...spread} onclick={() => text = 'click onclick'}>
	{text}{text2}
</button>
