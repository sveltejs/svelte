<script>
	const x = Promise.resolve(10);
</script>

<div>
	{#await x}
		Loading...
	{:then x}
		{x}
	{/await}
</div>
