function findInArray(arr, element) {
  if (arr.length === 0) return false;

  if (arr[0] === element) return true;

  return findInArray(arr.slice(1), element);
}

console.log(findInArray([1, 2, 3, 4, 5], 9));
console.log(findInArray(["a", "b", "c"], "b"));
