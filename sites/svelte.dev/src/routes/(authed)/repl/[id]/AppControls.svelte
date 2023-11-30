<script>
	import { createEventDispatcher, getContext } from 'svelte';
	import UserMenu from './UserMenu.svelte';
	import { Icon } from '@sveltejs/site-kit/components';
	import * as doNotZip from 'do-not-zip';
	import downloadBlob from './downloadBlob.js';
	import { enter } from '$lib/utils/events.js';
	import { isMac } from '$lib/utils/compat.js';

	const dispatch = createEventDispatcher();
	const { login } = getContext('app');

	export let user;

	/** @type {import('@sveltejs/repl').default} */
	export let repl;
	export let gist;
	export let name;
	export let zen_mode;
	export let modified_count;

	let saving = false;
	let downloading = false;
	let justSaved = false;
	let justForked = false;

	function wait(ms) {
		return new Promise((f) => setTimeout(f, ms));
	}

	$: canSave = user && gist && gist.owner === user.id;

	function handleKeydown(event) {
		if (event.key === 's' && (isMac ? event.metaKey : event.ctrlKey)) {
			event.preventDefault();
			save();
		}
	}

	async function fork(intentWasSave) {
		saving = true;

		const { files } = repl.toJSON();

		try {
			const r = await fetch(`/repl/create.json`, {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name,
					files: files.map((file) => ({
						name: `${file.name}.${file.type}`,
						source: file.source
					}))
				})
			});

			if (r.status < 200 || r.status >= 300) {
				const { error } = await r.json();
				throw new Error(`Received an HTTP ${r.status} response: ${error}`);
			}

			const gist = await r.json();
			dispatch('forked', { gist });

			modified_count = 0;
			repl.markSaved();

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
		if (!user) {
			alert('Please log in before saving your app');
			return;
		}
		if (saving) return;

		if (!canSave) {
			fork(true);
			return;
		}

		saving = true;

		try {
			// Send all files back to API
			// ~> Any missing files are considered deleted!
			const { files } = repl.toJSON();

			const r = await fetch(`/repl/save/${gist.id}.json`, {
				method: 'PUT',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name,
					files: files.map((file) => ({
						name: `${file.name}.${file.type}`,
						source: file.source
					}))
				})
			});

			if (r.status < 200 || r.status >= 300) {
				const { error } = await r.json();
				throw new Error(`Received an HTTP ${r.status} response: ${error}`);
			}

			modified_count = 0;
			repl.markSaved();
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

		const { files: components, imports } = repl.toJSON();

		const files = await (await fetch('/svelte-app.json')).json();

		if (imports.length > 0) {
			const idx = files.findIndex(({ path }) => path === 'package.json');
			const pkg = JSON.parse(files[idx].data);
			const { devDependencies } = pkg;
			imports.forEach((mod) => {
				const match = /^(@[^/]+\/)?[^@/]+/.exec(mod);
				devDependencies[match[0]] = 'latest';
			});
			pkg.devDependencies = devDependencies;
			files[idx].data = JSON.stringify(pkg, null, '  ');
		}

		files.push(
			...components.map((component) => ({
				path: `src/${component.name}.${component.type}`,
				data: component.source
			}))
		);
		files.push({
			path: `src/main.js`,
			data: `import App from './App.svelte';

var app = new App({
	target: document.body
});

export default app;`
		});

		downloadBlob(doNotZip.toBlob(files), 'svelte-app.zip');

		downloading = false;
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="app-controls">
	<input bind:value={name} on:focus={(e) => e.target.select()} use:enter={(e) => /** @type {HTMLInputElement} */ (e.target).blur()} />

	<div class="buttons">
		<button class="icon" on:click={() => (zen_mode = !zen_mode)} title="fullscreen editor">
			{#if zen_mode}
				<Icon name="close" />
			{:else}
				<Icon name="maximize" />
			{/if}
		</button>

		<button class="icon" disabled={downloading} on:click={download} title="download zip file">
			<Icon name="download" />
		</button>

		<button class="icon" disabled={saving || !user} on:click={() => fork(false)} title="fork">
			{#if justForked}
				<Icon name="check" />
			{:else}
				<Icon name="git-branch" />
			{/if}
		</button>

		<button class="icon" disabled={saving || !user} on:click={save} title="save">
			{#if justSaved}
				<Icon name="check" />
			{:else}
				<Icon name="save" />
				{#if modified_count}
					<div class="badge">{modified_count}</div>
				{/if}
			{/if}
		</button>

		{#if user}
			<UserMenu {user} />
		{:else}
			<button class="icon" on:click|preventDefault={login}>
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
		padding: 0.6rem var(--sk-page-padding-side);
		background-color: var(--sk-back-4);
		color: var(--sk-text-1);
		white-space: nowrap;
		flex: 0;
	}

	.buttons {
		text-align: right;
		margin-right: 0.4rem;
		display: flex;
		align-items: center;
		gap: 0.2em;
	}

	.icon {
		transform: translateY(0.1rem);
		display: inline-block;
		padding: 0.2em;
		opacity: 0.7;
		transition: opacity 0.3s;
		font-family: var(--sk-font);
		font-size: 1.6rem;
		color: var(--sk-text-1);
		line-height: 1;
	}

	.icon:hover,
	.icon:focus-visible {
		opacity: 1;
	}
	.icon:disabled {
		opacity: 0.3;
	}

	.icon[title^='fullscreen'] {
		display: none;
	}

	input {
		background: transparent;
		border: none;
		color: currentColor;
		font-family: var(--sk-font);
		font-size: 1.6rem;
		opacity: 0.7;
		outline: none;
		flex: 1;
		margin: 0 0.2em 0 0.4rem;
		padding-top: 0.2em;
		border-bottom: 1px solid transparent;
	}

	input:hover {
		border-bottom: 1px solid currentColor;
		opacity: 1;
	}
	input:focus {
		border-bottom: 1px solid currentColor;
		opacity: 1;
	}

	button span {
		display: none;
	}

	.badge {
		background: #ff3e00;
		border-radius: 100%;
		font-size: 10px;
		padding: 0;
		width: 15px;
		height: 15px;
		line-height: 15px;
		position: absolute;
		top: 10px;
		right: 0px;
	}

	@media (min-width: 600px) {
		.icon[title^='fullscreen'] {
			display: inline;
		}

		button span {
			display: inline-block;
		}
	}
</style>
