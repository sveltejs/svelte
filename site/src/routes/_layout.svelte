<script>
	import { stores } from '@sapper/app';
	import { Icon, Icons, Nav, NavItem } from '@sveltejs/site-kit';
	import PreloadingIndicator from '../components/PreloadingIndicator.svelte';

	const { page, preloading } = stores();

	export let segment;
</script>

<Icons/>

{#if $preloading}
	<PreloadingIndicator/>
{/if}

{#if $page.path !== '/repl/embed'}
	<Nav {segment} {page} logo="svelte-logo-horizontal.svg">
		<NavItem segment="tutorial">Tutorial</NavItem>
		<NavItem segment="docs">API</NavItem>
		<NavItem segment="examples">Examples</NavItem>
		<NavItem segment="repl">REPL</NavItem>
		<NavItem segment="blog">Blog</NavItem>
		<NavItem segment="faq">FAQ</NavItem>

		<NavItem external="https://sapper.svelte.dev">Sapper</NavItem>

		<NavItem external="chat" title="Discord Chat">
			<Icon name="message-square"/>
		</NavItem>

		<NavItem external="https://github.com/sveltejs/svelte" title="GitHub Repo">
			<Icon name="github"/>
		</NavItem>
	</Nav>
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
