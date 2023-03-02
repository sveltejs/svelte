<script>
	import Select from "./Select.svelte";
	let value = {
		a: "1",
		b: "1",
	};
	const options = ["1", "2", "3"];
	export let label = "test";
</script>

<Select bind:value={value.a} {options} label={label} />
