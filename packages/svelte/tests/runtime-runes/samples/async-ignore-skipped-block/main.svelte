<script>
	let a = $state(0);
	let b = $state(0);
	let show = $state(true);
</script>

<button onclick={() => (a++, show = !show)}>a {a}</button>
<button onclick={() => (b++, show = !show)}>b {b}</button>

{#if show}
	<p>hello</p>
{:else}
	{await new Promise(() => {})}
{/if}
