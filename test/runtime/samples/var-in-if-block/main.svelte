<script>
  export var condition;

  if (condition) {
    var b = 123;
    var c = 0;
  } else {
    var b = 0;
    var c = 456;
  }
</script>

<p>{condition}</p>
<p>{b}</p>
<p>{c}</p>
