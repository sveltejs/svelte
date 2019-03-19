<script>
	import { onMount, createEventDispatcher, getContext } from 'svelte';
	import getLocationFromStack from './getLocationFromStack.js';
	import ReplProxy from './ReplProxy.js';
	import Message from '../Message.svelte';
	import { decode } from 'sourcemap-codec';

	const dispatch = createEventDispatcher();
	const { bundle, navigate } = getContext('REPL');

	export let error; // TODO should this be exposed as a prop?

	export function setProp(prop, value) {
		if (!proxy) return;
		proxy.setProp(prop, value);
	}

	let iframe;
	let pending_imports = 0;
	let pending = false;

	let proxy = null;

	let ready = false;
	let inited = false;

	onMount(() => {
		proxy = new ReplProxy(iframe, {
			on_fetch_progress: progress => {
				pending_imports = progress;
			}
		});

		iframe.addEventListener('load', () => {
			proxy.handle_links();
			ready = true;
		});

		return () => {
			proxy.destroy();
		}
	});

	let current_token;

	async function apply_bundle($bundle) {
		if (!$bundle || $bundle.error) return;

		const token = current_token = {};

		try {
			await proxy.fetch_imports($bundle.imports, $bundle.import_map);
			if (token !== current_token) return;

			await proxy.eval(`
				// needed for context API tutorial
				window.MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

				const styles = document.querySelectorAll('style[id^=svelte-]');

				${$bundle.dom.code}

				let i = styles.length;
				while (i--) styles[i].parentNode.removeChild(styles[i]);

				if (window.component) {
					try {
						window.component.$destroy();
					} catch (err) {
						console.error(err);
					}
				}

				document.body.innerHTML = '';
				window.location.hash = '';
				window._svelteTransitionManager = null;

				window.component = new SvelteComponent.default({
					target: document.body
				});
			`);

			error = null;
		} catch (e) {
			const loc = getLocationFromStack(e.stack, $bundle.dom.map);
			if (loc) {
				e.filename = loc.source;
				e.loc = { line: loc.line, column: loc.column };
			}

			error = e;
		}

		inited = true;
	}

	$: if (ready) apply_bundle($bundle);
</script>

<style>
	.iframe-container {
		position: absolute;
		background-color: white;
		border: none;
		width: 100%;
		height: 100%;
	}

	iframe {
		width: 100%;
		height: 100%;
		/* height: calc(100vh - var(--nav-h)); */
		border: none;
		display: block;
	}

	.greyed-out {
		filter: grayscale(50%) blur(1px);
		opacity: .25;
	}

	.overlay {
		position: absolute;
		bottom: 0;
		width: 100%;
	}
</style>

<div class="iframe-container">
	<iframe title="Result" class:inited bind:this={iframe} sandbox="allow-popups-to-escape-sandbox allow-scripts allow-popups allow-forms allow-pointer-lock allow-top-navigation allow-modals" class="{error || pending || pending_imports ? 'greyed-out' : ''}" srcdoc='
		<!doctype html>
		<html>
			<head>
				<link rel="stylesheet" href="/repl-viewer.css">
			</head>
			<body>
				<script src="/curl.js"></script>
				<script>curl.config(&#123; dontAddFileExt: /./ });</script>
				<script src="/repl-runner.js"></script>
			</body>
		</html>
	'></iframe>

	<div class="overlay">
		{#if error}
			<Message kind="error" details={error}/>
		{:else if !$bundle}
			<Message kind="info">loading Svelte compiler...</Message>
		{:else if pending_imports}
			<Message kind="info">loading {pending_imports} {pending_imports === 1 ? 'dependency' : 'dependencies'} from
			https://bundle.run</Message>
		{/if}
	</div>
</div>