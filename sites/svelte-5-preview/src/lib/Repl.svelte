<script>
	import { EditorState } from '@codemirror/state';
	import { SplitPane } from '@rich_harris/svelte-split-pane';
	import { BROWSER } from 'esm-env';
	import { createEventDispatcher } from 'svelte';
	import { derived, writable } from 'svelte/store';
	import Bundler from './Bundler.js';
	import ComponentSelector from './Input/ComponentSelector.svelte';
	import ModuleEditor from './Input/ModuleEditor.svelte';
	import InputOutputToggle from './InputOutputToggle.svelte';
	import Output from './Output/Output.svelte';
	import { set_repl_context } from './context.js';
	import { get_full_filename } from './utils.js';
	import Compiler from './Output/Compiler.js';

	export let packagesUrl = 'https://unpkg.com';
	export let svelteUrl = `${BROWSER ? location.origin : ''}/svelte`;
	export let embedded = false;
	/** @type {'columns' | 'rows'} */
	export let orientation = 'columns';
	export let relaxed = false;
	export let fixed = false;
	export let fixedPos = 50;
	export let injectedJS = '';
	export let injectedCSS = '';
	/** @type {'light' | 'dark'} */
	export let previewTheme = 'light';
	export let showModified = false;
	export let showAst = false;
	export let autocomplete = true;

	let runes = false;

	export function toJSON() {
		return {
			imports: $bundle?.imports ?? [],
			files: $files
		};
	}

	/**
	 * @param {{ files: import('./types').File[], css?: string }} data
	 */
	export async function set(data) {
		$files = data.files;
		$selected_name = 'App.svelte';

		rebundle();

		// Wait for editors to be ready
		await $module_editor?.isReady;

		await $module_editor?.set({ code: data.files[0].source, lang: data.files[0].type });

		injectedCSS = data.css || '';

		// when we set new files we also populate the EDITOR_STATE_MAP
		// with a new state for each file containing the source as docs
		// this allows the editor to behave correctly when renaming a tab
		// after having loaded the files externally
		populate_editor_state();

		dispatch('change', { files: $files });
	}

	export function markSaved() {
		$files = $files.map((val) => ({ ...val, modified: false }));
	}

	/** @type {ReturnType<typeof createEventDispatcher<{ change: { files: import('./types').File[] } }>>} */
	const dispatch = createEventDispatcher();

	/**
	 * @typedef {import('./types').ReplContext} ReplContext
	 */

	/** @type {import('svelte/compiler').CompileOptions} */
	const DEFAULT_COMPILE_OPTIONS = {
		generate: 'client',
		dev: false
	};

	/** @type {Map<string, import('@codemirror/state').EditorState>} */
	const EDITOR_STATE_MAP = new Map();

	/** @type {ReplContext['files']} */
	const files = writable([]);

	/** @type {ReplContext['selected_name']} */
	const selected_name = writable('App.svelte');

	/** @type {ReplContext['selected']} */
	const selected = derived([files, selected_name], ([$files, $selected_name]) => {
		return (
			$files.find((val) => get_full_filename(val) === $selected_name) ?? {
				name: '',
				type: '',
				source: '',
				modified: false
			}
		);
	});

	/** @type {ReplContext['bundle']} */
	const bundle = writable(null);

	/** @type {ReplContext['compile_options']} */
	const compile_options = writable(DEFAULT_COMPILE_OPTIONS);

	/** @type {ReplContext['cursor_pos']} */
	const cursor_pos = writable(0);

	/** @type {ReplContext['module_editor']} */
	const module_editor = writable(null);

	/** @type {ReplContext['toggleable']} */
	const toggleable = writable(false);

	/** @type {ReplContext['bundler']} */
	const bundler = writable(null);

	/** @type {ReplContext['bundling']} */
	const bundling = writable(new Promise(() => {}));

	set_repl_context({
		files,
		selected_name,
		selected,
		bundle,
		bundler,
		bundling,
		compile_options,
		cursor_pos,
		module_editor,
		toggleable,

		EDITOR_STATE_MAP,

		rebundle,
		clear_state,
		go_to_warning_pos,
		handle_change,
		handle_select
	});

	/** @type {Symbol}  */
	let current_token;
	async function rebundle() {
		const token = (current_token = Symbol());
		let resolver = () => {};
		$bundling = new Promise((resolve) => {
			resolver = resolve;
		});
		const result = await $bundler?.bundle($files);
		if (result && token === current_token) $bundle = result;
		resolver();
	}

	let is_select_changing = false;

	/**
	 * @param {string} filename
	 */
	async function handle_select(filename) {
		is_select_changing = true;

		$selected_name = filename;

		if (!$selected) return;

		await $module_editor?.set({ code: $selected.source, lang: $selected.type });

		if (EDITOR_STATE_MAP.has(filename)) {
			$module_editor?.setEditorState(EDITOR_STATE_MAP.get(filename));
		} else {
			$module_editor?.clearEditorState();
		}

		is_select_changing = false;
	}

	/**
	 * @param {CustomEvent<{ value: string }>} event
	 */
	async function handle_change(event) {
		if (is_select_changing) return;

		files.update(($files) => {
			const file = { ...$selected };

			file.source = event.detail.value;
			file.modified = true;

			const idx = $files.findIndex((val) => get_full_filename(val) === $selected_name);

			// @ts-ignore
			$files[idx] = file;

			return $files;
		});

		if (!$selected) return;

		EDITOR_STATE_MAP.set(get_full_filename($selected), $module_editor?.getEditorState());

		dispatch('change', {
			files: $files
		});

		rebundle();
	}

	/** @param {import('./types').MessageDetails | undefined} item */
	async function go_to_warning_pos(item) {
		if (!item) return;

		// If its a bundler error, can't do anything about it
		if (!item.filename) return;

		await handle_select(item.filename);

		$module_editor?.focus();
		$module_editor?.setCursor(item.start.character);
	}

	/** Deletes all editor state */
	function clear_state() {
		$module_editor?.clearEditorState();

		EDITOR_STATE_MAP.clear();
	}

	function populate_editor_state() {
		for (const file of $files) {
			EDITOR_STATE_MAP.set(
				get_full_filename(file),
				EditorState.create({
					doc: file.source
				}).toJSON()
			);
		}
	}

	const compiler = BROWSER ? new Compiler(svelteUrl) : null;

	/** @type {import('./workers/workers').CompileMessageData | null} */
	let compiled = null;

	/**
	 * @param {import('./types').File | null} $selected
	 * @param {import('svelte/compiler').CompileOptions} $compile_options
	 */
	async function recompile($selected, $compile_options) {
		if (!compiler || !$selected) return;

		if ($selected.type === 'svelte' || $selected.type === 'js') {
			compiled = await compiler.compile($selected, $compile_options, true);
			runes = compiled.result.metadata?.runes ?? false;
		} else {
			runes = false;
		}
	}

	$: recompile($selected, $compile_options);

	$: mobile = width < 540;

	$: $toggleable = mobile && orientation === 'columns';

	let width = 0;
	let show_output = false;

	/** @type {string | null} */
	let status = null;
	let status_visible = false;

	/** @type {NodeJS.Timeout | undefined} */
	let status_timeout = undefined;

	$bundler = BROWSER
		? new Bundler({
				packages_url: packagesUrl,
				svelte_url: svelteUrl,
				onstatus: (message) => {
					if (message) {
						// show bundler status, but only after time has elapsed, to
						// prevent the banner flickering
						if (!status_visible && !status_timeout) {
							status_timeout = setTimeout(() => {
								status_visible = true;
							}, 400);
						}
					} else {
						clearTimeout(status_timeout);
						status_visible = false;
						status_timeout = undefined;
					}

					status = message;
				}
			})
		: null;

	/**
	 * @param {BeforeUnloadEvent} event
	 */
	function before_unload(event) {
		if (showModified && $files.find((file) => file.modified)) {
			event.preventDefault();
			event.returnValue = '';
		}
	}
