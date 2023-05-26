<script>
  var name = 'name';
  var c = 'cc';
  let d = 'd';
  $: {
      function a() {
        function b() {
          var c = 'c';
          return c;
        }
        return b;
      }
    let d = 'dd';
    name = a()();
  }
</script>

<h1>Hello {name}</h1>
