<script>
	import { get_repl_context } from '$lib/context.js';
	import { BROWSER } from 'esm-env';
	import { onMount } from 'svelte';
	import Message from '../Message.svelte';
	import PaneWithPanel from './PaneWithPanel.svelte';
	import ReplProxy from './ReplProxy.js';
	import Console from './console/Console.svelte';
	import getLocationFromStack from './get-location-from-stack';
	import srcdoc from './srcdoc/index.html?raw';
	import ErrorOverlay from './ErrorOverlay.svelte';

	/** @type {import('$lib/types').MessageDetails | null} */
	export let error;
	/** @type {string | null} */
	export let status;
	export let relaxed = false;
	export let injectedJS = '';
	export let injectedCSS = '';

	/** @type {'light' | 'dark'} */
	export let theme;

	const { bundle } = get_repl_context();

	/** @type {import('./console/console').Log[]} */
	let logs = [];

	/** @type {import('./console/console').Log[][]} */
	let log_group_stack = [];

	let current_log_group = logs;

	/** @type {HTMLIFrameElement} */
	let iframe;
	let pending_imports = 0;
	let pending = false;

	/** @type {ReplProxy | null} */
	let proxy = null;

	let ready = false;
	let inited = false;

	let log_height = 90;
	/** @type {number} */
	let prev_height;

	/** @type {import('./console/console').Log} */
	let last_console_event;

	onMount(() => {
		proxy = new ReplProxy(iframe, {
			on_fetch_progress: (progress) => {
				pending_imports = progress;
			},
			on_error: (event) => {
				push_logs({ level: 'error', args: [event.value] });
			},
			on_unhandled_rejection: (event) => {
				let error = event.value;
				if (typeof error === 'string') error = { message: error };
				error.message = 'Uncaught (in promise): ' + error.message;
				push_logs({ level: 'error', args: [error] });
			},
			on_console: (log) => {
				if (log.level === 'clear') {
					clear_logs();
					push_logs(log);
				} else if (log.duplicate) {
					increment_duplicate_log();
				} else {
					push_logs(log);
				}
			},
			on_console_group: (action) => {
				group_logs(action.label, false);
			},
			on_console_group_end: () => {
				ungroup_logs();
			},
			on_console_group_collapsed: (action) => {
				group_logs(action.label, true);
			}
		});

		iframe.addEventListener('load', () => {
			proxy?.handle_links();
			ready = true;
		});

		return () => {
			proxy?.destroy();
		};
	});

	$: if (ready) proxy?.iframe_command('set_theme', { theme });

	/**
	 * @param {import('$lib/types').Bundle | null} $bundle
	 */
	async function apply_bundle($bundle) {
		if (!$bundle) return;

		try {
			clear_logs();

			if (!$bundle.error) {
				await proxy?.eval(`
					${injectedJS}

					${styles}

					{
						const styles = document.querySelectorAll('style[id^=svelte-]');

						let i = styles.length;
						while (i--) styles[i].parentNode.removeChild(styles[i]);

						if (window.__unmount_previous) {
							try {
								window.__unmount_previous();
							} catch (err) {
								console.error(err);
							}
						}

						document.body.innerHTML = '';
						window._svelteTransitionManager = null;
					}

					const __repl_exports = ${$bundle.client?.code};
					{
						const { mount, unmount, App, untrack } = __repl_exports;

						const console_log = console.log

						console.log = function (...v) {
							return untrack(() => console_log.apply(this, v));
						}
						const component = mount(App, { target: document.body });
						window.__unmount_previous = () => unmount(component);
					}
					//# sourceURL=playground:output
				`);
				error = null;
			}
		} catch (e) {
			// @ts-ignore
			show_error(e);
		}

		inited = true;
	}

	$: if (ready) apply_bundle($bundle);

	$: styles =
		injectedCSS &&
		`{
		const style = document.createElement('style');
		style.textContent = ${JSON.stringify(injectedCSS)};
		document.head.appendChild(style);
	}`;

	/**
	 * @param {import('$lib/types').Error & { loc: { line: number; column: number } }} e
	 */
	function show_error(e) {
		const map = $bundle?.client?.map;

		// @ts-ignore INVESTIGATE
		const loc = map && getLocationFromStack(e.stack, map);
		if (loc) {
			e.filename = loc.source;
			e.loc = { line: loc.line, column: loc.column ?? 0 };
		}

		error = e;
	}

	/**
	 * @param {import('./console/console').Log} log
	 */
	function push_logs(log) {
		current_log_group.push((last_console_event = log));
		logs = logs;
	}

	/**
	 * @param {string} label
	 * @param {boolean} collapsed
	 */
	function group_logs(label, collapsed) {
		/** @type {import('./console/console').Log} */
		const group_log = { level: 'group', label, collapsed, logs: [] };
		current_log_group.push({ level: 'group', label, collapsed, logs: [] });
		// TODO: Investigate
		log_group_stack.push(current_log_group);
		current_log_group = group_log.logs ?? [];
		logs = logs;
	}

	function ungroup_logs() {
		const last = log_group_stack.pop();

		if (last) current_log_group = last;
	}

	function increment_duplicate_log() {
		const last_log = current_log_group[current_log_group.length - 1];

		if (last_log) {
			last_log.count = (last_log.count || 1) + 1;
			logs = logs;
		} else {
			last_console_event.count = 1;
			push_logs(last_console_event);
		}
	}

	function on_toggle_console() {
		if (log_height < 90) {
			prev_height = log_height;
			log_height = 90;
		} else {
			log_height = prev_height || 45;
		}
	}

	function clear_logs() {
		current_log_group = logs = [];
	}
</script>

<div class="iframe-container">
	<PaneWithPanel pos="90%" panel="Console">
		<div slot="main">
			<iframe
				title="Result"
				class:inited
				bind:this={iframe}
				sandbox={[
					'allow-popups-to-escape-sandbox',
					'allow-scripts',
					'allow-popups',
					'allow-forms',
					'allow-pointer-lock',
					'allow-top-navigation',
					'allow-modals',
					relaxed ? 'allow-same-origin' : ''
				].join(' ')}
				class={error || pending || pending_imports ? 'greyed-out' : ''}
				srcdoc={BROWSER ? srcdoc : ''}
			/>

			{#if $bundle?.error}
				<ErrorOverlay error={$bundle.error} />
			{/if}
		</div>

		<div slot="panel-header">
			<button on:click|stopPropagation={clear_logs}>
				{#if logs.length > 0}
					({logs.length})
				{/if}
				Clear
			</button>
		</div>

		<section slot="panel-body">
			<Console {logs} {theme} on:clear={clear_logs} />
		</section>
	</PaneWithPanel>

	<div class="overlay">
		{#if error}
			<Message kind="error" details={error} />
		{:else if status || !$bundle}
			<Message kind="info" truncate>{status || 'loading Svelte compiler...'}</Message>
		{/if}
	</div>
</div>

<style>
	.iframe-container {
		position: absolute;
		background-color: var(--sk-back-1, white);
		border: none;
		width: 100%;
		height: 100%;
	}

	iframe {
		width: 100%;
		height: 100%;
		border: none;
		display: block;
	}

	.greyed-out {
		filter: grayscale(50%) blur(1px);
		opacity: 0.25;
	}

	button {
		color: var(--sk-text-2, #999);
		font-size: 12px;
		text-transform: uppercase;
		display: block;
	}

	button:hover {
		color: var(--sk-text-1, #333);
	}

	.overlay {
		position: absolute;
		top: 0;
		width: 100%;
	}
</style>