</script>

<svelte:window on:beforeunload={before_unload} />

<div class="container" class:toggleable={$toggleable} bind:clientWidth={width}>
	<div class="viewport" class:output={show_output}>
		<SplitPane
			--color="var(--sk-text-4)"
			id="main"
			type={orientation === 'rows' ? 'vertical' : 'horizontal'}
			pos="{mobile || fixed ? fixedPos : orientation === 'rows' ? 60 : 50}%"
			min="100px"
			max="-4.1rem"
		>
			<section slot="a">
				<ComponentSelector show_modified={showModified} {runes} on:add on:remove />
				<ModuleEditor
					{autocomplete}
					error={compiled?.result.error}
					warnings={compiled?.result.warnings ?? []}
				/>
			</section>

			<section slot="b" style="height: 100%;">
				<Output
					status={status_visible ? status : null}
					{embedded}
					{relaxed}
					{injectedJS}
					{injectedCSS}
					{showAst}
					{previewTheme}
					selected={$selected}
					{compiled}
				/>
			</section>
		</SplitPane>
	</div>

	{#if $toggleable}
		<InputOutputToggle bind:checked={show_output} />
	{/if}
</div>

<style>
	.container {
		position: relative;
		width: 100%;
		height: calc(100dvh - var(--sk-nav-height));
		background: var(--sk-back-1);
	}

	.container :global(section) {
		position: relative;
		padding: 42px 0 0 0;
		height: 100%;
		box-sizing: border-box;
	}

	.container :global(section) > :global(*):first-child {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 42px;
		box-sizing: border-box;
	}

	.container :global(section) > :global(*):last-child {
		width: 100%;
		height: 100%;
	}

	.viewport {
		height: 100%;
	}

	.toggleable .viewport {
		width: 200%;
		height: calc(100% - 42px);
		transition: transform 0.3s;
	}

	.toggleable .viewport.output {
		transform: translate(-50%);
	}

	/* on mobile, override the <SplitPane> controls */
	@media (max-width: 799px) {
		:global([data-pane='main']) {
			--pos: 50% !important;
		}

		:global([data-pane='editor']) {
			--pos: 5.4rem !important;
		}

		:global([data-pane]) :global(.divider) {
			cursor: default;
		}
	}
</style>
