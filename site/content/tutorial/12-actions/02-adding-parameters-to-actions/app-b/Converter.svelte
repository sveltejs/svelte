<script>
	import { convertable } from './convertable.js';

	export let symbol;
	export let text;
</script>

<style>
	div {
		align-items: center;
		background-color: #fafafa;
		border: 1px solid #bfbfbf;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
		cursor: default;
		display: flex;
		height: 50px;
		justify-content: center;
		transition: box-shadow 0.3s ease-in-out, transform 0.3s;
		width: 50px;
	}

	div:hover {
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
		transform: scale(1.1, 1.1);
	}

	span {
		cursor: default;
		font-size: 25px;
	}
</style>

<div use:convertable={{ symbol, text }}>
	<span>{symbol}</span>
</div>
