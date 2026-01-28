<script lang="ts">
	interface $$Props {
		/** foo */
		foo: string;
		bar: boolean;
		/** should not create a prop */
		type_only: boolean;
	}

	export let foo: $$Props['foo'];
	export let bar = true;

	foo = '';
</script>
