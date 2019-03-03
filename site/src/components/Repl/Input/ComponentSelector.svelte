<script>
	import { getContext, createEventDispatcher } from 'svelte';
	import Icon from '../../Icon.svelte';
	import { enter } from '../../../utils/events.js';

	export let handle_select;

	const { components, selected } = getContext('REPL');

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

		components = components; // TODO necessary?
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

			selected.set($components[index] || $components[$components.length - 1]);
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
		selected.set(component);
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
		padding: 0 0 0 5rem;
		margin: 0;
		white-space: nowrap;
		overflow-x: auto;
		overflow-y: hidden;
		height: 10em;
	}

	.file-tabs button {
		position: relative;
		font: 400 1.2rem/1.5 var(--font);
		border-bottom: var(--border-w) solid transparent;
		padding: 1.2rem 1.2rem 0.8rem 0.5rem;
		margin: 0 0.5rem 0 0;
		color: #999;
	}

	.file-tabs button.active {
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
		left: 0.5rem;
		top: 1.2rem;
		/* padding: 0 0.4rem; */
		/* font-size: 1rem; */
		font: 400 1.2rem/1.5 var(--font);
		border: none;
		color: var(--flash);
		outline: none;
		line-height: 1;
		background-color: transparent;
	}

	.editable {
		/* margin-right: 2.4rem; */
	}

	.uneditable {
		/* padding-left: 1.2rem; */
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

	.file-tabs button.active .editable {
		cursor: text;
	}

	.file-tabs button.active .remove {
		display: inline-block;
	}

	.add-new {
		position: absolute;
		left: 0;
		top: 0;
		width: 5rem;
		height: 100%;
		text-align: center;
		background-color: white;
	}

	.add-new:hover {
		color: var(--flash);
	}
</style>

<div class="component-selector">
	<div class="file-tabs" on:dblclick="{addNew}">
		{#each $components as component}
			<button
				id={component.name}
				class:active="{component === $selected}"
				data-name={component.name}
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
							bind:value={editing.name}
							on:focus={selectInput}
							on:blur="{() => closeEdit()}"
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
			</button>
		{/each}
	</div>

	<button class="add-new" on:click={addNew} title="add new component">
		<Icon name="plus" />
	</button>
</div>
