<script>
	export let el;
	export let show;

	function foo(node) {
		return {
			duration: 100
		};
	}
</script>

{#if show == 'a'}
	<div class="first" bind:this={el} transition:foo>first</div>
{:else if show == 'b'}
	<div class="second" bind:this={el} transition:foo>second</div>
{/if}
