<script lang="ts">
	interface Props {
		class?: string;
	}

	let { class: klass = '' }: Props = $props();
	
</script>

{klass}