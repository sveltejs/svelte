<script>
	import FancyButton from './FancyButton.svelte';

	function handleClick() {
		alert('clicked');
	}
</script>

<FancyButton on:click={handleClick}/>