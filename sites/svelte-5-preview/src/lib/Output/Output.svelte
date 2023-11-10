<script>
	import { get_repl_context } from '$lib/context.js';
	import { BROWSER } from 'esm-env';
	import { marked } from 'marked';
	import CodeMirror from '../CodeMirror.svelte';
	import AstView from './AstView.svelte';
	import Compiler from './Compiler.js';
	import CompilerOptions from './CompilerOptions.svelte';
	import PaneWithPanel from './PaneWithPanel.svelte';
	import Viewer from './Viewer.svelte';

	export let svelteUrl;

	/** @type {string | null} */
	export let status;

	/** @type {import('$lib/types').StartOrEnd | null} */
	export let sourceErrorLoc = null;

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

	/**
	 * @param {import('$lib/types').File} file
	 * @param {import('svelte/compiler').CompileOptions} options
	 */
	export async function set(file, options) {
		selected_type = file.type;

		if (file.type === 'json') {
			js_editor.set({ code: `/* Select a component to see its compiled code */`, lang: 'js' });
			css_editor.set({ code: `/* Select a component to see its compiled code */`, lang: 'css' });
			return;
		}

		if (file.type === 'md') {
			markdown = marked(file.source);
			return;
		}

		if (!compiler) return console.error('Compiler not initialized.');

		const compiled = await compiler.compile(file, options, showAst);
		if (!js_editor) return; // unmounted

		js_editor.set({
			code: compiled.js,
			lang: 'js'
		});
		css_editor.set({ code: compiled.css, lang: 'css' });
		ast = compiled.ast;
	}

	/**
	 * @param {import('$lib/types').File} selected
	 * @param {import('svelte/compiler').CompileOptions} options
	 */
	export async function update(selected, options) {
		if (selected.type === 'json') return;

		if (selected.type === 'md') {
			markdown = marked(selected.source);
			return;
		}

		if (!compiler) return console.error('Compiler not initialized.');

		const { result, metadata } = await compiler.compile(selected, options, showAst);

		js_editor.update({ code: result.js, lang: 'js' });
		css_editor.update({ code: result.css, lang: 'css' });
		$runes_mode = metadata?.runes;
		ast = result.ast;
	}

	const { module_editor, runes_mode } = get_repl_context();

	const compiler = BROWSER ? new Compiler(svelteUrl) : null;

	/** @type {CodeMirror} */
	let js_editor;

	/** @type {CodeMirror} */
	let css_editor;

	/** @type {'result' | 'js' | 'css' | 'ast'} */
	let view = 'result';
	let selected_type = '';
	let markdown = '';

	/** @type {import('svelte/types/compiler/interfaces').Ast} */
	let ast;
</script>

<div class="view-toggle">
	{#if selected_type === 'md'}
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
<div class="tab-content" class:visible={selected_type !== 'md' && view === 'result'}>
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
<div class="tab-content" class:visible={selected_type !== 'md' && view === 'js'}>
	{#if embedded}
		<CodeMirror bind:this={js_editor} errorLoc={sourceErrorLoc} readonly />
	{:else}
		<PaneWithPanel pos="50%" panel="Compiler options">
			<div slot="main">
				<CodeMirror bind:this={js_editor} errorLoc={sourceErrorLoc} readonly />
			</div>

			<div slot="panel-body">
				<CompilerOptions />
			</div>
		</PaneWithPanel>
	{/if}
</div>

<!-- css output -->
<div class="tab-content" class:visible={selected_type !== 'md' && view === 'css'}>
	<CodeMirror bind:this={css_editor} errorLoc={sourceErrorLoc} readonly />
</div>

<!-- ast output -->
{#if showAst}
	<div class="tab-content" class:visible={selected_type !== 'md' && view === 'ast'}>
		<!-- ast view interacts with the module editor, wait for it first -->
		{#if $module_editor}
			<AstView {ast} autoscroll={selected_type !== 'md' && view === 'ast'} />
		{/if}
	</div>
{/if}

<!-- markdown output -->
<div class="tab-content" class:visible={selected_type === 'md'}>
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
