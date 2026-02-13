<script>
	let checked = $derived(await new Promise((r) => setTimeout(() => r(true)), 10));

	const checkedFactory = () => {
		return () => checked;
	}

	function indirectCheckedFactory() {
		return checkedFactory();
	}

	function callFactory(factory) {
		return factory();
	}

	function indirectCallFactory() {
		return callFactory(indirectCheckedFactory);
	}

	function indirectChecked2() {
		const indirect = () => checkedFactory()();
		return indirect;
	}
</script>

<!-- force into separate effects -->
{#if true}
	{checkedFactory()()}
{/if}
{#if true}
	{indirectCheckedFactory()()}
{/if}
{#if true}
	{callFactory(checkedFactory)()}
{/if}
{#if true}
	{indirectCallFactory()()}
{/if}
{#if true}
	{indirectChecked2()()}
{/if}
