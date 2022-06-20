<script>
	function reverse(str) {
		let reversed = '';
		let i = str.length;
		while ( i-- ) reversed += str[i];
		return reversed;
	}
</script>

<p>{reverse('backwards')}</p>
