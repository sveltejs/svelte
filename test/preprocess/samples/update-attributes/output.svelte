<script a="b" insert="foobar"></script>

<script context="module" foo="a" insert="foobar">
  let a = 1;
</script>

<script a="a=3" b="qwe" d="{a}" e f class="a {asdf} qwe" insert="foobar">
  let a = 1;
</script>

<script a="'a' b `c`" b='"a cd `""' insert="foobar">
</script>

{a}