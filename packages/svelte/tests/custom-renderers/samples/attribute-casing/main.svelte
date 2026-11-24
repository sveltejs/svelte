<script>
	let box = $state('0 0 100 100');
	let spread = $derived({ dataValue: 'spread', onClick: () => {} });
</script>

<div dataColor="red">static camelCase</div>
<div viewBox={box}>dynamic camelCase</div>
<span tabIndex="0">static tabIndex</span>
<p {...spread}>spread camelCase</p>
