<script lang="ts">
	interface Props {
		limit?: number;
		limits?: number[];
		labels?: string[];
		flags?: boolean[];
		empty?: any;
		mixed?: any;
		spread?: any;
		expressions?: any;
		nullable?: any;
		annotated?: (number | string)[];
	}

	let {
		limit = 25,
		limits = [10, 25, 50, 100, 200],
		labels = ['small', 'large'],
		flags = [true, false],
		empty = [],
		mixed = [1, 'two'],
		spread = [...limits],
		expressions = [limit],
		nullable = [null],
		annotated = [1, 2]
	}: Props = $props();
</script>