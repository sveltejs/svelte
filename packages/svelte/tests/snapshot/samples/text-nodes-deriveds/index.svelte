<script>
	let count1=$state(0);
	let count2=$state(0);

	function text1(){
		return count1;
	}

	function text2(){
		return count2;
	}
</script>

<p>{text1()}{text2()}</p>