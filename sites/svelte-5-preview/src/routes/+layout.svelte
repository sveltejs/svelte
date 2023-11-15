<script>
	import { page } from '$app/stores';
	import { Icon, Shell } from '@sveltejs/site-kit/components';
	import { Nav, Separator } from '@sveltejs/site-kit/nav';
	import '@sveltejs/site-kit/styles/index.css';

	export let data;
</script>

<svelte:head>
	<title>Svelte 5 preview</title>

	<!-- TODO separate og image? -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:image" content="https://svelte.dev/images/twitter-thumbnail.jpg" />
	<meta name="og:image" content="https://svelte.dev/images/twitter-thumbnail.jpg" />
</svelte:head>

<Shell nav_visible={$page.url.pathname !== '/repl/embed'}>
	<Nav slot="top-nav" title={$page.data.nav_title} links={data.nav_links}>
		<svelte:fragment slot="home-large">
			<strong>Preview</strong>
		</svelte:fragment>

		<svelte:fragment slot="home-small">
			<strong>Preview</strong>
		</svelte:fragment>

		<svelte:fragment slot="search">
			<div class="disclaimer">
				<span class="show-when-small">Work in progress!</span>
				<span class="show-when-large">Work in progress. Expect bugs!</span>
			</div>
		</svelte:fragment>

		<svelte:fragment slot="external-links">
			<a href="https://svelte.dev">Svelte</a>

			<Separator />

			<a href="https://svelte.dev/chat" title="Discord Chat">
				<span class="small">Discord</span>
				<span class="large"><Icon name="discord" /></span>
			</a>

			<a href="https://github.com/sveltejs/svelte" title="GitHub Repo">
				<span class="small">GitHub</span>
				<span class="large"><Icon name="github" /></span>
			</a>
		</svelte:fragment>
	</Nav>

	<slot />
</Shell>

<style>
	:global(:root) {
		color-scheme: light dark;
	}

	:global(html, body) {
		height: 100%;
		width: 100%;
	}

	.disclaimer {
		height: 100%;
		display: flex;
		align-items: center;
	}

	.disclaimer > span {
		font-size: 1.4rem;
		font-weight: bold;
		text-transform: uppercase;
		color: var(--sk-theme-1);
		padding: 0 1rem;
	}

	.show-when-large {
		display: none;
	}

	@media (min-width: 1200px) {
		.show-when-small {
			display: none;
		}

		.show-when-large {
			display: inline;
		}
	}

	/* site-kit overrides */
	:global(button.search[aria-label='Search']) {
		display: none;
	}
</style>
