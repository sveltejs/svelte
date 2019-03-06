<script>
	import { getContext, onMount } from 'svelte';
	import SplitPane from '../SplitPane.svelte';
	import Viewer from './Viewer.svelte';
	import CompilerOptions from './CompilerOptions.svelte';
	import Compiler from './Compiler.js';
	import PropEditor from './PropEditor.svelte';
	import CodeMirror from '../CodeMirror.svelte';

	const { values, register_output } = getContext('REPL');

	export let version;
	export let sourceErrorLoc;
	export let runtimeError;
	export let embedded;
	export let show_props;

	let props;

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
			if (compiled.props) props = compiled.props;
		},

		update: async selected => {
			if (selected.type === 'js') return;

			const compiled = await compiler.compile(selected, compile_options);

			js_editor.update(compiled.js);
			css_editor.update(compiled.css);
			if (compiled.props) props = compiled.props;
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
		padding: 1.2rem 0.8rem 0.8rem 0.8rem;
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

	.props {
		display: grid;
		padding: 0.5em;
		grid-template-columns: auto 1fr;
		grid-auto-rows: min-content;
		grid-gap: 0.5em;
		overflow-y: auto;
	}

	.props code {
		top: .1rem;
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
	<SplitPane type="vertical" pos={67} fixed={!show_props} fixed_pos={100}>
		<div slot="a">
			<Viewer
				bind:this={viewer}
				{props}
				bind:error={runtimeError}
				on:binding="{e => setPropFromViewer(e.detail.prop, e.detail.value)}"
			/>
		</div>

		<section slot="b">
			{#if show_props}
				<h3>Props editor</h3>

				{#if props}
					{#if props.length > 0}
						<div class="props">
							{#each props.sort() as prop (prop)}
								<code style="display: block; whitespace: pre;">{prop}</code>

								<!-- TODO `bind:this={propEditors[prop]}` — currently fails -->
								<PropEditor
									value={$values[prop]}
									on:change="{e => setPropFromEditor(prop, e.detail.value)}"
								/>
							{/each}
						</div>
					{:else}
						<div style="padding: 0.5em" class="linkify">
							<!-- TODO explain distincion between logic-less and logic-ful components? -->
							<!-- TODO style the <a> so it looks like a link -->
							<p style="font-size: 1.3rem; color: var(--second)">This component has no props — <a href="guide#external-properties">declare props with the export keyword</a></p>
						</div>
					{/if}
				{/if}
			{/if}
		</section>
	</SplitPane>
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