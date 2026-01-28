<script>
	import Inner from './Inner.svelte';

	let deferred = [];
	let show = $state(false);
</script>

<button onclick={() => show = !show}>toggle</button>
<button onclick={() => deferred.pop()()}>resolve</button>
{#if show}
	<Inner {deferred} />
{/if}
