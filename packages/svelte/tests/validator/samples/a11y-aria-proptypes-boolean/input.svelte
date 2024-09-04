<script>
    const abc = 'abc';
</script>

<button aria-disabled="yes" aria-label="Button"></button>
<button aria-disabled="no" aria-label="Button"></button>
<button aria-disabled={1234} aria-label="Button"></button>
<button aria-disabled={`${abc}`} aria-label="Button"></button>
