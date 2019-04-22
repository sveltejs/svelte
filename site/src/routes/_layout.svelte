<script>
	import { page, preloading } from '@sapper/app';
	import InlineSvg from '../components/InlineSvg.svelte';
	import PreloadingIndicator from '../components/PreloadingIndicator.svelte';
	import Nav from '../components/TopNav.svelte';

	export let segment;
</script>

{#if $preloading}
	<PreloadingIndicator/>
{/if}

<InlineSvg />
{#if $page.path !== '/repl/embed'}
	<Nav {segment}/>
{/if}

<main>
	<slot></slot>
</main>

<style>
	main {
		position: relative;
		margin: 0 auto;
		/* padding: var(--nav-h) var(--side-nav) 0 var(--side-nav); */
		padding: var(--nav-h) 0 0 0;
		overflow-x: hidden;
	}
</style>