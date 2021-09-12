export function push_array(thisArray: any[], ...otherList: any[]) {
  let count = 0;
  for (let a = 0; a < otherList.length; a++) {
    const other = otherList[a];
    for (let i = 0; i < other.length; i++) {
      thisArray.push(other[i]);
    }
    count += other.length;
  }
  return count;
}
