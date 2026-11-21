<script lang="ts">
	import { fork, type Fork } from 'svelte';

	let count = $state(0);
	let f: Fork | null = null;
</script>

<button
	onclick={() => {
		f = fork(() => {
			count += 1;
		});
	}}>fork</button
>
<button onclick={() => f?.commit()}>commit</button>
<button onclick={() => f?.discard()}>discard</button>

<output>{count}</output>
