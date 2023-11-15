<script>
	import Counter from "./Counter.svelte";

	let count = 'not state';
</script>

<Counter let:count>
	{count}

	<p slot="named">named slot count is {count}</p>
</Counter>
