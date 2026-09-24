<script lang="ts">
	let visible = true;
	let total = 10;
	let width = 16;
	let height = 9;
	let divisor = 2;
	let options: { fallback?: number } = {};
</script>

{#if visible}
	{const half = total / 2}
	{let derived = $derived(total / 4)}
	{const member = width / height}
	{const call = Math.max(total, 1) / 2}
	{const string_then_division = 'ab' / divisor}
	{const typed: number = total / 2}
	{const { fallback = total / 2 } = options}
	{const regex = /[}]/}
	<p>{half} {derived} {member} {call} {string_then_division} {typed} {fallback} {regex}</p>
{/if}
