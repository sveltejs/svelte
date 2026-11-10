<script>
	let show = $state(false);

	const thenable = {
		then(resolve) {
			resolve('ok');
		}
	};
</script>

<button onclick={() => (show = true)}>show</button>

{#if show}
	{#await thenable then value}
		<p>{value}</p>
	{/await}
{/if}
