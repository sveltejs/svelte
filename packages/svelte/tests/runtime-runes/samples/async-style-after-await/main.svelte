<script>
	await Promise.resolve();

	// static
	let color = $state('red');

	// dynamic
	let width = $state('100px');
</script>

<!-- force them into their own template effects -->

<!-- normal -->
{#if color}
	<div style:color={color}></div>
	<div style:width={width}></div>
	<button onclick={() => width = '1px'}>width</button>
{/if}

<!-- shorthand -->
{#if color}
	<div style:color></div>
	<div style:width></div>
	<button onclick={() => width = '1px'}>width</button>
{/if}
