<script context="module">
	export const cursorIndex = writable(0);
</script>

<script>
	import { historyField } from '@codemirror/commands';
	import { EditorState, Range, StateEffect, StateEffectType, StateField } from '@codemirror/state';
	import { Decoration, EditorView } from '@codemirror/view';
	import { codemirror, withCodemirrorInstance } from '@neocodemirror/svelte';
	import { createEventDispatcher, tick } from 'svelte';
	import { writable } from 'svelte/store';
	import Message from './Message.svelte';
	import { svelteTheme } from './theme.js';

	/** @type {import('@codemirror/lint').LintSource | undefined} */
	export let diagnostics = undefined;

	export let readonly = false;
	export let tab = true;

	/** @type {boolean} */
	export let autocomplete = true;

	/** @type {ReturnType<typeof createEventDispatcher<{ change: { value: string } }>>} */
	const dispatch = createEventDispatcher();

	let code = '';

	/** @type {import('./types').Lang} */
	let lang = 'svelte';

	/**
	 * @param {{ code: string; lang: import('./types').Lang }} options
	 */
	export async function set(options) {
		update(options);
	}

	/**
	 * @param {{ code?: string; lang?: import('./types').Lang }} options
	 */
	export async function update(options) {
		await isReady;

		if (!$cmInstance.view) return;

		if (options.lang && options.lang !== lang) {
			// This will trigger change_mode
			lang = options.lang;
		}

		if (options.code !== undefined) {
			updating_externally = true;

			const { scrollLeft: left, scrollTop: top } = $cmInstance.view.scrollDOM;

			code = options.code;

			updating_externally = false;

			$cmInstance.view.scrollDOM.scrollTop = top;
			$cmInstance.view.scrollDOM.scrollLeft = left;
		}
	}

	/**
	 * @param {number} pos
	 */
	export function setCursor(pos) {
		cursor_pos = pos;
	}

	/** @type {(...val: any) => void} */
	let fulfil_module_editor_ready;
	export const isReady = new Promise((f) => (fulfil_module_editor_ready = f));

	export function resize() {
		$cmInstance.view?.requestMeasure();
	}

	export function focus() {
		$cmInstance.view?.focus();
	}

	export function getEditorState() {
		return $cmInstance.view?.state.toJSON({ history: historyField });
	}

	/**
	 * @param {any} state
	 */
	export function setEditorState(state) {
		if (!$cmInstance.view) return;

		$cmInstance.view.setState(
			EditorState.fromJSON(state, { extensions, doc: state.doc }, { history: historyField })
		);
		$cmInstance.view?.dispatch({
			changes: { from: 0, to: $cmInstance.view.state.doc.length, insert: state.doc },
			effects: [StateEffect.reconfigure.of($cmInstance.extensions ?? [])]
		});
	}

	export async function clearEditorState() {
		await tick();

		$cmInstance.view?.setState(EditorState.create({ extensions, doc: '' }));
		$cmInstance.view?.dispatch({
			changes: { from: 0, to: $cmInstance.view.state.doc.length, insert: '' },
			effects: [StateEffect.reconfigure.of($cmInstance.extensions ?? [])]
		});
	}

	/** @type {StateEffectType<Range<Decoration>[]>} */
	const addMarksDecoration = StateEffect.define();

	// This value must be added to the set of extensions to enable this
	const markField = StateField.define({
		// Start with an empty set of decorations
		create() {
			return Decoration.none;
		},
		// This is called whenever the editor updates—it computes the new set
		update(value, tr) {
			// Move the decorations to account for document changes
			value = value.map(tr.changes);
			// If this transaction adds or removes decorations, apply those changes
			for (let effect of tr.effects) {
				if (effect.is(addMarksDecoration)) value = value.update({ add: effect.value, sort: true });
			}
			return value;
		},
		// Indicate that this field provides a set of decorations
		provide: (f) => EditorView.decorations.from(f)
	});

	/**
	 * @param {object} param0
	 * @param {number} param0.from
	 * @param {number} param0.to
	 * @param {string} [param0.className]
	 */
	export function markText({ from, to, className = 'mark-text' }) {
		const executedMark = Decoration.mark({
			class: className
		});

		$cmInstance.view?.dispatch({
			effects: [
				StateEffect.appendConfig.of(markField),
				addMarksDecoration.of([executedMark.range(from, to)])
			]
		});
	}

	export function unmarkText() {
		$cmInstance.view?.dispatch({
			effects: StateEffect.reconfigure.of($cmInstance.extensions ?? [])
		});
	}

	const cmInstance = withCodemirrorInstance();

	/** @type {number} */
	let w;
	/** @type {number} */
	let h;

	let marked = false;

	let updating_externally = false;

	/** @type {import('@codemirror/state').Extension[]} */
	let extensions = [];

	let cursor_pos = 0;

	$: if ($cmInstance.view) {
		fulfil_module_editor_ready();
	}

	$: if ($cmInstance.view && w && h) resize();

	$: if (marked) {
		unmarkText();
		marked = false;
	}

	const watcher = EditorView.updateListener.of((viewUpdate) => {
		if (viewUpdate.selectionSet) {
			cursorIndex.set(viewUpdate.state.selection.main.head);
		}
	});

	import { svelteLanguage } from '@replit/codemirror-lang-svelte';
	import { javascriptLanguage } from '@codemirror/lang-javascript';
	import { snippetCompletion as snip } from '@codemirror/autocomplete';

	/** @param {any} context */
	function complete_svelte_runes(context) {
		const word = context.matchBefore(/\w*/);
		if (word.from === word.to && context.state.sliceDoc(word.from - 1, word.to) !== '$') {
			return null;
		}
		return {
			from: word.from - 1,
			options: [
				{ label: '$state', type: 'keyword', boost: 12 },
				{ label: '$props', type: 'keyword', boost: 11 },
				{ label: '$derived', type: 'keyword', boost: 10 },
				snip('$derived.by(() => {\n\t${}\n});', {
					label: '$derived.by',
					type: 'keyword',
					boost: 9
				}),
				snip('$effect(() => {\n\t${}\n});', { label: '$effect', type: 'keyword', boost: 8 }),
				snip('$effect.pre(() => {\n\t${}\n});', {
					label: '$effect.pre',
					type: 'keyword',
					boost: 7
				}),
				{ label: '$state.frozen', type: 'keyword', boost: 6 },
				{ label: '$bindable', type: 'keyword', boost: 5 },
				snip('$effect.root(() => {\n\t${}\n});', {
					label: '$effect.root',
					type: 'keyword',
					boost: 4
				}),
				{ label: '$state.snapshot', type: 'keyword', boost: 3 },
				snip('$effect.active()', {
					label: '$effect.active',
					type: 'keyword',
					boost: 2
				}),
				{ label: '$inspect', type: 'keyword', boost: 1 }
			]
		};
	}

	const svelte_rune_completions = svelteLanguage.data.of({
		autocomplete: complete_svelte_runes
	});

	const js_rune_completions = javascriptLanguage.data.of({
		autocomplete: complete_svelte_runes
	});
