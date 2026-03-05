<script>
	let value = $state('hello');

	function compute(v) {
		console.log(v);
		return { data: v, ready: true };
	}

	function fade(node) {
		return {
			duration: 100,
			tick: (t) => {
				node.style.opacity = String(t);
			}
		};
	}
</script>

<button
	onclick={() => {
		value = undefined;
	}}>clear</button
>

{#if value}
	{@const result = compute(value)}
	{#if result.ready}
		<div out:fade|global>
			<p>{result.data}</p>
		</div>
	{/if}
{/if}
