import { writable } from '../../../../store';

export default {
	props: {
    s1: writable(42),
    s2: writable(43),
    p1: 2,
    p3: 3,
    a1: writable(1),
    a2: 4,
    a6: writable(29),
    for: 'loop',
    continue: '...',
	},

	html: `
    $s1=42
    $s2=43
    p1=2
    p3=3
    $v1=1
    v2=4
    vi1=4
    $vs1=1
    vl1=test
    $s3=29
    loop...
  `
}
