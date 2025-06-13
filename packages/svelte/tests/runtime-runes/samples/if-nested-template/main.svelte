<script>
	let outer = $state(true);
	let inner = $state(123);

	function outro() {
		return { duration: 100 };
	}
</script>

{#if outer}
	<div out:outro>
		{#if inner}
			{inner.toString()}
		{/if}
	</div>
{/if}

<button onclick={() => { outer = false; inner = undefined; }}>Set both to falsy</button>
<button onclick={() => { outer = true }}>Set outer to truthy</button>
