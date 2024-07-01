<script>
	let data = $state({
		event: {
			author: 'John Doe',
			body: 'Body'
		}
	});
	const { event } = $derived(data);
</script>

{#if event}
	<h1>{event.author}</h1>
	<p>{event.body}</p>
{/if}

<button onclick={() => {
	data = {}
}}>hide</button>

<button onclick={() => {
	data = {
			event: {
				author: 'John Doe',
				body: 'Body'
			}
		}
}}>show</button>
