<script>
	let a = $state(0);
	let b = $state(0);
</script>

{#if a}
	{@const toShow = await a}
	{toShow}
	{b}
{:else}
	<button
		onclick={async () => {
			a = 1;
			await 1;
			await 1; // two microtasks needed to get timing right to reproduce the bug
			b = 1;
		}}>click</button>
{/if}
