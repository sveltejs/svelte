<script>
	import { getContext } from 'svelte';
	import { stores } from '@sapper/app';
	const { session } = stores();

	const { logout } = getContext('app');

	let showMenu = false;
	let name;

	$: name = $session.user.name || $session.user.username;
</script>

<div class="user" on:mouseenter="{() => showMenu = true}" on:mouseleave="{() => showMenu = false}">
	<span>{name}</span>
	<img alt="{name} avatar" src="{$session.user.avatar}">

	{#if showMenu}
		<div class="menu">
			<a href="apps">Your saved apps</a>
			<button on:click={logout}>Log out</button>
		</div>
	{/if}
</div>

<style>
	.user {
		position: relative;
		display: inline-block;
		padding: 0em 1.2rem 0 1.6rem;
		height: 0.8em;
		line-height: 1;
		z-index: 99;
	}

	.user::after {
		/* embiggen hit zone, so log out menu doesn't disappear */
		position: absolute;
		content: '';
		width: 100%;
		height: 3.2rem;
		left: 0;
		top: 0;
	}

	span {
		/* position: relative; padding: 0 2em 0 0; */
		line-height: 1;
		display: none;
		font-family: var(--font);
		font-size: 1.6rem;
		opacity: 0.7;
	}

	.user:hover span {
		opacity: 1;
	}

	img {
		position: absolute;
		top: -0.05em;
		right: 0;
		width: 2.1rem;
		height: 2.1rem;
		border: 1px solid rgba(255,255,255,0.3);
		border-radius: 0.2rem;
	}

	.menu {
		position: absolute;
		width: calc(100% + 1.6rem);
		min-width: 10em;
		top: 3rem;
		right: -1.6rem;
		background-color: var(--second);
		padding: 0.8rem 1.6rem;
		z-index: 99;
		text-align: left;
		border-radius: 0.4rem;
		display: flex;
		flex-direction: column;
	}

	.menu button, .menu a {
		background-color: transparent;
		font-family: var(--font);
		font-size: 1.6rem;
		opacity: 0.7;
		padding: 0.4rem 0;
		text-decoration: none;
		text-align: left;
		border: none;
		color: inherit;
	}

	.menu button:hover, .menu a:hover {
		opacity: 1;
		color: inherit;
	}

	@media (min-width: 600px) {
		.user {
			padding: 0em 3.2rem 0 1.6rem;
		}

		img {
			width: 2.4rem;
			height: 2.4rem;
		}

		span {
			display: inline-block;
		}
	}
</style>
