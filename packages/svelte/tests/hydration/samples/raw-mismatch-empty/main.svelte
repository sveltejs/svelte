<script>
	let { values } = $props();
	let n = $state(0);
</script>

{#each values as value}
	<div>{@html n === 0 ? value : n === 2 ? '' : '<u>client markup</u>'}<b>{n}</b></div>
	<section>{@html n === 0 ? value : n === 2 ? '' : '<u>client markup</u>'}</section>
{/each}
<button onclick={() => n++}>+1</button>
