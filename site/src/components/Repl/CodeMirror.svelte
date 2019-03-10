<script context="module">
	let codemirror_promise;
	let _CodeMirror;

	if (process.browser) {
		codemirror_promise = import(/* webpackChunkName: "codemirror" */ './_codemirror.js');

		codemirror_promise.then(mod => {
			_CodeMirror = mod.default;
		});
	}
</script>

<script>
	import { onMount, beforeUpdate, createEventDispatcher, getContext } from 'svelte';
	import Message from './Message.svelte';

	const dispatch = createEventDispatcher();
	const { navigate } = getContext('REPL');

	export let readonly = false;
	export let errorLoc = null;
	export let flex = false;
	export let lineNumbers = true;
	export let tab = true;

	let w;
	let h;
	let code = '';
	let mode;

	// We have to expose set and update methods, rather
	// than making this state-driven through props,
	// because it's difficult to update an editor
	// without resetting scroll otherwise
	export function set(new_code, new_mode) {
		if (new_mode !== mode) {
			createEditor(mode = new_mode);
		}

		code = new_code;
		updating_externally = true;
		if (editor) editor.setValue(code);
		updating_externally = false;
	}

	export function update(new_code) {
		code = new_code;

		if (editor) {
			const { left, top } = editor.getScrollInfo();
			editor.setValue(code = new_code);
			editor.scrollTo(left, top);
		}
	}

	export function resize() {
		editor.refresh();
	}

	export function focus() {
		editor.focus();
	}

	const modes = {
		js: {
			name: 'javascript',
			json: false
		},
		json: {
			name: 'javascript',
			json: true
		},
		svelte: {
			name: 'handlebars',
			base: 'text/html'
		}
	};

	const refs = {};
	let editor;
	let updating_externally = false;
	let marker;
	let error_line;
	let destroyed = false;
	let CodeMirror;

	$: if (editor && w && h) {
		editor.refresh();
	}

	$: {
		if (marker) marker.clear();

		if (errorLoc) {
			const line = errorLoc.line - 1;
			const ch = errorLoc.column;

			marker = editor.markText({ line, ch }, { line, ch: ch + 1 }, {
				className: 'error-loc'
			});

			error_line = line;
		} else {
			error_line = null;
		}
	}

	let previous_error_line;
	$: if (editor) {
		if (previous_error_line != null) {
			editor.removeLineClass(previous_error_line, 'wrap', 'error-line')
		}

		if (error_line && (error_line !== previous_error_line)) {
			editor.addLineClass(error_line, 'wrap', 'error-line');
			previous_error_line = error_line;
		}
	}

	onMount(() => {
		if (_CodeMirror) {
			CodeMirror = _CodeMirror;
			createEditor(mode || 'svelte');
			editor.setValue(code || '');
		} else {
			codemirror_promise.then(mod => {
				CodeMirror = mod.default;
				createEditor(mode || 'svelte');
				editor.setValue(code || '');
			});
		}

		return () => {
			destroyed = true;
			if (editor) editor.toTextArea();
		}
	});

	function createEditor(mode) {
		if (destroyed || !CodeMirror) return;

		if (editor) {
			editor.toTextArea();
		}

		const opts = {
			lineNumbers,
			lineWrapping: true,
			indentWithTabs: true,
			indentUnit: 2,
			tabSize: 2,
			value: '',
			mode: modes[mode] || {
				name: mode
			},
			readOnly: readonly
		};

		if (!tab) opts.extraKeys = {
			Tab: tab,
			'Shift-Tab': tab
		};

		editor = CodeMirror.fromTextArea(refs.editor, opts);

		editor.on('change', instance => {
			if (!updating_externally) {
				const value = instance.getValue();
				dispatch('change', { value });
			}
		});

		editor.refresh();
	}
</script>

<style>
	.codemirror-container {
		position: relative;
		width: 100%;
		height: 100%;
		border: none;
		line-height: 1.5;
		overflow: hidden;
	}

	.codemirror-container :global(.CodeMirror) {
		height: 100%;
		/* background: var(--background); */
		background: transparent;
		font: 400 var(--code-fs)/1.7 var(--font-mono);
		color: var(--base);
	}

	.codemirror-container.flex :global(.CodeMirror) {
		height: auto;
	}

	.codemirror-container.flex :global(.CodeMirror-lines) {
		padding: 0;
	}

	.codemirror-container :global(.CodeMirror-gutters) {
		padding: 0 1.6rem 0 .8rem;
		border: none;
	}

	.codemirror-container :global(.error-loc) {
		position: relative;
		border-bottom: 2px solid #da106e;
	}

	.codemirror-container :global(.error-line) {
		background-color: rgba(200, 0, 0, .05);
	}

	textarea {
		visibility: hidden;
	}

	pre {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		border: none;
		padding: 4px 4px 4px 60px;
		resize: none;
		font-family: var(--font-mono);
		font-size: 1.3rem;
		line-height: 1.7;
		user-select: none;
		pointer-events: none;
		color: #ccc;
		tab-size: 2;
		-moz-tab-size: 2;
	}

	.flex pre {
		padding: 0 0 0 4px;
		height: auto;
	}
</style>

<div class='codemirror-container' class:flex bind:offsetWidth={w} bind:offsetHeight={h}>
	<textarea
		tabindex='2'
		bind:this={refs.editor}
		readonly
		value={code}
	></textarea>

	{#if !CodeMirror}
		<pre style="position: absolute; left: 0; top: 0"
		>{code}</pre>

		<div style="position: absolute; width: 100%; bottom: 0">
			<Message kind='info'>loading editor...</Message>
		</div>
	{/if}
</div>