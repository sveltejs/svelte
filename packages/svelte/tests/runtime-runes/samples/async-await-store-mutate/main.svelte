<script>
	import { writable } from 'svelte/store';

	const data = writable({ count: 1 });

	function mutate_count() {
		data.update(d => {
			d.count++;
			return d;
		});
	}

	async function compute(d) {
		return Promise.resolve(d.count * 10);
	}
</script>

<svelte:boundary>
	<p>count: {$data.count}, computed: {await compute($data)}</p>

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>

<button onclick={mutate_count}>mutate</button>
