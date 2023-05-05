<script>
  import { readable } from "svelte/store";
  const array = [];
  for (let i = 1; i < 10; i++) {
    array.push(readable(i));
  }

  let ten_factorial = 1;
  for (var read of array) {
    ten_factorial *= $read;
  }

  let sum_to_ten = 0;
  for (var read2 of array.reverse())
    sum_to_ten += $read2; 
</script>

<p>{ten_factorial}</p>
<p>{$read}</p>
<p>{sum_to_ten}</p>
<p>{$read2}</p>
<p>{typeof read}</p>
<p>{typeof read.subscribe}</p>
<p>{typeof read2}</p>
<p>{typeof read2.subscribe}</p>
