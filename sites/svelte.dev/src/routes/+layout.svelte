<script>
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { Icon, Nav, NavItem, Separator, Shell } from '@sveltejs/site-kit/components';
	import { Search, SearchBox } from '@sveltejs/site-kit/search';
	import '@sveltejs/site-kit/styles/index.css';
</script>

<svelte:head>
	{#if $page.route.id !== '/blog/[slug]'}
		<meta name="twitter:card" content="summary" />
		<meta name="twitter:image" content="https://svelte.dev/images/twitter-thumbnail.jpg" />
		<meta name="og:image" content="https://svelte.dev/images/twitter-thumbnail.jpg" />
	{/if}
</svelte:head>

<Shell nav_visible={$page.url.pathname !== '/repl/embed'}>
	{#if $page.url.pathname !== '/repl/embed'}
		<Nav logo="/svelte-logo.svg">
			<svelte:fragment slot="nav-center">
				{#if $page.url.pathname !== '/search'}
					<li><Search /></li>
				{/if}
			</svelte:fragment>

			<svelte:fragment slot="nav-right">
				<NavItem href="/tutorial">Tutorial</NavItem>
				<NavItem href="/docs/introduction">Docs</NavItem>
				<NavItem href="/examples">Examples</NavItem>
				<NavItem href="/repl">REPL</NavItem>
				<NavItem href="/blog">Blog</NavItem>
				<NavItem href="/faq">FAQ</NavItem>

				<Separator />

				<NavItem external="https://kit.svelte.dev">SvelteKit</NavItem>

				<NavItem external="/chat" title="Discord Chat">
					<span slot="small">Discord</span>
					<Icon name="message-square" />
				</NavItem>

				<NavItem external="https://github.com/sveltejs/svelte" title="GitHub Repo">
					<span slot="small">GitHub</span>
					<Icon name="github" />
				</NavItem>
			</svelte:fragment>
		</Nav>
	{/if}

	<slot />
</Shell>

{#if browser}
	<SearchBox />
{/if}

<style>
	:global(:root) {
		color-scheme: light dark;
	}

	@media (max-width: 830px) {
		:global(aside) {
			z-index: 9999 !important;
		}
	}

	:global(html, body) {
		height: 100%;
		width: 100%;
	}

	@media (max-width: 830px) {
		:global(aside) {
			z-index: 9999 !important;
		}
	}
</style>
