<script>
	import { createEventDispatcher } from 'svelte';
	import UserMenu from './UserMenu.svelte';
	import { Icon } from '@sveltejs/site-kit';
	import * as doNotZip from 'do-not-zip';
	import downloadBlob from '../../../_utils/downloadBlob.js';
	import { user } from '../../../../../user.js';
	import { enter } from '../../../../../utils/events.js';
	import { isMac } from '../../../../../utils/compat.js';

	const dispatch = createEventDispatcher();

	export let repl;
	export let gist;
	export let name;
	export let zen_mode;
	export let bundle;

	let saving = false;
	let downloading = false;
	let justSaved = false;
	let justForked = false;

	function wait(ms) {
		return new Promise(f => setTimeout(f, ms));
	}

	$: Authorization = $user && `Bearer ${$user.token}`;
	$: canSave = $user && gist && gist.owner === $user.uid;

	function handleKeydown(event) {
		if (event.which === 83 && (isMac ? event.metaKey : event.ctrlKey)) {
			event.preventDefault();
			save();
		}
	}

	function login(event) {
		event.preventDefault();
		const loginWindow = window.open(`${window.location.origin}/auth/login`, 'login', 'width=600,height=400');

		const handleLogin = event => {
			loginWindow.close();
			user.set(event.data.user);
			window.removeEventListener('message', handleLogin);
		};

		window.addEventListener('message', handleLogin);
	}

	async function fork(intentWasSave) {
		saving = true;

		const { components } = repl.toJSON();

		try {
			const r = await fetch(`repl/create.json`, {
				method: 'POST',
				headers: { Authorization },
				body: JSON.stringify({
					name,
					files: components.map(component => ({
						name: `${component.name}.${component.type}`,
						source: component.source
					}))
				})
			});

			if (r.status < 200 || r.status >= 300) {
				const { error } = await r.json();
				throw new Error(`Received an HTTP ${r.status} response: ${error}`);
			}

			const gist = await r.json();
			dispatch('forked', { gist });

			if (intentWasSave) {
				justSaved = true;
				await wait(600);
				justSaved = false;
			} else {
				justForked = true;
				await wait(600);
				justForked = false;
			}
		} catch (err) {
			if (navigator.onLine) {
				alert(err.message);
			} else {
				alert(`It looks like you're offline! Find the internet and try again`);
			}
		}

		saving = false;
	}

	async function save() {
		if (saving) return;

		if (!canSave) {
			fork(true);
			return;
		}

		saving = true;

		try {
			// Send all files back to API
			// ~> Any missing files are considered deleted!
			const files = {};
			const { components } = repl.toJSON();

			const r = await fetch(`repl/${gist.uid}.json`, {
				method: 'PATCH',
				headers: { Authorization },
				body: JSON.stringify({
					name,
					files: components.map(component => ({
						name: `${component.name}.${component.type}`,
						source: component.source
					}))
				})
			});

			if (r.status < 200 || r.status >= 300) {
				const { error } = await r.json();
				throw new Error(`Received an HTTP ${r.status} response: ${error}`);
			}

			const result = await r.json();

			justSaved = true;
			await wait(600);
			justSaved = false;
		} catch (err) {
			if (navigator.onLine) {
				alert(err.message);
			} else {
				alert(`It looks like you're offline! Find the internet and try again`);
			}
		}

		saving = false;
	}

	async function download() {
		downloading = true;

		const { components, imports } = repl.toJSON();

		const files = await (await fetch('/svelte-app.json')).json();

		if (imports.length > 0) {
			const idx = files.findIndex(({ path }) => path === 'package.json');
			const pkg = JSON.parse(files[idx].data);
			const deps = {};
			imports.forEach(mod => {
				const match = /^(@[^\/]+\/)?[^@\/]+/.exec(mod);
				deps[match[0]] = 'latest';
			});
			pkg.dependencies = deps;
			files[idx].data = JSON.stringify(pkg, null, '  ');
		}

		files.push(...components.map(component => ({ path: `src/${component.name}.${component.type}`, data: component.source })));
		files.push({
			path: `src/main.js`, data: `import App from './App.svelte';

var app = new App({
	target: document.body
});

export default app;` });

		downloadBlob(doNotZip.toBlob(files), 'svelte-app.zip');

		downloading = false;
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="app-controls">
	<input
		bind:value={name}
		on:focus="{e => e.target.select()}"
		use:enter="{e => e.target.blur()}"
	>

	<div style="text-align: right; margin-right:.4rem">
		<button class="icon" on:click="{() => zen_mode = !zen_mode}" title="fullscreen editor">
			{#if zen_mode}
				<Icon name="close" />
			{:else}
				<Icon name="maximize" />
			{/if}
		</button>

		<button class="icon" disabled={downloading} on:click={download} title="download zip file">
			<Icon name="download" />
		</button>

		<button class="icon" disabled="{saving || !$user}" on:click={() => fork(false)} title="fork">
			{#if justForked}
				<Icon name="check" />
			{:else}
				<Icon name="git-branch" />
			{/if}
		</button>

		<button class="icon" disabled="{saving || !$user}" on:click={save} title="save">
			{#if justSaved}
				<Icon name="check" />
			{:else}
				<Icon name="save" />
			{/if}
		</button>

		{#if $user}
			<UserMenu />
		{:else}
			<button class="icon" on:click={login}>
				<Icon name="log-in" />
				<span>&nbsp;Log in to save</span>
			</button>
		{/if}
	</div>
</div>

<style>
	.app-controls {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: var(--app-controls-h);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: .6rem var(--side-nav);
		background-color: var(--second);
		color: white;
	}

	.icon {
		position: relative;
		top: -0.1rem;
		display: inline-block;
		padding: 0.2em;
		opacity: .7;
		transition: opacity .3s;
		font-family: var(--font);
		font-size: 1.6rem;
		color: white;
		/* width: 1.6em;
		height: 1.6em; */
		line-height: 1;
		margin: 0 0 0 0.2em;
	}

	.icon:hover    { opacity: 1 }
	.icon:disabled { opacity: .3 }

	.icon[title^='fullscreen'] { display: none }

	input {
		background: transparent;
		border: none;
		color: currentColor;
		font-family: var(--font);
		font-size: 1.6rem;
		opacity: 0.7;
		outline: none;
		flex: 1;
	}

	input:focus {
		opacity: 1;
	}

	button span {
		display: none;
	}

	@media (min-width: 600px) {
		.icon[title^='fullscreen'] { display: inline }

		button span {
			display: inline-block;
		}
	}
</style>
