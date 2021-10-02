<script>
	var a;
	var {a, b: [d, f], c}= {a: 1, b: [1, 2], c: 2};
	$: {
		function one() {
			var a = 'a';
			function two() {
				var a = 'b';
				return a;
			}
			return two();
		}
		a = one();
		for (var i = 0; i<5; i ++ ) {
			// Todo
		}
	}
</script>

<h1>Hello {a}</h1>
