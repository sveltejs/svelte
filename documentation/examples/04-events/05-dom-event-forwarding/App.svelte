<script>
	import CustomButton from './CustomButton.svelte';

	function handleClick() {
		alert('Le bouton a été cliqué');
	}
</script>

<CustomButton on:click={handleClick} />
