<script>
	let answer = 0;
	$: answer100 = answer * 100;
	export let promise = new Promise(resolve => {
		setTimeout(() => {
			resolve();
			answer = 42;
		}, 0)
	});
</script>

{#if promise}
	{#await promise}
		<p>wait for it...</p>
	{:then _}
		<p>the answer is {answer}!</p>
		<p>the answer100 is {answer100}!</p>
	{:catch error}
		<p>well that's odd</p>
	{/await}
{/if}