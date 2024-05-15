<script>
	import App from './App.svelte';
	let a = 0;
</script>

<button on:click={() => a++}>increment</button>
<App {a} />
