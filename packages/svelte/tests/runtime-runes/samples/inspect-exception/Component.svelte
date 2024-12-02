<script lang="ts">
	let { a = $bindable() } = $props();

	$inspect(a).with((t, c) => console.log(t, c));

</script>
<p>{a}</p>
