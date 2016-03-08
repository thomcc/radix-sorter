var RadixSorter = (function() {
	'use strict';

	//
	// Implements of radix sort, and includes the ability to perform
	// the algorithm on arrays of floats (only 32 bit floats).
	//
	// After sorting, you can access the indices of the sorted array in
	// `resultIndices` (that is, this does not modify it's input array --
	// well, not in any externally visible manner at least, we do some bit
	// hacking on members of Float32Arrays, to make the algorithm work, but
	// we fix them before returning)
	//
	// In practice, having access to the sorted indices is a million
	// times more useful than just sorting the array in place, given that
	// this only allows purely numeric input.
	//

	// Insertion sort is used for relatively small inputs and inputs with unsupported types,
	// Unless the user forces us to use radix sort (we'll still use insertion sort if the type
	// is unsupported in this case though)
	function insertionSort(self, input) {
		var indices = self._indices1;
		var count = input.length
		if (!self._indicesValid) {
			indices[0] = 0;

			for (var i = 1; i !== count; ++i) {
				var rank = i;
				indices[i] = rank;

				var j = i;
				while (j !== 0 && input[rank] < input[indices[j-1]]) {
					indices[j] = indices[j-1];
					--j;
				}

				if (i !== j) {
					indices[j] = rank;
				}
			}

			self._indicesValid = true;
		}
		else {
			for (var i = 1; i !== count; ++i) {
				var rank = indices[i];

				var j = i;
				while (j !== 0 && input[rank] < input[indices[j-1]]) {
					indices[j] = indices[j-1];
					--j;
				}

				if (i !== j) {
					indices[j] = rank;
				}
			}
		}
	}

	// builds the histogram for radix sort.
	// returns the uint8array of the input bytes
	// ... because we want to avoid allocating it twice.
	function buildHistograms(input, histogram) {
		// @@NOTE: assumes little endian -- these should be in reverse order
		// for big endian
		var h0 = 0;
		var h1 = 256;
		var h2 = 512;
		var h3 = 768;

		var inBytes = new Uint8Array(input.buffer, input.byteOffset, input.byteLength);

		for (var i = 0, l = histogram.length|0; i < l; ++i) {
			histogram[i] = 0;
		}

		var p = 0;
		var pe = input.byteLength|0;

		var bpe = input.BYTES_PER_ELEMENT|0;

		for (var p = 0, l = input.byteLength|0; p !== l;) {
			histogram[h0 + inBytes[p++]]++;
			if (bpe >= 2) {
				histogram[h1 + inBytes[p++]]++;
				if (bpe >= 4) {
					histogram[h2 + inBytes[p++]]++;
					histogram[h3 + inBytes[p++]]++;
				}
			}
		}
		return inBytes;
	}

	// manipulate the bits of floats such that we can pretend they're
	// unsigned integers and have it sort correctly.
	function flipFloat(u) {
		var f = ~~u;
		var mask = (f >> 31) | 0x80000000;
		return (u ^ mask) >>> 0;
	}

	// inverse of the above function.
	function unflipFloat(u) {
		var mask = ((((u >>> 31) - 1) >>> 0) | 0x80000000) >>> 0;
		return (u ^ mask) >>> 0;
	}

	// Scratch memory. Allocated globally since we only need
	// it for the duration of the sort.
	var HISTOGRAM = new Uint32Array(256*8);
	var LINK = new Uint32Array(256);

	function radixSort(self, input) {
		var passes = input.BYTES_PER_ELEMENT >>> 0;

		var histogram = HISTOGRAM;
		var inputBytes = buildHistograms(input, histogram);
		var link = LINK;
		var count = input.length|0;

		for (var j = 0, hIndex = 0; j < passes; ++j, hIndex += 256) {

			// @@NOTE: assumes little endian. should be passes-1-j for big endian
			var ibIndex = j;

			if (histogram[hIndex + inputBytes[ibIndex]] === count) {
				continue;
			}

			link[0] = 0;

			for (var i = 1; i < 256; ++i) {
				link[i] = link[i - 1] + histogram[hIndex + i - 1];
			}

			if (!self._indicesValid) {
				for (var i = 0; i < count; ++i) {
					var li = inputBytes[ibIndex+i * passes];
					self._indices2[link[li]++] = i;
				}
				self._indicesValid = true;
			}
			else {
				for (var i = 0; i < count; ++i) {
					var idx = self._indices1[i];
					var li = inputBytes[ibIndex+idx*passes];
					self._indices2[link[li]++] = idx;
				}
			}
			// swap
			{
				var tmp = self._indices1;
				self._indices1 = self._indices2;
				self._indices2 = tmp;
			}
		}

		if (!self._indicesValid) {
			for (var i = 0; i < count; ++i) {
				self._indices1[i] = i;
			}
			self._indicesValid = true;
		}
	}

	function RadixSorter(size) {
		this._size = 0;
		this._indices1 = null;
		this._indices2 = null;
		this._indicesValid = false;
		if (size) {
			this.setSize(size);
		}
	}

	RadixSorter.prototype.setSize = function(size) {
		this._indicesValid = false;
		if (this._size !== size) {
			if (size !== 0) {
				if (!this._indices1 || !this._indices2 || this._indices1.length !== size || this._indices2.length !== size) {
					if (this._indices1 && this._indices1.buffer.byteLength >= size*4) {
						this._indices1 = new Uint32Array(this._indices1.buffer, 0, size);
					}
					else {
						this._indices1 = new Uint32Array(size);
					}
					if (this._indices2 && this._indices2.buffer.byteLength >= size*4) {
						this._indices2 = new Uint32Array(this._indices2.buffer, 0, size);
					}
					else {
						this._indices2 = new Uint32Array(size);
					}
				}
			}
			this._size = size;
		}
	};

	RadixSorter.prototype.release = function() {
		this._size = 0;
		this._indices1 = null;
		this._indices2 = null;
		this._indicesValid = false;
	};

	RadixSorter.prototype.isSorted = function() {
		return this._indicesValid;
	};

	RadixSorter.prototype.results = function() {
		if (!this._indicesValid) {
			throw Error("RadixSorter#results() called without sorting anything");
		}
		return this._indices1;
	};


	RadixSorter.prototype.sort = function(input, forceRadix) {
		if (input == null || input.length === 0) {
			return [];
		}
		if ((input instanceof Uint32Array) || (input instanceof Uint16Array) || (input instanceof Uint8Array)) {
			return this.sortUint(input);
		}
		if ((input instanceof Int32Array) || (input instanceof Int16Array) || (input instanceof Int8Array)) {
			return this.sortInt(input);
		}
		if (input instanceof Float32Array) {
			return this.sortFloat(input);
		}
		// console.warn("Unsupported type. Falling back to insertion sort");
		this.setSize(input.length);
		insertionSort(this, input);
		return this.results();
	};

	RadixSorter.prototype.sortUint = function(input, forceRadix) {
		if (input == null || input.length === 0) {
			return;
		}
		this.setSize(input.length);
		if (!forceRadix && input.length < 32) {
			insertionSort(this, input);
		}
		else {
			radixSort(this, input);
		}
		return this.results();
	};

	RadixSorter.prototype.sortInt = function(input, forceRadix) {
		if (input == null || input.length === 0) {
			return;
		}
		this.setSize(input.length);
		if (!forceRadix && input.length < 32) {
			insertionSort(this, input);
		}
		else {
			var asUint = null;
			switch (input.BYTES_PER_ELEMENT) {
				case 1: asUint = new Uint8Array(input.buffer, input.byteOffset, input.length); break;
				case 2: asUint = new Uint16Array(input.buffer, input.byteOffset, input.length); break;
				case 4: asUint = new Uint32Array(input.buffer, input.byteOffset, input.length); break;
				default: throw Error("bad input to RadixSorter#sortInt");
			}
			var intMin = (1 << (input.BYTES_PER_ELEMENT*8 - 1)) >>> 0;
			for (var i = 0; i < asUint.length; ++i) {
				asUint[i] ^= intMin;
			}
			radixSort(this, asUint);
			for (var i = 0; i < asUint.length; ++i) {
				asUint[i] ^= intMin;
			}
		}
		return this.results();
	};

	RadixSorter.prototype.sortFloat = function(input, forceRadix) {
		if (input == null || input.length === 0) {
			return [];
		}
		this.setSize(input.length);
		if (!forceRadix && input.length < 32) {
			insertionSort(this, input);
		}
		else {
			var asUint = new Uint32Array(input.buffer, input.byteOffset, input.length);
			// handle negative floats
			for (var i = 0; i < asUint.length; ++i) {
				asUint[i] = flipFloat(asUint[i]);
			}
			radixSort(this, asUint);
			// undo the damage.
			for (var i = 0; i < asUint.length; ++i) {
				asUint[i] = unflipFloat(asUint[i]);
			}
		}
		return this.results();
	}

	return RadixSorter;
}())

if ((typeof module !== 'undefined') && module.exports) {
	module.exports = RadixSorter;
}
