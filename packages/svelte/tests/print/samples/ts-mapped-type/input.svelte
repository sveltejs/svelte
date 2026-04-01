<script lang="ts">
	type Mapped = {
		readonly [K in keyof T]: T[K];
	};

	type OptionalMapped = {
		[K in keyof T]?: T[K];
	};

	type ComplexMapped = {
		readonly [K in keyof T]-?: T[K];
	};
</script>
