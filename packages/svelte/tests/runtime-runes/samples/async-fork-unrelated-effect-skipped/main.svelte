<script lang="ts">
	import { fork, type Fork } from 'svelte';

	let f: Fork;
	let count = $state(0);
</script>

<button onclick={() => {
	f = fork(() => {
		$effect.root(() => {
			$effect(() => console.log('ran'));
		});
	});
}}>create fork</button>
<button onclick={() => count++}>{count}</button>
<button onclick={() => f?.commit()}>commit</button>
