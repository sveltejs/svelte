<script>
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import getLocationFromStack from '../../_utils/getLocationFromStack.js';
	import ReplProxy from '../../_utils/replProxy.js';
	import { decode } from 'sourcemap-codec';

	const dispatch = createEventDispatcher();

	export let bundle;
	export let dom;
	export let ssr;
	export let values_store;
	export let props;
	export let sourceError;
	export let error;

	export function setProp(prop, value) {
		if (!replProxy) return;
		replProxy.setProp(prop, value);
	}		

	let hasComponent = false;

	const refs = {};
	let pendingImports = 0;
	let pending = false;

	let replProxy = null;


	const namespaceSpecifier = /\*\s+as\s+(\w+)/;
	const namedSpecifiers = /\{(.+)\}/;

	function parseSpecifiers(specifiers) {
		specifiers = specifiers.trim();

		let match = namespaceSpecifier.exec(specifiers);
		if (match) {
			return {
				namespace: true,
				name: match[1]
			};
		}

		let names = [];

		specifiers = specifiers.replace(namedSpecifiers, (match, str) => {
			names = str.split(',').map(name => {
				const split = name.split('as');
				const exported = split[0].trim();
				const local = (split[1] || exported).trim();

				return { local, exported };
			});

			return '';
		});

		match = /\w+/.exec(specifiers);

		return {
			namespace: false,
			names,
			default: match ? match[0] : null
		};
	}

	let createComponent;
	let init;
	onDestroy(() => {
		if (replProxy) {
			replProxy.destroy();
		}
	});
	onMount(() => {
		replProxy = new ReplProxy(refs.child);
	
		refs.child.addEventListener('load', () => {

			replProxy.onPropUpdate = (prop, value) => {
				dispatch('binding', { prop, value });
				values_store.update(values => Object.assign({}, values, {
						[prop]: value
				}));
			};

			replProxy.onFetchProgress = (progress) => {
				pendingImports = progress
			}
			
			replProxy.handleLinks();
			
			let promise = null;
			let updating = false;

			let toDestroy = null;

			const init = () => {
				if (sourceError) return;

				const removeStyles = () => {
					replProxy.eval(`
						const styles = document.querySelectorAll('style.svelte');
						let i = styles.length;
						while (i--) styles[i].parentNode.removeChild(styles[i]);
					`)
				};

				const destroyComponent = () => {
					replProxy.eval(`if (window.component)
										 window.component.\$destroy(); 
									window.component = null`);
				};

				const ready = () => {
					error = null;

					if (toDestroy) {
						removeStyles();
						destroyComponent();
						toDestroy = null;
					}
			
					if (ssr) { // this only gets generated if component uses lifecycle hooks
						pending = true;
						createHtml();
					} else {
						pending = false;
						createComponent();
					}
				}

				const createHtml = () => {
					replProxy.eval(`${ssr.code}
						var rendered = SvelteComponent.render(${JSON.stringify($values_store)});

						if (rendered.css.code) {
							var style = document.createElement('style');
							style.className = 'svelte';
							style.textContent = rendered.css.code;
							document.head.appendChild(style);
						}

						document.body.innerHTML = rendered.html;
					`)
					.catch( e => {
						const loc = getLocationFromStack(e.stack, ssr.map);
						if (loc) {
							e.filename = loc.source;
							e.loc = { line: loc.line, column: loc.column };
						}

						error = e;
					});
				};
				
				const createComponent = () => {
					// remove leftover styles from SSR renderer
					if (ssr) removeStyles();

					replProxy.eval(`${dom.code}
						document.body.innerHTML = '';
						window.location.hash = '';
						window._svelteTransitionManager = null;

						window.component = new SvelteComponent({
							target: document.body,
							props: ${JSON.stringify($values_store)}
						});
					`)
					.then(()=> {
						replProxy.bindProps(props);
					})
					.catch(e => {
						// TODO show in UI
						hasComponent = false;

						const loc = getLocationFromStack(e.stack, dom.map);
						if (loc) {
							e.filename = loc.source;
							e.loc = { line: loc.line, column: loc.column };
						}

						error = e;
					});
				};
				
				// Download the imports (sets them on iframe window when complete)
			 	{
					let cancelled = false;
					promise = replProxy.fetchImports(bundle);
					promise.cancel = () => { cancelled = true };
					promise.then(() => {
							if (cancelled) return;
							ready()
						}).catch(e => {
							if (cancelled) return;
							error = e;
						});
				}
		
				run = () => {
					pending = false;

					// TODO do we need to clear out SSR HTML?
					createComponent();
					props_handler = props => {
						replProxy.bindProps(props)
					};
					replProxy.bindProps(props);
				};
			}

			bundle_handler = bundle => {
				if (!bundle) return; // TODO can this ever happen?
				if (promise) promise.cancel();

				toDestroy = hasComponent;
				hasComponent = false;

				init();
			};

			
		});
	});

	function noop(){}
	let run = noop;
	let bundle_handler = noop;
	let props_handler = noop;

	$: bundle_handler(bundle);
	$: props_handler(props);

	// pending https://github.com/sveltejs/svelte/issues/1889
	$: {
		$values_store;
	}
</script>

<style>
	.iframe-container {
		background-color: white;
		border: none;
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
		top: 0;
		width: 100%;
		height: 100%;
		padding: 1em;
		pointer-events: none;
	}

	.overlay p {
		pointer-events: all;
	}

	.pending {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		text-align: center;
		pointer-events: all;
	}

	.pending button {
		position: absolute;
		margin-top: 6rem;
	}
</style>

<div class="iframe-container">
	<iframe title="Result" bind:this={refs.child} sandbox="allow-scripts allow-popups allow-forms allow-pointer-lock allow-top-navigation allow-modals" class="{error || pending || pendingImports ? 'greyed-out' : ''}" srcdoc='
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
</div>

<div class="overlay">
	{#if error}
		<p class="error message">
			{#if error.loc}
			<strong>
				{#if error.filename}
					<span class="filename" on:click="{() => dispatch('navigate', { filename: error.filename })}">{error.filename}</span>
				{/if}

				({error.loc.line}:{error.loc.column})
			</strong>
			{/if}

			{error.message}
		</p>
	{:elseif pending}
		<div class="pending" on:click={run}>
			<button class="bg-second white">Click to run</button>
		</div>
	{:elseif pendingImports}
		<p class="info message">loading {pendingImports} {pendingImports === 1 ? 'dependency' : 'dependencies'} from
		https://bundle.run</p>
	{/if}
</div>