# List diffing

## [ABCDE] -> [ABCD]

* o = 5, n = 4. Compare E and D
  E is not present in new list, so remove. o--
* o = 4, n = 4. Compare D and D
  same, so continue (repeat)

## [ABCD] -> [ABCDE]

* o = 4, n = 5. Compare D and E
  E is not present in old list, so create/insert. n--
* o = 4, n = 4. Compare D and D
  same, so continue (repeat)

## [ABCDE] -> [BCDE]

* o = 5, n = 4. Compare E and E, D and D, C and C, B and B
* o = 1, n = 0. A is left over, so remove

## [BCDE] -> [ABCDE]

* o = 4, n = 5. Compare E and E, D and D, C and C, B and B
* o = 0, n = 1. insert A

## [ABCDEFGHIJKL] -> [ABCGHIDEFJKL]

* o = 12, n = 12. Compare J, K, L
* o = 9, n = 9. Compare I and F
  * delta is 3 for both. insertion wins. insert F. mark as moved. n--
* o = 9, n = 8. Compare I and E
  * delta is 3 for both. insertion wins. insert E. mark as moved. n--
* o = 9, n = 7. Compare I and D
  * delta is 3 for both. insertion wins. insert D. mark as moved. n--
* o = 9, n = 6. Compare I and I. Repeat
* o = 6, n = 3. Compare F and C. F was moved, o--
* o = 5, n = 3. Compare E and C. E was moved, o--
* o = 4, n = 3. Compare D and C. D was moved, o--
* o = 3, n = 3. Compare C and C. Repeat

## [ABCDEFG] -> [AFCDEBG]

* o = 7, n = 7. Compare G and G
* o = 6, n = 6. Compare F and B
  * both exist. in both cases, delta is 4. insertion wins. insert B. mark B as moved. n--
* o = 6, n = 5. Compare F and E
  * both exist. delta(F) is 4, delta(E) is 0, so we put F into a side pile. o--
* o = 5, n = 5. E/E. Repeat
* o = 2, n = 2. Compare B and F
  * F is in side pile, so insert. n--
* o = 2, n = 1. Compare B and A
  * B was displaced. o--
* o = 1, n = 1. Compare A and A

## [ABCDEFGHIJKL] -> [IHGFED]

* o = 12, n = 6. Compare L and D. L is removed, o--
* o = 11, n = 6. Compare K and D. K is removed, o--
* o = 10, n = 6. Compare J and D. J is removed, o--
* o = 9, n = 6. Compare I and D. delta(I) is 8, delta(D) is 2. put I in side pile. o--
* o = 8, n = 6. Compare H and D. delta(H) is 6, delta(D) is 2. put H in side pile. o--
* o = 7, n = 6. Compare G and D. delta(G) is 4, delta(D) is 2. put G in side pile. o--
* o = 6, n = 6. Compare F and D. delta(F) is 2, delta(D) is 2. insertion wins, mark D as moved. n--
* o = 6, n = 5. Compare F and E. delta(F) is 2, delta(E) is 0. put F in side pile. o--
* o = 5, n = 5. Compare E and E. o--, n--
* o = 4, n = 4. Compare D and F. F is in side pile, so insert. n--
* o = 4, n = 3. Compare D and G. G is in side pile, so insert. n--
* o = 4, n = 2. Compare D and H. H is in side pile, so insert. n--
* o = 4, n = 1. Compare D and I. I is in side pile. so insert. n--
* o = 3, n = 0. Remove remaining old items

## [FABED] -> [BEADF]

* [FABED] o = 5, n = 5. Compare D and F. delta(F) > delta(D), so we move F, and mark as such. n--
* [ABEDF] o = 5, n = 4. Compare D and D. o--, n--
* [ABEDF] o = 4, n = 3. Compare E and A. delta(E) > delta(A), so we mark E as will_move. o--
* [ABEDF] o = 3, n = 3. Compare B and A. delta(B) > delta(A), so we mark B as will_move. o--
* [ABEDF] o = 2, n = 3. Compare A and A. o--. n--
* [ABEDF] o = 1, n = 2. Compare F and E. F was marked as moved, o--
* [ABEDF] o = 0, n = 2. Insert E then B from will_move
