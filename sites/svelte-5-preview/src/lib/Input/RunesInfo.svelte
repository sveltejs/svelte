<script>
	import { get_repl_context } from '$lib/context.js';
	import { tick } from 'svelte';

	/** @type {{ runes: boolean }} */
	const { runes } = $props();

	let open = $state(false);

	const { selected_name, files, selected, handle_select, set_files } = get_repl_context();

	/** @param {(update: import('$lib/types').File) => import('$lib/types').File} update */
	function update_selected_file(update) {
		const new_files = $files.map((file) => {
			if (file.name === $selected?.name) {
				return update(file);
			}
			return file;
		});
		set_files({ files: new_files });
		open = false;
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') open = false;
	}}
/>

<div class="container">
	<button class:active={runes} class:open onclick={() => (open = !open)}>
		<svg viewBox="0 0 24 24">
			<path d="M9.4,1H19l-5.9,7.7h8L8.3,23L11,12.6H3.5L9.4,1z" />
		</svg>

		runes
	</button>

	{#if open}
		<!-- a11y is handled by the <svelte:window> above -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="modal-backdrop" onclick={() => (open = false)}></div>
		<div class="popup">
			{#if $selected_name.endsWith('.svelte.js')}
				<p>
					Files with a <code>.svelte.js</code> extension are always in
					<a href="https://svelte.dev/blog/runes">runes mode</a>.
				</p>
			{:else if $selected_name.endsWith('.js')}
				<p>
					To use <a href="https://svelte.dev/blog/runes">runes</a> in a JavaScript file, change the
					extension to <code>.svelte.js</code>.
				</p>
			{:else if $selected_name.endsWith('.svelte')}
				{#if runes}
					<p>
						This component is in
						<a href="https://svelte.dev/blog/runes">runes mode</a>.
					</p>
					<p>To disable runes mode, add the following to the top of your component:</p>
					<pre><code>&lt;svelte:options runes={'{false}'} /&gt;</code></pre>
					<button
						class="mutate"
						onclick={() => {
							update_selected_file((file) => {
								if (file.source.includes('<svelte:options runes={true}')) {
									file.source = file.source.replace(
										'<svelte:options runes={true}',
										'<svelte:options runes={false}'
									);
								} else if (file.source.includes('<svelte:options runes')) {
									file.source = file.source.replace(
										'<svelte:options runes',
										'<svelte:options runes={false}'
									);
								} else {
									file.source = '<svelte:options runes={false} />\n' + file.source;
								}
								return file;
							});
						}}
					>
						Disable Runes
					</button>
				{:else}
					<p>This component is not in <a href="https://svelte.dev/blog/runes">runes mode</a>.</p>
					<p>
						To enable runes mode, either start using runes in your code, or add the following to the
						top of your component:
					</p>
					<pre><code>&lt;svelte:options runes /&gt;</code></pre>
					<button
						class="mutate"
						onclick={() => {
							update_selected_file((file) => {
								if (file.source.includes('<svelte:options runes={false}')) {
									file.source = file.source.replace(
										'<svelte:options runes={false}',
										'<svelte:options runes'
									);
								} else {
									file.source = '<svelte:options runes />\n' + file.source;
								}
								return file;
							});
						}}
					>
						Enable Runes
					</button>
				{/if}
			{:else}
				<p>
					Edit a <code>.svelte</code>, <code>.svelte.js</code> or <code>.js</code> file to see
					information on <a href="https://svelte.dev/blog/runes">runes mode</a>
				</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	button {
		position: relative;
		display: flex;
		text-transform: uppercase;
		font-size: 1.4rem;
		padding: 0.8rem;
		gap: 0.5rem;
		margin-right: 0.3rem;
		z-index: 9999;
	}

	button.open {
		background: var(--sk-back-3);
	}

	.mutate {
		color: #ff3e00;
		margin-top: 2rem;
	}
	.mutate:hover {
		background: #ff3e0030;
	}

	svg {
		width: 1.6rem !important;
		height: 1.6rem !important;
		top: 0.05rem;
	}

	path {
		stroke: #ccc;
		fill: transparent;
		transition:
			stroke 0.2s,
			fill 0.2s;
	}

	.active svg {
		animation: bump 0.4s;
	}

	.active path {
		stroke: #ff3e00;
		fill: #ff3e00;
	}

	@keyframes bump {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.3);
		}
		100% {
			transform: scale(1);
		}
	}

	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: var(--sk-back-1);
		opacity: 0.7;
		backdrop-filter: blur(5px);
		z-index: 9998;
	}

	.popup {
		position: absolute;
		top: 2.2em;
		right: 0;
		width: 100vw;
		max-width: 320px;
		z-index: 9999;
		background: var(--sk-back-3);
		padding: 1em;
	}

	.popup p:first-child {
		margin-top: 0;
	}

	.popup p:last-child {
		margin-bottom: 0;
	}
</style>
