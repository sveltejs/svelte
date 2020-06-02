<script>
	import { setContext } from 'svelte';
	import { stores } from '@sapper/app';
	import { Icon, Icons, Nav, NavItem } from '@sveltejs/site-kit';
	import PreloadingIndicator from '../components/PreloadingIndicator.svelte';

	export let segment;

	const { page, preloading, session } = stores();

	setContext('app', {
		login: () => {
			const login_window = window.open(`${window.location.origin}/auth/login`, 'login', 'width=600,height=400');

			window.addEventListener('message', function handler(event) {
				login_window.close();
				window.removeEventListener('message', handler);
				$session.user = event.data.user;
			});
		},

		logout: async () => {
			const r = await fetch(`/auth/logout`, {
				credentials: 'include'
			});

			if (r.ok) $session.user = null;
		}
	});
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
	<div class="BLM">Black Lives Matter. 
		<a
			target="_blank"
			rel="noopener noreferrer"
			href="https://support.eji.org/give/153413/#!/donation/checkout">
			Support&nbsp;the&nbsp;Equal&nbsp;Justice&nbsp;Initiative.
		</a>
	</div>
{/if}

<main>
	<slot></slot>
</main>

<style>
	.BLM {
		background-color: black;
		color: white;
    position: fixed;
    bottom: 0;
    width: 100vw;
    text-align: center;
    padding: 1em;
    z-index: 999;
	}
	:global(header){
		filter: grayscale(100%) /* BLM */
	}
	main {
		position: relative;
		margin: 0 auto;
		/* padding: var(--nav-h) var(--side-nav) 0 var(--side-nav); */
		padding: var(--nav-h) 0 0 0;
		overflow-x: hidden;
		filter: grayscale(100%) /* BLM */
	}
</style>
