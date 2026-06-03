<script lang="ts">
	import { fork } from 'svelte';
	import A from './A.svelte';
	import B from './B.svelte';

	let open = $state(true);
	let f;
</script>


<button onclick={() => {
	f = fork(() => {
		open = !open;
	})
}}>fork</button>
<button onclick={() => {
	f.commit()
}}>commit</button>

{#if open}
	<A />
{:else}
	<B />
{/if}
