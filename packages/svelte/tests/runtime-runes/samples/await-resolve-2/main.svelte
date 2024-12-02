<script>
	const promise_a = Promise.resolve('a');
	const promise_b = Promise.resolve('b');
	const promise_c = Promise.resolve('c');
	const promise_d = new Promise(() => {});

	let current_promise = $state(promise_a);
</script>

{#await current_promise}
	{console.log('pending')}
{:then value}
	{console.log(value)}
{:catch}
	{console.log('error')}
{/await}

<button onclick={()=>{current_promise = promise_a}}>Show Promise A</button>
<button onclick={()=>{current_promise = promise_b}}>Show Promise B</button>
<button onclick={()=>{current_promise = promise_c}}>Show Promise C</button>
<button onclick={()=>{current_promise = promise_d}}>Show Promise D</button>
