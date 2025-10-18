<script lang="ts">
	import {untrack} from 'svelte';

	const {trackBranch}:{trackBranch: (branch:string)=>void} = $props();

	let b = $state(false);
	let v = $state("two");


	$effect(() => {
		v = b ? "one" : "two";
	})
</script>


<button onclick={() => b = !b}>Trigger</button>


{#if v === "one"}
	<div>if1 matched! {trackBranch('one')}</div>
{:else if v === "two"}
	<div>if2 matched! {trackBranch('two')}</div>
{:else}
	<div>nothing matched {trackBranch('else')}</div>
{/if}
