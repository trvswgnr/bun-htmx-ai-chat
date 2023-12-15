class MapNode<K extends string, V> {
    key: K;
    value: V;
    next: MapNode<K, V> | null;

    constructor(key: K, value: V, next: MapNode<K, V> | null = null) {
        this.key = key;
        this.value = value;
        this.next = next;
    }
}

export class HashMap<K extends string, V> {
    private buckets: Array<MapNode<K, V> | null>;
    private numBuckets: number;
    private size: number;

    constructor(numBuckets = 16) {
        this.buckets = new Array(numBuckets).fill(null);
        this.numBuckets = numBuckets;
        this.size = 0;
    }

    private hash(input: K): number {
        let hash = 5381; // Initial value
        let i = input.length;

        while (i) {
            hash = (hash * 33) ^ input.charCodeAt(--i);
        }

        /* JavaScript bitwise operations actually work with 32bits numbers, so we
         * use double bitwise NOT ~~ to convert hash back to 32bits (as JavaScript numbers are 64-bit float)
         */
        return hash >>> 0;
    }

    put(key: K, value: V): void {
        const index = this.hash(key);
        let node = this.buckets[index];

        // If the bucket is empty, add the new node.
        if (node === null) {
            this.buckets[index] = new MapNode(key, value);
            this.size++;
        } else {
            // Search for the key in the bucket.
            while (node !== null) {
                if (node.key === key) {
                    // Key found, update the value.
                    node.value = value;
                    return;
                }
                if (node.next === null) {
                    // End of the bucket, add the new node.
                    node.next = new MapNode(key, value);
                    this.size++;
                    return;
                }
                node = node.next;
            }
        }

        // Check the load factor and resize if necessary.
        if (this.size / this.numBuckets > 0.7) {
            this.resize(this.numBuckets * 2);
        }
    }

    private resize(newNumBuckets: number): void {
        const newBuckets = new Array(newNumBuckets).fill(null);
        for (let i = 0; i < this.numBuckets; i++) {
            let node = this.buckets[i];
            while (node !== null) {
                const newIndex = this.hash(node.key);
                newBuckets[newIndex] = new MapNode(node.key, node.value, newBuckets[newIndex]);
                node = node.next;
            }
        }
        this.buckets = newBuckets;
        this.numBuckets = newNumBuckets;
    }

    async get(key: K): Promise<V | null> {
        const index = await this.hash(key);
        let node = this.buckets[index];

        // Search for the key in the bucket.
        while (node !== null) {
            if (node.key === key) {
                // Key found, return the value.
                return node.value;
            }
            node = node.next;
        }

        // Key not found, return null.
        return null;
    }
}
