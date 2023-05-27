<script>
	let obj = { key: 1, value: 3 };

	export function mutate() {
		obj.value = 5;
	}
	export function reassign() {
		obj = { key: 1, value: 7 };
	}
	export function changeKey() {
		obj.key = 3;
	}
</script>

{#key obj.key}
	<div>{obj.value}</div>
{/key}