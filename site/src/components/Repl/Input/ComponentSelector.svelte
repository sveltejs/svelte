<script>
	import { getContext, createEventDispatcher } from 'svelte';
	import Icon from '../../Icon.svelte';
	import { enter } from '../../../utils/events.js';

	export let handle_select;

	const { components, selected, request_focus } = getContext('REPL');

	let editing = null;

	function selectComponent(component) {
		if ($selected !== component) {
			editing = null;
			handle_select(component);
		}
	}

	function editTab(component) {
		if ($selected === component) {
			editing = $selected;
		}
	}

	function closeEdit() {
		const match = /(.+)\.(svelte|js)$/.exec($selected.name);
		$selected.name = match ? match[1] : $selected.name;
		if (match && match[2]) $selected.type = match[2];
		editing = null;

		// re-select, in case the type changed
		handle_select($selected);

		components = components; // TODO necessary?

		// focus the editor, but wait a beat (so key events aren't misdirected)
		setTimeout(request_focus);
	}

	function remove(component) {
		let result = confirm(`Are you sure you want to delete ${component.name}.${component.type}?`);

		if (result) {
			const index = $components.indexOf(component);

			if (~index) {
				components.set($components.slice(0, index).concat($components.slice(index + 1)));
			} else {
				console.error(`Could not find component! That's... odd`);
			}

			handle_select($components[index] || $components[$components.length - 1]);
		}
	}

	function selectInput(event) {
		setTimeout(() => {
			event.target.select();
		});
	}

	let uid = 1;

	function addNew() {
		const component = {
			name: uid++ ? `Component${uid}` : 'Component1',
			type: 'svelte',
			source: ''
		};

		editing = component;

		setTimeout(() => {
			// TODO we can do this without IDs
			document.getElementById(component.name).scrollIntoView(false);
		});

		components.update(components => components.concat(component));
		handle_select(component);
	}
</script>

<style>
	.component-selector {
		position: relative;
		border-bottom: 1px solid #eee;
		overflow: hidden;
	}

	.file-tabs {
		border: none;
		margin: 0;
		white-space: nowrap;
		overflow-x: auto;
		overflow-y: hidden;
		height: 10em;
	}

	.file-tabs .button, .file-tabs button {
		position: relative;
		display: inline-block;
		font: 400 1.2rem/1.5 var(--font);
		border-bottom: var(--border-w) solid transparent;
		padding: 1.2rem 1.4rem 0.8rem 0.8rem;
		margin: 0;
		color: #999;
	}

	.file-tabs .button:first-child {
		padding-left: 1.2rem;
	}

	.file-tabs .button.active {
		/* color: var(--second); */
		color: #333;
		border-bottom: var(--border-w) solid var(--prime);
	}

	.editable, .uneditable, .input-sizer, input {
		display: inline-block;
		position: relative;
		line-height: 1;
	}

	.input-sizer {
		color: #ccc;
	}

	input {
		position: absolute;
		width: 100%;
		left: 0.8rem;
		top: 1.2rem;
		font: 400 1.2rem/1.5 var(--font);
		border: none;
		color: var(--flash);
		outline: none;
		background-color: transparent;
	}

	.remove {
		position: absolute;
		display: none;
		right: .1rem;
		top: .4rem;
		width: 1.6rem;
		text-align: right;
		padding: 1.2em 0 1.2em .5em;
		font-size: 0.8rem;
		cursor: pointer;
	}

	.remove:hover {
		color: var(--flash);
	}

	.file-tabs .button.active .editable {
		cursor: text;
	}

	.file-tabs .button.active .remove {
		display: block;
	}

	.add-new {
		position: absolute;
		left: 0;
		top: 0;
		padding: 1.2rem 1rem 0.8rem 0 !important;
		height: 4.2rem;
		text-align: center;
		background-color: white;
	}

	.add-new:hover {
		color: var(--flash) !important;
	}
</style>

<div class="component-selector">
	{#if $components.length}
		<div class="file-tabs" on:dblclick="{addNew}">
			{#each $components as component}
				<div
					id={component.name}
					class="button"
					role="button"
					class:active="{component === $selected}"
					on:click="{() => selectComponent(component)}"
					on:dblclick="{e => e.stopPropagation()}"
				>
					{#if component.name == 'App'}
						<div class="uneditable">
							App.svelte
						</div>
					{:else}
						{#if component === editing}
							<span class="input-sizer">{editing.name + (/\./.test(editing.name) ? '' : `.${editing.type}`)}</span>

							<input
								autofocus
								spellcheck={false}
								bind:value={editing.name}
								on:focus={selectInput}
								on:blur={closeEdit}
								use:enter="{e => e.target.blur()}"
							>
						{:else}
							<div
								class="editable"
								title="edit component name"
								on:click="{() => editTab(component)}"
							>
								{component.name}.{component.type}
							</div>

							<span class="remove" on:click="{() => remove(component)}">
								<Icon name="close" size={12}/>
								<!-- &times; -->
							</span>
						{/if}
					{/if}
				</div>
			{/each}

			<button class="add-new" on:click={addNew} title="add new component">
				<Icon name="plus" />
			</button>
		</div>
	{/if}
</div>
