<script>
	import { fork } from 'svelte';

	let x = $state(1);
	let y = $derived.by(() => {console.log('hi'); return x % 2});
	let f;
</script>

<button onclick={() => { f = fork(() => x = 3)}}>change</button>
<button onclick={() => f.commit()}>commit</button>

{#if y}hi{/if}
