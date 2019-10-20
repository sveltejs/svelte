<script>
  let photo = '';
</script>
<!-- success -->
<img src="foo" alt="Foo eating a sandwich." />
<img src="bar" aria-hidden alt="Picture of me taking a photo of an image" />
<img src="baz" alt={`Baz taking a ${photo}`} />
<!-- fail -->
<img src="foo" alt="Photo of foo being weird." />
<img src="bar" alt="Image of me at a bar!" />
<img src="baz" alt="Picture of baz fixing a bug." />
<img src="baz" alt={'Baz taking a photo'} />
<img src="baz" alt={`Baz taking a ${photo} photo`} />
