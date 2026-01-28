<script>
	let { klass, getter_setter } = $props();
</script>

<button onclick={() => {
	klass.y = 2;
	getter_setter.y = 2;
}}>mutate</button>
