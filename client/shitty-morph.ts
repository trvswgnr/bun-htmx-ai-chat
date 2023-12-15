export function shittyMorph(oldNode: Element | EventTarget | null, newNode: Node | string): void {
    if (!(oldNode instanceof Node)) {
        return;
    }

    // if the new node is a string then create a new element from it
    if (typeof newNode === "string") {
        const tag = oldNode instanceof Element ? oldNode.tagName : "template";
        const newBaseForNewNode = document.createElement(tag);
        newBaseForNewNode.innerHTML = newNode;
        newNode = newBaseForNewNode;
    }

    // if the nodes are the same then do nothing
    if (oldNode.isEqualNode(newNode)) {
        return;
    }

    // check if the nodes have the same type and name
    if (oldNode.nodeType === newNode.nodeType && oldNode.nodeName === newNode.nodeName) {
        // update the node value if it's a text node
        if (oldNode.nodeType === Node.TEXT_NODE) {
            if (oldNode.nodeValue !== newNode.nodeValue) {
                oldNode.nodeValue = newNode.nodeValue;
            }
        } else {
            // update the attributes if it's an element node
            updateAttributes(oldNode as HTMLElement, newNode as HTMLElement);
        }
    } else {
        // replace the old node with the new one if they are different
        oldNode.parentNode?.replaceChild(newNode, oldNode);
        return;
    }

    // compare the child nodes
    const oldChildren = Array.from(oldNode.childNodes);
    const newChildren = Array.from(newNode.childNodes);

    for (let i = 0; i < newChildren.length; i++) {
        if (i < oldChildren.length) {
            // recursively morph the child nodes
            shittyMorph(oldChildren[i], newChildren[i]);
        } else {
            // append the extra new child nodes
            oldNode.appendChild(newChildren[i].cloneNode(true));
        }
    }

    // remove the extra old child nodes
    while (oldChildren.length > newChildren.length) {
        oldNode.removeChild(oldChildren.pop()!);
    }
}

function updateAttributes(oldElement: HTMLElement, newElement: HTMLElement): void {
    // get the old and new attributes
    const oldAttributes = oldElement.attributes;
    const newAttributes = newElement.attributes;

    // create a map of the new attributes for faster lookup
    const newAttributesMap = new TravvyMap();
    for (let i = 0; i < newAttributes.length; i++) {
        const attr = newAttributes[i];
        newAttributesMap.set(attr.name, attr);
    }

    // update or remove the old attributes
    for (let i = 0; i < oldAttributes.length; i++) {
        const attr = oldAttributes[i];
        const newAttr = newAttributesMap.get(attr.name);
        if (newAttr) {
            // update the attribute if it exists in the new attributes
            if (attr.value !== newAttr.value) {
                oldElement.setAttribute(attr.name, newAttr.value);
            }
            // remove the attribute from the map to avoid adding it again
            newAttributesMap.delete(attr.name);
        } else {
            // remove the attribute if it doesn't exist in the new attributes
            oldElement.removeAttribute(attr.name);
        }
    }

    // add the new attributes
    for (const attr of newAttributesMap.values()) {
        oldElement.setAttribute(attr.name, attr.value);
    }
}

// a manual implementation of Map with <string, Attr> for better performance
class TravvyMap {
    private readonly keys: string[] = [];
    private readonly _values: Attr[] = [];

    public get(key: string): Attr | undefined {
        const index = this.keys.indexOf(key);
        if (index === -1) return undefined;
        return this._values[index];
    }

    public set(key: string, value: Attr): void {
        const index = this.keys.indexOf(key);
        if (index === -1) {
            this.keys.push(key);
            this._values.push(value);
        } else {
            this._values[index] = value;
        }
    }

    public delete(key: string): void {
        const index = this.keys.indexOf(key);
        if (index === -1) return;
        this.keys.splice(index, 1);
        this._values.splice(index, 1);
    }

    public values(): IterableIterator<Attr> {
        return this._values.values();
    }
}
