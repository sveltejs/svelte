<script>
	const const1 = 1;
	const const2 = 'const2';

	function foo() {
		return '';
	}
</script>

<!-- canonical case - only markup -->
<div class="class1 class2" style="color:red;">-</div>

<!-- various forms of variable syntax -->
<div class="{const1}">-</div>
<div class={const1}>-</div>

<!-- mixed static string + expressions -->
<div class="class1 {'class2'}">-</div>
<div class="class1 {const2}">-</div>
<div class="class1 {const2}" style={foo()}>-</div>
