<script lang="ts">
	let count = $state(0);
	let other = $state(0);

	export function bump_other() {
		other++;
	}

	export function read_other() {
		return other;
	}
</script>

<button onclick={() => count++}>increment</button>

<output>{count}</output>
