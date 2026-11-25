<script lang="ts">
	let items = $state(['a', 'b', 'c']);
	let visible = $state(true);

	export function shuffle() {
		items = ['c', 'a', 'd'];
	}

	export function toggle() {
		visible = !visible;
	}
</script>

<view
	>{#if visible}<banner />{/if}{#each items as item (item)}<item>{item}</item>{/each}
	<footer /></view
>
