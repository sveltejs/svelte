<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
	
	const handleClose = () => dispatch('close')

	function handleKeydown(event) {
		if (event.key == 'Escape') {
			handleClose()
		} else if (event.key == 'Tab') {
			event.preventDefault()
		}
	}

	let closeButton
	onMount(() => {
		closeButton.focus()
	})

</script>

<style>
	.modal-background {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0,0,0,0.3);
	}

	.modal {
		position: absolute;
		left: 50%;	top: 50%;
		width: calc(100vw - 4em);
		max-width: 32em;
		max-height: calc(100vh - 4em);
		overflow: auto;
		transform: translate(-50%,-50%);
		padding: 1em;
		border-radius: 0.2em;
		background: white;
	}

	button {
		display: block;
	}
</style>

<div class='modal-background' on:click='{handleClose}'></div>

<div class='modal'>
	<slot name='header'></slot>
	<hr>
	<slot></slot>
	<hr>

	<button on:click='{() => dispatch("close")}' bind:this={closeButton}>close modal</button>
</div>
