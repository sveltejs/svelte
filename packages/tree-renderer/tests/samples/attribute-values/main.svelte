<script lang="ts">
	let position = $state([1, 2, 3]);

	export function move() {
		position = [4, 5, 6];
	}
</script>

<mesh {position} />
