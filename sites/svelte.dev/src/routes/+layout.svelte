<script>
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { Icon, Shell } from '@sveltejs/site-kit/components';
	import { Nav, NavItem, Separator } from '@sveltejs/site-kit/nav';
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

<div style:display={$page.url.pathname !== '/docs' ? 'contents' : 'none'}>
	<Shell nav_visible={$page.url.pathname !== '/repl/embed'}>
		<Nav slot="top-nav">
			<svelte:fragment slot="home-large">
				<strong>svelte</strong>.dev
			</svelte:fragment>

			<svelte:fragment slot="home-small">
				<strong>svelte</strong>
			</svelte:fragment>

			<svelte:fragment slot="nav-center">
				{#if $page.url.pathname !== '/search'}
					<li><Search /></li>
				{/if}
			</svelte:fragment>

			<svelte:fragment slot="nav-right">
				<NavItem
					href="/tutorial"
					selected={$page.url.pathname.startsWith('/tutorial') || null}
					relatedMenuName="tutorial"
				>
					Tutorial
				</NavItem>

				<NavItem
					href="/docs/introduction"
					selected={$page.url.pathname.startsWith('/docs') || null}
					relatedMenuName="docs"
				>
					Docs
				</NavItem>

				<NavItem
					href="/examples"
					selected={$page.url.pathname.startsWith('/examples') || null}
					relatedMenuName="examples"
				>
					Examples
				</NavItem>

				<NavItem href="/repl" selected={$page.url.pathname.startsWith('/repl') || null}>
					REPL
				</NavItem>

				<NavItem
					href="/blog"
					selected={$page.url.pathname.startsWith('/blog') || null}
					relatedMenuName="blog"
				>
					Blog
				</NavItem>

				<Separator />

				<NavItem href="https://kit.svelte.dev" external>SvelteKit</NavItem>

				<NavItem href="/chat" external title="Discord Chat">
					<span slot="small">Discord</span>
					<Icon name="discord" />
				</NavItem>

				<NavItem href="https://github.com/sveltejs/svelte" external title="GitHub Repo">
					<span slot="small">GitHub</span>
					<Icon name="github" />
				</NavItem>
			</svelte:fragment>
		</Nav>

		<slot />
	</Shell>
</div>

{#if browser}
	<SearchBox />
{/if}

<style>
	:global(:root) {
		color-scheme: light dark;
	}

	:global(html, body) {
		height: 100%;
		width: 100%;
	}
</style>
