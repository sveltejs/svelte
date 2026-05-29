<script>
	import Child from './Child.svelte';

	function delay(value) {
		return new Promise((resolve) => setTimeout(() => resolve(value), 0));
	}

	let show = $state(true);
</script>

<button onclick={() => (show = false)}>hide</button>

<svelte:boundary>
	<div class="page-container">
		<!-- outer await: the page itself suspends, so Child renders during a later pass -->
		{#if show}
			<Child gate={await delay(true)} />
		{/if}
	</div>
</svelte:boundary>
