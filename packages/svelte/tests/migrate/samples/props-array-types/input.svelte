<script lang="ts">
	export let limit = 25;
	export let limits = [10, 25, 50, 100, 200];
	export let labels = ['small', 'large'];
	export let flags = [true, false];
	export let empty = [];
	export let mixed = [1, 'two'];
	export let spread = [...limits];
	export let expressions = [limit];
	export let nullable = [null];
	export let annotated: (number | string)[] = [1, 2];
</script>
