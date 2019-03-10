<script>
	import { getContext, onMount } from 'svelte';
	import SplitPane from '../SplitPane.svelte';
	import Viewer from './Viewer.svelte';
	import CompilerOptions from './CompilerOptions.svelte';
	import Compiler from './Compiler.js';
	import CodeMirror from '../CodeMirror.svelte';

	const { values, register_output } = getContext('REPL');

	export let version;
	export let sourceErrorLoc;
	export let runtimeError;
	export let embedded;

	let compile_options = {
		generate: 'dom',
		dev: false,
		css: false,
		hydratable: false,
		customElement: false,
		immutable: false,
		legacy: false
	};

	register_output({
		set: async selected => {
			if (selected.type === 'js') {
				js_editor.set(`/* Select a component to see its compiled code */`);
				css_editor.set(`/* Select a component to see its compiled code */`);
				return;
			}

			const compiled = await compiler.compile(selected, compile_options);

			js_editor.set(compiled.js, 'js');
			css_editor.set(compiled.css, 'css');
		},

		update: async selected => {
			if (selected.type === 'js') return;

			const compiled = await compiler.compile(selected, compile_options);

			js_editor.update(compiled.js);
			css_editor.update(compiled.css);
		}
	});

	let compiler;

	onMount(() => {
		compiler = new Compiler(version);
		return () => compiler.destroy();
	});

	// refs
	let viewer;
	let js_editor;
	let css_editor;
	const setters = {};

	let view = 'result';

	function updateValues(prop, value) {
		values.update(v => Object.assign({}, v, {
			[prop]: value
		}));
	}

	function setPropFromViewer(prop, value) {
		// console.log(setters, prop, value);
		// setters[prop](value);
		updateValues(prop, value);
	}

	function setPropFromEditor(prop, value) {
		viewer.setProp(prop, value);
		updateValues(prop, value);
	}
</script>

<style>
	.view-toggle {
		height: var(--pane-controls-h);
		border-bottom: 1px solid #eee;
		white-space: nowrap;
	}

	button {
		/* width: 50%;
		height: 100%; */
		text-align: left;
		position: relative;
		font: 400 1.2rem/1.5 var(--font);
		border-bottom: var(--border-w) solid transparent;
		padding: 1.2rem 1.2rem 0.8rem 1.2rem;
		color: #999;
	}

	button.active {
		border-bottom: var(--border-w) solid var(--prime);
		color: #333;
	}

	div[slot] {
		height: 100%;
	}

	h3 {
		font: 700 1.2rem/1.5 var(--font);
		padding: 1.2rem 0 0.8rem 1rem;
		color: var(--text);
	}

	.tab-content {
		position: absolute;
		width: 100%;
		height: calc(100% - 4.2rem);
		opacity: 0;
		pointer-events: none;
	}

	.tab-content.visible {
		/* can't use visibility due to a weird painting bug in Chrome */
		opacity: 1;
		pointer-events: all;
	}
</style>

<div class="view-toggle">
	<button
		class:active="{view === 'result'}"
		on:click="{() => view = 'result'}"
	>Result</button>

	<button
		class:active="{view === 'js'}"
		on:click="{() => view = 'js'}"
	>JS output</button>

	<button
		class:active="{view === 'css'}"
		on:click="{() => view = 'css'}"
	>CSS output</button>
</div>

<!-- component viewer -->
<div class="tab-content" class:visible="{view === 'result'}">
	<Viewer
		bind:this={viewer}
		bind:error={runtimeError}
		on:binding="{e => setPropFromViewer(e.detail.prop, e.detail.value)}"
	/>
</div>

<!-- js output -->
<div class="tab-content" class:visible="{view === 'js'}">
	{#if embedded}
		<CodeMirror
			bind:this={js_editor}
			mode="js"
			errorLoc={sourceErrorLoc}
			readonly
		/>
	{:else}
		<SplitPane type="vertical" pos={67}>
			<div slot="a">
				<CodeMirror
					bind:this={js_editor}
					mode="js"
					errorLoc={sourceErrorLoc}
					readonly
				/>
			</div>

			<section slot="b">
				<h3>Compiler options</h3>

				<CompilerOptions bind:options={compile_options}/>
			</section>
		</SplitPane>
	{/if}
</div>

<!-- css output -->
<div class="tab-content" class:visible="{view === 'css'}">
	<CodeMirror
		bind:this={css_editor}
		mode="css"
		errorLoc={sourceErrorLoc}
		readonly
	/>
</div>