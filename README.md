# RadixSorter

Implementation of the radix sort algorithm in JavaScript. Notably, this provides an array containing the indices you need to visit to iterate over the items in sorted order, which makes this actually usable in practice.

Only works on TypedArrays, and doesn't support Float64Array. It will fall back to an implementation of insertion sort for Float64Array.

It will also use insertion sort if the array is small (< 32 items), since this tends to be better for performance.

## Usage

Either use it as a module or include the radix-sorter.js file in your project.

### API

Provides a type `RadixSorter`. Since radix sort is an algorithm that requires some extra memory, this is used to hold onto that, and reuse it if possible.

- `new RadixSorter(size=0)`. Produce a RadixSorter with a backing array of size `size`.
- `RadixSorter.prototype.sort(array, forceRadix=false)`: Compute the sorted indices of `array`, and store them in the RadixSorter's results array. Returns said results array, which is valid until the next time you call `sort` on this RadixSorter (If you want to hold on to it for longer, either use `release`, or make a copy). By default, we will only run radix sort on arrays over 32 items, and use insertion sort for other types. If you pass true for forceRadix, we'll ignore that heuristic. Note that as of the current version, we only implement RadixSort for the types `Int8Array`, `Int16Array`, `Int32Array`, `Uint8Array`, `Uint16Array`, `Uint32Array`, and `Float32Array`. ***Specifically, radix sort on `Float64Array` is not (yet) implemented.*** Instead, these types will always perform insertion sort (even if you pass true as your forceRadix parameter). Sorting a plain `Array` isn't implemented at all.
- `RadixSorter.prototype.setSize(size)`: Manually set the size to size.
- `RadixSorter.prototype.release()`: Set the size to 0 and remove all references to the results array. After calling this, isSorted will return false again. Calling this on an uninitialized RadixSorter is fine.
- `RadixSorter.prototype.isSorted()`: Is the results sorted? This is false until you use it to sort something.
- `RadixSorter.prototype.results()`: Get the results array, in case you missed it when calling `sort()`. This is an array of the indices you need to use to iterate over the argument to `sort` in sorted order.
- `RadixSorter.prototype.sortUint(array, forceRadix)`: This is called by `sort` if you pass a Uint32Array, Uint16Array, or Uint8Array. It's public, since it could be useful if you need to sort a typed array from a different realm (which will mean we are unable to automatically detect it's type).
- `RadixSorter.prototype.sortInt(array, forceRadix)`: This is called by `sort` if you pass a Int32Array, Int16Array, or Int8Array. It's public, since it could be useful if you need to sort a typed array from a different realm (which will mean we are unable to automatically detect it's type).
- `RadixSorter.prototype.sortFloat(array, forceRadix)`: Same as `sortUint` but for `Float32Array`.

Usage example


```javascript

var particles = [... some stuff here];

// ... etc.

var r = new RadixSorter();

function detectCollisions() {
	var r = new RadixSorter();
	var sortBounds = new Float32Array(particles.length);
	for (var i = 0; i < particles.length; ++i) {
		sortBounds[i] = particles[i].x - particles[i].radius;
	}

	var sortedIndices = r.sort(sortBounds);

	for (var i = 0; i < sortedIndices.length; ++i) {
		var si = sortedIndices[i];
		for (var j = i+1; j < sortedIndices.length; ++j) {
			var sj = sortedIndices[j];
			if (particles[j].x-particles[j].size > particles[i].x+particles[i].size) {
				break;
			}
			// ... etc.
		}
	}
}
```

### TODO

- Sorting `Float64Array`s.
- Figure out where the best heuristic cutoff for insertion sort is (we use 32 now, but maybe it should be 64, or 128?).
- Allow sorting of `Array`s based on some mapping function between the array items and the sort key.
- Allowing user to specify a stride between items e.g. if you had [v0x, v0y, v0z, v1x, v1y, v1z, ...] and wanted to sort by x coordinates.
- Allow user to perform the float/sint flip on their end, useful for the scenerio where they have to create/populate the array of sort keys immediately before sorting.
- Allow user to specify that the array won't be used after, and so we don't have to do the float/sint flip after sorting.

## License

The MIT License (MIT)

Copyright (c) 2016 Thom Chiovoloni

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
