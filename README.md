# RadixSorter

Implementation of the radix sort algorithm in JavaScript. Notably, this provides an array containing the indices you need to visit to iterate over the items in sorted order, which makes this actually usable in practice.

Only works on TypedArrays, and right now only implemented for unsigned ints and floats. It will fall back to an implementation of insertion sort for other items.

It will also use insertion sort if the array is small (< 32 items), since this tends to be better for performance.

## Usage

Either use it as a module or include the radix-sorter.js file in your project.

### API

Provides a type `RadixSorter`. Since radix sort is an algorithm that requires some extra memory, this is used to hold onto that, and reuse it if possible.

- `new RadixSorter(size=0)`. Produce a RadixSorter with a backing array of size `size`.
- `RadixSorter.prototype.sort(array, forceRadix=false)`: Compute the sorted indices of `array`, and store them in the RadixSorter's results array. Returns said results array, which is valid until the next time you call `sort` on this RadixSorter (If you want to hold on to it for longer, either use `release`, or make a copy). By default, we will only run radix sort on arrays over 32 items, and use insertion sort for other types. If you pass true for forceRadix, we'll ignore that heuristic. Note that as of the current version, we only implement RadixSort for the types `Uint8Array`, `Uint16Array`, `Uint32Array`, and `Float32Array`. ***Specifically, radix sort on `Int{X}Array` and `Float64Array` are not yet implemented.*** Instead, these types will always perform insertion sort (even if you pass true as your forceRadix parameter).
- `RadixSorter.prototype.setSize(size)`: Manually set the size to size.
- `RadixSorter.prototype.release()`: Set the size to 0 and remove all references to the results array. After calling this, isSorted will return false again. Calling this on an uninitialized RadixSorter is fine.
- `RadixSorter.prototype.isSorted()`: Is the results sorted? This is false until you use it to sort something.
- `RadixSorter.prototype.results()`: Get the results array, in case you missed it when calling `sort()`. This is an array of the indices you need to use to iterate over the argument to `sort` in sorted order.
- `RadixSorter.prototype.sortUint(array, forceRadix)`: This is called by `sort` if you pass a Uint32Array, Uint16Array, or Uint8Array. It's public, since it could be useful if you need to sort a typed array from a different realm (which will mean we are unable to automatically detect it's type).
- `RadixSorter.prototype.sortFloat(array, forceRadix)`: Same as `sortUint` but for `Float32Array`.

Usage example


```javascript

var particleSize = 10;
var particleXs = new Float32Array(...);
var particleYs = new Float32Array(...);
// ... etc.


var r = new RadixSorter();

function detectCollisions() {
	var r = new RadixSorter();
	var sortedIndices = r.sort(particleXs);

	for (var i = 0; i < sortedIndices.length; ++i) {
		var si = sortedIndices[i];
		for (var j = i+1; j < sortedIndices.length; ++j) {
			var sj = sortedIndices[j];
			var dx = particleXs[sj]-particleXs[si];
			var dy = particleYs[sj]-particleYs[si];
			if (dx > particleSize*2) {
				break
			}
			// etc.
		}
	}
}

```

### TODO

- Sorting IntXArrays and Float64Arrays
- Allowing user to specify a stride between items e.g. if you had [v0x, v0y, v0z, v1x, v1y, v1z, ...] and wanted to sort by x coordinates.


## License

MIT
