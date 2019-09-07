<script>
		let toggle = false;
		let num = 1

    function _toggleMe() {

        if (toggle = !toggle) {
            console.log(toggle);
        } else {
            console.log(toggle);
        }
		}

		function _increaseMe(){
			if(num += 3){
				console.log('num has been increased')
			}
		}

</script>

<button on:click={_toggleMe}>Click</button>
<span class="text {toggle ? "red" : "blue"}">
    text + {num}
</span>
