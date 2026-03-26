<script lang="ts">
	class GenericBase<T> {
		value: T;

		constructor(value: T) {
			this.value = value;
		}
	}

	class Subclass extends GenericBase<string> {
		constructor(value: string) {
			super(value);
		}
	}
</script>