</script>

<div
	class="codemirror-container"
	use:codemirror={{
		value: code,
		setup: 'basic',
		useTabs: tab,
		tabSize: 2,
		theme: svelteTheme,
		readonly,
		cursorPos: cursor_pos,
		lang,
		langMap: {
			js: () => import('@codemirror/lang-javascript').then((m) => m.javascript()),
			json: () => import('@codemirror/lang-json').then((m) => m.json()),
			md: () => import('@codemirror/lang-markdown').then((m) => m.markdown()),
			css: () => import('@codemirror/lang-css').then((m) => m.css()),
			svelte: () => import('@replit/codemirror-lang-svelte').then((m) => m.svelte())
		},
		lint: diagnostics,
		lintOptions: { delay: 200 },
		autocomplete,
		extensions: [svelte_rune_completions, js_rune_completions, watcher],
		instanceStore: cmInstance
	}}
	on:codemirror:textChange={({ detail: value }) => {
		code = value;
		dispatch('change', { value: code });
	}}
>
	{#if !$cmInstance.view}
		<pre style="position: absolute; left: 0; top: 0">{code}</pre>

		<div style="position: absolute; width: 100%; bottom: 0">
			<Message kind="info">loading editor...</Message>
		</div>
	{/if}
</div>

<style>
	.codemirror-container {
		position: relative;
		width: 100%;
		height: 100%;
		border: none;
		line-height: 1.5;
		overflow: hidden;
	}

	.codemirror-container :global(.mark-text) {
		background-color: var(--sk-selection-color);
		backdrop-filter: opacity(40%);
	}

	.codemirror-container :global(.cm-editor) {
		height: 100%;
	}

	.codemirror-container :global(*) {
		font: 400 var(--sk-text-xs) / 1.7 var(--sk-font-mono) !important;
	}

	.codemirror-container :global(.error-loc) {
		position: relative;
		border-bottom: 2px solid #da106e;
	}

	.codemirror-container :global(.error-line) {
		background-color: rgba(200, 0, 0, 0.05);
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
		font-family: var(--sk-font-mono);
		font-size: 13px;
		line-height: 1.7;
		user-select: none;
		pointer-events: none;
		color: #ccc;
		tab-size: 2;
		-moz-tab-size: 2;
	}
</style>
