<script>
	import Modal from './Modal.svelte';

	export let showModal;
</script>

{#if showModal}
	<Modal on:destroy='{() => showModal = false}'>
		<h2>Hello!</h2>
	</Modal>
{:else}
	<button on:click='{() => showModal = true}'>show modal</button>
{/if}