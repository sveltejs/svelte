<script>
	import { sleep } from './sleep.js';

	let count = 0;

	const get_promise = () => {
		return sleep(10).then(() => {
			count += 1;
			return 42;
		});
	};
</script>

{#await get_promise()}
	<p>loading...</p>
{:then value}
	<p>the answer is {value}</p>
	<p>count: {count}</p>
{/await}