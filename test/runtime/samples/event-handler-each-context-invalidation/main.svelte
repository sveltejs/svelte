<script>
	export let switches = [
		{ on: false },
		{ on: true },
		{ on: false }
	];
</script>

{#each switches as s}
	<button on:click="{() => s.on = !s.on}">
		{s.on ? 'on' : 'off'}
	</button>
{/each}

<p>on: {switches.filter(s => !!s.on).length}</p>