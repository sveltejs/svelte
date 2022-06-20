<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	const destroy = () => dispatch('destroy');
</script>

<div class='modal-background' on:click='{destroy}'></div>

<div class='modal'>
	<slot></slot>
	<button on:click='{destroy}'>close modal</button>
</div>