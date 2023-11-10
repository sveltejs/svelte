<script>
	import { get_repl_context } from '$lib/context.js';
	import { marked } from 'marked';
	import CodeMirror from '../CodeMirror.svelte';
	import AstView from './AstView.svelte';
	import CompilerOptions from './CompilerOptions.svelte';
	import PaneWithPanel from './PaneWithPanel.svelte';
	import Viewer from './Viewer.svelte';

	/** @type {string | null} */
	export let status;

	/** @type {import('$lib/types').MessageDetails | null} */
	export let runtimeError = null;

	export let embedded = false;
	export let relaxed = false;

	/** @type {string} */
	export let injectedJS;

	/** @type {string} */
	export let injectedCSS;

	// export let theme;
	export let showAst = false;

	/** @type {'light' | 'dark'} */
	export let previewTheme;

	/** @type {import('../types').File | null} */
	export let selected;

	/** @type {import('../workers/workers').CompileMessageData | null} */
	export let compiled;

	$: if (selected) {
		if (selected.type === 'json') {
			js_editor.set({ code: `/* Select a component to see its compiled code */`, lang: 'js' });
			css_editor.set({ code: `/* Select a component to see its compiled code */`, lang: 'css' });
		} else if (selected.type === 'md') {
			markdown = marked(selected.source);
		} else if (compiled) {
			js_editor.set({ code: compiled.result.js, lang: 'js' });
			css_editor.set({ code: compiled.result.css, lang: 'css' });
		}
	}

	const { module_editor } = get_repl_context();

	/** @type {CodeMirror} */
	let js_editor;

	/** @type {CodeMirror} */
	let css_editor;

	/** @type {'result' | 'js' | 'css' | 'ast'} */
	let view = 'result';
	let markdown = '';

	/** @type {import('svelte/types/compiler/interfaces').Ast} */
	let ast;
</script>

<div class="view-toggle">
	{#if selected?.type === 'md'}
		<button class="active">Markdown</button>
	{:else}
		<button class:active={view === 'result'} on:click={() => (view = 'result')}>Result</button>
		<button class:active={view === 'js'} on:click={() => (view = 'js')}>JS output</button>
		<button class:active={view === 'css'} on:click={() => (view = 'css')}>CSS output</button>
		{#if showAst}
			<button class:active={view === 'ast'} on:click={() => (view = 'ast')}>AST output</button>
		{/if}
	{/if}
</div>

<!-- component viewer -->
<div class="tab-content" class:visible={selected?.type !== 'md' && view === 'result'}>
	<Viewer
		bind:error={runtimeError}
		{status}
		{relaxed}
		{injectedJS}
		{injectedCSS}
		theme={previewTheme}
	/>
</div>

<!-- js output -->
<div class="tab-content" class:visible={selected?.type !== 'md' && view === 'js'}>
	{#if embedded}
		<CodeMirror bind:this={js_editor} readonly />
	{:else}
		<PaneWithPanel pos="50%" panel="Compiler options">
			<div slot="main">
				<CodeMirror bind:this={js_editor} readonly />
			</div>

			<div slot="panel-body">
				<CompilerOptions />
			</div>
		</PaneWithPanel>
	{/if}
</div>

<!-- css output -->
<div class="tab-content" class:visible={selected?.type !== 'md' && view === 'css'}>
	<CodeMirror bind:this={css_editor} readonly />
</div>

<!-- ast output -->
{#if showAst}
	<div class="tab-content" class:visible={selected?.type !== 'md' && view === 'ast'}>
		<!-- ast view interacts with the module editor, wait for it first -->
		{#if $module_editor}
			<AstView {ast} autoscroll={selected?.type !== 'md' && view === 'ast'} />
		{/if}
	</div>
{/if}

<!-- markdown output -->
<div class="tab-content" class:visible={selected?.type === 'md'}>
	<iframe title="Markdown" srcdoc={markdown} />
</div>

<style>
	.view-toggle {
		height: 4.2rem;
		border-bottom: 1px solid var(--sk-text-4);
		white-space: nowrap;
		box-sizing: border-box;
	}

	button {
		/* width: 50%;
		height: 100%; */
		background: var(--sk-back-1, white);
		text-align: left;
		position: relative;
		font: 400 12px/1.5 var(--sk-font);
		border: none;
		border-bottom: 3px solid transparent;
		padding: 12px 12px 8px 12px;
		color: var(--sk-text-2, #999);
		border-radius: 0;
	}

	button.active {
		border-bottom: 3px solid var(--sk-theme-1, --prime);
		color: var(--sk-text-1, #333);
	}

	div[slot] {
		height: 100%;
	}

	.tab-content {
		position: absolute;
		width: 100%;
		height: calc(100% - 42px) !important;
		visibility: hidden;
		pointer-events: none;
	}

	.tab-content.visible {
		visibility: visible;
		pointer-events: all;
	}
	iframe {
		width: 100%;
		height: 100%;
		border: none;
		display: block;
	}
</style>
