<script>
	export let active = 'default';
	export let autofocusFalse = false;
	export let autofocusTrue = true;
	let spread = { autofocus: true };
</script>

{#if active === 'default'}
	<input title={active} autofocus />
{:else if active === 'dynamic-false'}
	<input title={active} autofocus={autofocusFalse} />
{:else if active === 'dynamic-true'}
	<input title={active} autofocus={autofocusTrue} />
{:else if active === 'spread'}
	<input title={active} {...spread} />
{:else if active === 'spread-override'}
	<input title={active} {...spread} autofocus={false} />
{/if}