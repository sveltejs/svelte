<script>
	import { getContext } from 'svelte';
	import { Icon } from '@sveltejs/site-kit/components';
	import { click_outside, focus_outside } from '@sveltejs/site-kit/actions';
	const { logout } = getContext('app');

	export let user;

	let showMenu = false;
	let name;

	$: name = user.github_name || user.github_login;
</script>

<div
	class="user"
	use:focus_outside={() => (showMenu = false)}
	use:click_outside={() => (showMenu = false)}
>
	<button
		on:click={() => (showMenu = !showMenu)}
		aria-expanded={showMenu}
		class="trigger"
		aria-label={name}
	>
		<span class="name">{name}</span>
		<img alt="" src={user.github_avatar_url} />
		<Icon name={showMenu ? 'chevron-up' : 'chevron-down'} />
	</button>

	{#if showMenu}
		<div class="menu">
			<a href="/apps">Your saved apps</a>
			<button on:click={logout}>Log out</button>
		</div>
	{/if}
</div>

<style>
	.user {
		position: relative;
		display: inline-block;
		padding: 0em 0 0 0.3rem;
		z-index: 99;
	}

	.trigger {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		outline-offset: 2px;
		transform: translateY(0.1rem);
		--opacity: 0.7;
	}

	.trigger:hover,
	.trigger:focus-visible,
	.trigger[aria-expanded='true'] {
		--opacity: 1;
	}

	.name {
		line-height: 1;
		display: none;
		font-family: var(--sk-font);
		font-size: 1.6rem;
	}

	.name,
	.trigger :global(.icon) {
		display: none;
		opacity: var(--opacity);
	}

	img {
		width: 2.1rem;
		height: 2.1rem;
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 0.2rem;
		transform: translateY(-0.1rem);
	}

	.menu {
		position: absolute;
		width: calc(100% + 1.6rem);
		min-width: 10em;
		top: 3rem;
		right: -1.6rem;
		background-color: var(--sk-back-2);
		padding: 0.8rem 1.6rem;
		z-index: 99;
		text-align: left;
		border-radius: 0.4rem;
		display: flex;
		flex-direction: column;
	}

	.menu button,
	.menu a {
		background-color: transparent;
		font-family: var(--sk-font);
		font-size: 1.6rem;
		opacity: 0.7;
		padding: 0.4rem 0;
		text-decoration: none;
		text-align: left;
		border: none;
		color: var(--sk-text-2);
	}

	.menu button:hover,
	.menu button:focus-visible,
	.menu a:hover,
	.menu a:focus-visible {
		opacity: 1;
		color: inherit;
	}

	@media (min-width: 600px) {
		.user {
			padding: 0em 0 0 1.6rem;
		}

		img {
			width: 2.4rem;
			height: 2.4rem;
		}

		.name,
		.trigger :global(.icon) {
			display: inline-block;
		}
	}
</style>
