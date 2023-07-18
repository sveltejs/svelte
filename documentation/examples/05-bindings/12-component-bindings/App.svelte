<script>
	import Keypad from './Keypad.svelte';

	let pin;
	$: view = pin ? pin.replace(/\d(?!$)/g, '•') : 'enter your pin';

	function handleSubmit() {
		alert(`submitted ${pin}`);
	}
</script>

<h1 class:pin>{view}</h1>

<Keypad bind:value={pin} on:submit={handleSubmit} />

<style>
	h1 {
		color: #ccc;
	}
	h1.pin {
		color: #333;
	}
	:global(body.dark) h1 {
		color: #444;
	}
	:global(body.dark) h1.pin {
		color: #fff;
	}
</style>
