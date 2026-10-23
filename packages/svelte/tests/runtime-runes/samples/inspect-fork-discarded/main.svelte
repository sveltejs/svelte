<script>
	import { fork } from 'svelte';

	let count = $state(0);
	let other = $state(0);

	$inspect(count);
</script>

<button onclick={() => fork(() => count++).discard()}>discard</button>
<button onclick={() => fork(() => count++).commit()}>commit</button>
<button onclick={() => other++}>{other}</button>
