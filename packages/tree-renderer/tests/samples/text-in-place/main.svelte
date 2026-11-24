<script lang="ts">
	let count = $state(0);

	export function increment() {
		count += 1;
	}
</script>

<label>count: {count}</label>
