<script lang="ts">
	interface Props {
		active?: boolean;
		onclick: (e: MouseEvent) => void;
	}

	let { active, onclick }: Props = $props();
</script>

<button type="button" class={{ active }} {onclick}>
	{active}
</button>

<style>
	.active {
		background: green;
	}
</style>
