<script lang="ts">
	let text = $state('a');
	let a = $state('a');
	let b = $state('a');
	let revive = $state(false);

	// Re-run the inner each blocks before replacing their enclosing branches.
	$effect(() => {
		a = text;
	});
	$effect(() => {
		b = text;
	});

	function fade() {
		return { duration: 100, tick: () => {} };
	}
</script>

<button onclick={() => (text += '\nb')}>add a line</button>
<button onclick={() => (revive = !revive)}>toggle revival</button>

<output>
	{#key b}
		{#each (a, b.split('\n')) as line, i}
			<p>{i}: {line}</p>
		{/each}
	{/key}
</output>

<output>
	{#each [b] as key (key)}
		{#each (a, b.split('\n')) as line, i (i)}
			<p>{i}: {line}</p>
		{/each}
	{/each}
</output>

<section>
	{#if b.split('\n').length % 2 || revive}
		<div out:fade>
			{#each a.split('\n') as line, i (i)}
				<p>{i}: {line}</p>
			{/each}
		</div>
	{/if}
</section>
