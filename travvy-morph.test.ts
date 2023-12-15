import { JSDOM } from "jsdom";
import { shittyMorph } from "./client/shitty-morph";
import { describe, expect, test, beforeEach } from "bun:test";

describe("morphDom", () => {
    let dom: JSDOM;
    let document: Document;

    beforeEach(() => {
        dom = new JSDOM();
        document = dom.window.document;
    });

    test("should replace old content with new content", () => {
        const oldNode = document.createElement("div");
        oldNode.innerHTML = "<p>Old paragraph</p><ul><li>Old item</li></ul>";

        const newContent = "<p>New paragraph</p><ul><li>New item</li></ul>";
        shittyMorph(oldNode, newContent);

        expect(oldNode.innerHTML).toBe(newContent);
    });

    test("should not modify identical parts", () => {
        const oldNode = document.createElement("div");
        oldNode.innerHTML = "<p>Same paragraph</p><ul><li>Old item</li></ul>";

        const newContent = "<p>Same paragraph</p><ul><li>New item</li></ul>";
        shittyMorph(oldNode, newContent);

        const expectedNode = document.createElement("div");
        expectedNode.innerHTML = newContent;

        expect(oldNode.isEqualNode(expectedNode)).toBe(true);
    });

    test("should handle empty new content", () => {
        const oldNode = document.createElement("div");
        oldNode.innerHTML = "<p>Old paragraph</p><ul><li>Old item</li></ul>";

        const newContent = "";
        shittyMorph(oldNode, newContent);

        expect(oldNode.innerHTML).toBe(newContent);
    });

    // test("should handle large amounts of data", () => {
    //     const oldNode = document.createElement("div");
    //     oldNode.innerHTML = "<p>".repeat(10000) + "</p>".repeat(10000);

    //     const newContent = "<p>".repeat(10000) + "New paragraph" + "</p>".repeat(10000);
    //     morphDom(oldNode, newContent);

    //     expect(oldNode.innerHTML).toBe(newContent);
    // });
});
