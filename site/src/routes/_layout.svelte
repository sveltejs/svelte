<script>
	import InlineSvg from '../components/InlineSvg.svelte';
	import Nav from '../components/TopNav.svelte';

	export let child;
	export let path;
</script>

<InlineSvg />
{#if path !== '/repl/embed'}
	<Nav segment={child.segment} />
{/if}

<main>
	<svelte:component this={child.component} {...child.props} />
</main>

<style>
	main {
		position: relative;
		margin: 0 auto;
		padding: var(--nav-h) var(--side-nav) 0 var(--side-nav);
		overflow-x: hidden;
	}
</style>