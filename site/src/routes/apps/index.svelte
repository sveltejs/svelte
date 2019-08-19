<script context="module">
	export async function preload(page, { user }) {
		let apps = [];
		let offset = null;

		if (user) {
			var url = 'apps.json';
			if (page.query.offset) {
				url += `?offset=${encodeURIComponent(page.query.offset)}`;
			}
			const r = await this.fetch(url, {
				credentials: 'include'
			});
			if (!r.ok) return this.error(r.status, await r.text());

			({ apps, offset } = await r.json());
		}

		return { user, apps, offset };
	}
</script>

<script>
	import { getContext } from 'svelte';

	export let user;
	export let apps;
	export let offset;

	const { login, logout } = getContext('app');

	const formatter = new Intl.DateTimeFormat(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit'
	});

	const format = str => formatter.format(new Date(str));
</script>

<svelte:head>
	<title>Your apps • Svelte</title>
</svelte:head>

<div class="apps">
	{#if user}
		<header>
			<h1>Your apps</h1>

			<div class="user">
				<img class="avatar" alt="{user.name} avatar" src="{user.avatar}">
				<span>
					{user.name}
					(<a on:click|preventDefault={logout} href="auth/logout">log out</a>)
				</span>
			</div>
		</header>

		<ul>
			{#each apps as app}
				<li>
					<a href="repl/{app.uid}">
						<h2>{app.name}</h2>
						<span>updated {format(app.updated_at)}</span>
					</a>
				</li>
			{/each}
		</ul>

		{#if offset !== null}
			<div><a href="apps?offset={offset}">Next page...</a></div>
		{/if}
	{:else}
		<p>Please <a on:click|preventDefault={login} href="auth/login">log in</a> to see your saved apps.</p>
	{/if}
</div>

<style>
	.apps {
		padding: var(--top-offset) var(--side-nav) 6rem var(--side-nav);
		max-width: var(--main-width);
		margin: 0 auto;
	}

	header {
		margin: 0 0 1em 0;
	}

	h1 {
		font-size: 4rem;
		font-weight: 400;
	}

	.user {
		display: flex;
		padding: 0 0 0 3.2rem;
		position: relative;
		margin: 1rem 0 5rem 0;
		color: var(--text);
	}

	.avatar {
		position: absolute;
		left: 0;
		top: 0.1rem;
		width: 2.4rem;
		height: 2.4rem;
		border: 1px solid rgba(0,0,0,0.3);
		border-radius: 0.2rem;
	}

	ul {
		list-style: none;
	}

	li {
		margin: 0 0 1em 0;
	}

	h2 {
		color: var(--text);
		font-size: var(--h3);
		font-weight: 400;
	}

	li a {
		border: none;
	}

	li a:hover h2 {
		color: var(--flash);
	}

	li span {
		font-size: 14px;
		color: #999;
	}
</style>
