<script>
	const promise_a = Promise.resolve('a')
	const promise_b = Promise.resolve('b')

	let current_promise = $state(promise_a);
</script>

{#await current_promise}
	{console.log('pending')}
{:then value}
	{console.log(value)}
{/await}

<button onclick={()=>{current_promise = promise_a}}>Show Promise A</button>
<button onclick={()=>{current_promise = promise_b}}>Show Promise B</button>
