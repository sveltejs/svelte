<script>
	import { get_repl_context } from '$lib/context.js';

	/** @type {boolean} */
	export let runes;

	let open = false;

	const { selected_name } = get_repl_context();
</script>

<svelte:window
	on:keydown={(e) => {
		if (e.key === 'Escape') open = false;
	}}
/>

<div class="container">
	<button class:active={runes} class:open on:click={() => (open = !open)}>
		<svg viewBox="0 0 24 24">
			<path d="M9.4,1H19l-5.9,7.7h8L8.3,23L11,12.6H3.5L9.4,1z" />
		</svg>

		runes
	</button>

	{#if open}
		<!--
			This is taken care of by the <svelte:window> above
			svelte-ignore a11y-click-events-have-key-events
			a11y-no-static-element-interactions
		-->
		<div class="modal-backdrop" on:click={() => (open = false)} />
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
				{:else}
					<p>This component is not in <a href="https://svelte.dev/blog/runes">runes mode</a>.</p>
					<p>
						To enable runes mode, either start using runes in your code, or add the following to the
						top of your component:
					</p>
					<pre><code>&lt;svelte:options runes /&gt;</code></pre>
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
