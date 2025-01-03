<script>
	let { open: is_open = $bindable() } = $props();

	export function open(){
		is_open = !is_open;
	}
</script>

<button onclick={open}>{is_open}</button>