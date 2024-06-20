<script>
	const a = new Promise(() => {});
	const b = new Promise(() => {});

	let promise = $state(a);
</script>

{#await promise}
	{console.log('rendering pending block')}
	<p>pending</p>
{:then value}
	{console.log('rendering then block')}
	<p>then {value}</p>
{/await}

<button onclick={() => (promise = a)}>Show Promise A</button>
<button onclick={() => (promise = b)}>Show Promise B</button>
