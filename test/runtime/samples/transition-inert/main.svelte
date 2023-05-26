<script>
	export let visible = true;

	function slide(_, params) {
		return params;
	}
</script>

{#if visible}
	<button class="a" transition:slide={{ duration: 100 }}>
		foo
	</button>
	<button class="b" out:slide={{ duration: 100 }}>
		bar
	</button>
{/if}
