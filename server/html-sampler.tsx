export function HTMLSampler() {
    return (
        <>
            <center>
                <h1>AN HTML SAMPLER</h1>
            </center>
            <p>
                HTML--<b>H</b>yper<b>T</b>ext <b>M</b>arkup <b>L</b>anguage, is the formatting code
                that enables browsers such as Netscape, Internet Explorer, Firefox, and Opera to
                present a web page the way you as the page's creator intend. HTML tells the browser
                where paragraphs begin and end, which words should be in <b>bold</b> or{" "}
                <i>italics</i>, where to put graphics, etc.
            </p>
            <p>
                {" "}
                HTML codes or "tags" are placed within pointed brackets: <b>&lt; &gt;</b>. Many but
                not all tags come in pairs that start and end the function. The tags in the pair
                look the same except that the "end function" tag includes a forward slash ({" "}
                <b>/ </b>). For example, <b>&lt;b&gt;</b> tells the browser to begin putting text in
                bold, while <b>&lt;/b&gt; </b> tells the browser to stop doing so. Thus, if I wanted
                to put the words "Please pay attention" in bold, what I would write is{" "}
                <b>&lt;b&gt;Please pay attention&lt;/b&gt;</b>.
            </p>
            <p>
                {" "}
                All HTML documents start with the following obligatory tags:
                <br />
            </p>
            <p />
            <b>&lt;html&gt;</b>
            <br />
            <b>&lt;head&gt;</b>
            <br />
            <b>&lt;title&gt;</b>put your page's title here<b>&lt;/title&gt;</b>
            <br />
            <b>&lt;/head&gt;</b>
            <br />
            <b>&lt;body&gt;</b>
            <br />
            <p>
                Here--after the <b>&lt;body&gt;</b> tag--is where you put the content of your web
                page. And at the very end, you close the document with <br />
            </p>
            <p />
            <b>&lt;/body&gt;</b> <br />
            <b>&lt;/html&gt;</b> <p />
            <p />
            <p />
            <p>
                Here are some other useful tags:
                <br />
            </p>
            <p />
            <h1>&lt;h1&gt;A Big Header&lt;/h1&gt;</h1>
            <h2>&lt;h2&gt;You Can Make a Smaller Header &lt;/h2&gt;</h2>
            <h3>&lt;h3&gt;Sometimes Even This Size is Useful &lt;/h3&gt;</h3>
            <p />
            <p>
                <b>&lt;P&gt;</b>Normally, text will look like this. You begin a paragraph by telling
                the web browser that it's looking at a paragraph; to do that, you use the HTML tag{" "}
                <b>&lt;P&gt;</b>. Then just type what you want, and your browser will decide where
                to break the lines. Hitting <b>Enter</b> won't make the line break. If you want to
                make the line break, you have to use a line break symbol, which is <b>&lt;BR&gt;</b>
                . <br />
                As you can see, inserting <b>&lt;BR&gt;</b> is like hitting <b>Enter </b>or{" "}
                <b>Return</b>. It drops whatever comes after it to the start of the next line. When
                you get to the end of your paragraph, put the closing paragraph tag:{" "}
                <b>&lt;/P&gt; </b>
            </p>
            <p>Here are some other things you will need to know:</p>
            <ul>
                <li>All HTML tags are surrounded by pointed brackets: &lt; &gt;</li>
                <li>
                    Because pointed brackets signal HTML commands, you can't use pointed brackets
                    for anything else.
                </li>
                <li>
                    It's very easy to make lists of items, the way I've done here. This is an{" "}
                    <b>unordered list</b>. It has no letters or numbers, just bullets marking each
                    item.
                </li>
                <li>
                    <b>&lt;ul&gt;</b> is the HTML tag to use at the start of an unordered list. Each
                    item in the list begins with the symbol for a list, <b>&lt;li&gt;</b>. You don't
                    need a closing tag for <b>&lt;li&gt;</b>, but when you're done making the list,
                    you should end it with <b>&lt;/ul&gt;</b>, the closing tag for an unordered list
                </li>
            </ul>{" "}
            Your coding will thus look something like this:
            <br />
            <br />
            <b>&lt;ul&gt;</b>
            <br />
            <b>&lt;li&gt;</b>first item on list
            <br />
            <b>&lt;li&gt;</b>second item on list
            <br />
            <b>&lt;li&gt;</b>third item on list
            <br />
            <b>&lt;li&gt;</b>fourth item on list
            <br />
            <b>&lt;/ul&gt;</b>
            <br />
            <p>
                It's just as easy to make an <b>ordered list</b>.
            </p>
            <ol>
                <li>
                    First, you type the code or tag for an ordered list, <b>&lt;ol&gt;</b>
                </li>
                <li>
                    Then, you start making your list of items. Each item starts with the tag for a
                    list, <b>&lt;li&gt;</b>
                </li>
                <li>
                    You don't have to type in the numbers: if you use the tag for an ordered list,
                    your web browser will automatically number the items.
                </li>
                <li>
                    When you finish listing all the items, you use the tag that tells your browser
                    that you've finished with the list: <b>&lt;/ol&gt;.</b>
                </li>
            </ol>
            <p />
            <p>
                A third kind of list is called a <b>definition list</b>. Instead of{" "}
                <b>&lt;ul&gt;</b> or <b>&lt;ol&gt;</b>, you use the tag <b>&lt;dl&gt;</b> (and the
                matching closing tag <b>&lt;/dl&gt;</b>):
            </p>
            <dl>
                <dt>
                    This is item one in a definition list. It starts with the tag <b>&lt;dt&gt; </b>
                    (for "definition term").
                </dt>
                <dt>
                    This is item two. It also starts with the tag <b>&lt;dt&gt;</b>.
                </dt>
                <dd>
                    The nice thing about a definition list is that you can add commentary, as I'm
                    doing here. The commentary is automatically indented. To add commentary to a
                    definition list item, you start the line with <b>&lt;dd&gt;</b> (for "definition
                    description").
                </dd>
                <dt>
                    This is item three. It needn't have commentary, but it can.
                    <br />
                    <br />
                </dt>
                <dt>
                    <img src="gifs/blueball.gif" alt="*" width={14} height={14} /> Another reason to
                    choose a definition list is that you can add your own markers at the start--for
                    example, here I've used a blue bullet.
                </dt>
                <dt>
                    <img src="gifs/blueball.gif" alt="*" width={14} height={14} /> I could start
                    each item on the list with a blue bullet.
                </dt>
                <dt>
                    <img src="gifs/bulletred.gif" alt="*" width={16} height={12} />
                    Or I could switch to red.
                </dt>
                <dt>
                    <img src="gifs/pawred.gif" alt="[paw]" width={16} height={16} /> I needn't
                    restrict myself to bullets.
                </dt>
                <dt>
                    <img src="gifs/bluecheck.gif" alt="[checkmark]" width={20} height={20} />
                    I've started to amass a collection of tiny graphics to use in situations like
                    this.
                </dt>
                <dt>
                    <img src="gifs/bluestarsm.gif" alt="[star]" width={20} height={18} />
                    Here's another.
                </dt>
            </dl>
            <p />
            <br />
            <center>
                <h3>&lt;CENTER&gt;&lt;h3&gt; Oops, almost forgot.... &lt;/h3&gt;&lt;/CENTER&gt;</h3>
            </center>
            <p>
                If you want to <b>center</b> some text, you can use the <b>&lt;center&gt;</b> and{" "}
                <b>&lt;/center&gt;</b> tags. (This is an old way to center text. There are other
                ways that are now officially preferred, but <b>&lt;center&gt;</b> and{" "}
                <b>&lt;/center&gt;</b> tags still work and are easy for beginners.)
            </p>
            <br />
            <center>
                <b>
                    <h3>Including Graphics</h3>
                </b>
            </center>
            <p>
                Let's say you've found some graphics that you'd like to include on your home page.
                Using WS_FTP, Fetch (for the Mac), or some other file transfer program, you've
                managed to upload them to the www directory on your gl account . Now what? How do
                you actually put them on a page? Well, let's suppose you have an image of a spider{" "}
                <img src="gifs/spider.gif" alt="[spider graphic]" /> that you want to include (now
                that you spin webs). To include this image, which, with great originality, you've
                called spider.gif, you use the HTML tag{" "}
                <b>&lt;img src="spider.gif" alt="spider graphic"&gt;</b>. The "alt=" designation
                supplies a text description so that someone using a text-based browser, or surfing
                with images turned off, or using a browser that reads the web site's content aloud
                (for the visually impaired) will know what sort of image you've used.
            </p>
            <p>
                <img src="gifs/spider.gif" alt="spider graphic" /> You may find that the image
                doesn't appear exactly where you expect it to. To some extent, you can control the
                placement of the image by adding an ALIGN attribute to the HTML tag. For example, if
                you want the spider all the way to the right, you should say{" "}
                <b>&lt;img src="spider.gif" alt="spider graphic" ALIGN=right&gt;</b>{" "}
            </p>
            <p>
                If you want the spider in with your text, like{" "}
                <img src="gifs/spider.gif" alt="spider graphic" /> this, try{" "}
                <b>&lt;img src="spider.gif" alt="spider graphic" ALIGN=absmiddle&gt;</b>. With
                absmiddle, the center of the image aligns exactly with the center of the text's
                letters. Other possibilities with ALIGN are top, texttop, middle, bottom, baseline,
                and absbottom. However, only top, middle, bottom, right, and left are recognized by
                all browsers at the moment. See the{" "}
                <a href="http://hotwired.lycos.com/webmonkey/teachingtool/image.html">
                    WebMonkey tutorial
                </a>{" "}
                for more illustrations.
            </p>
            <img src="gifs/space30.gif" />
            <center>
                <h3>Adding Links to Other Sites</h3>
            </center>
            <p>
                One more thing you'll need to know is how to add links from your web page to other
                sites. Let's say, for example, that you'd like to let people know about all the
                useful resources available on my Useful Links page. You know that the URL is
                http://research.umbc.edu/~korenman/links101b.html . How do you include a link to
                this page? The HTML tags you'll need are <b>anchor</b> tags: &lt;a href=" "&gt; and
                &lt;/a&gt; The actual coding would look something like this <br />
            </p>
            <p>
                <b>
                    One highly recommended site is Joan Korenman's &lt;a
                    href="http://research.umbc.edu/~korenman/links101b.html"&gt;Useful Links
                    page&lt;/a&gt;.{" "}
                </b>{" "}
            </p>
            <p>
                (My text editor put <b>href </b>on a different line from the <b>a</b> that precedes
                it because the entire address wouldn't fit on one line; when you type the tag, just
                leave a space between <b>a</b> and <b>href</b>: <b>&lt;a href&gt;</b>; let your text
                editor position the parts.)
            </p>
            <p>
                {" "}
                On your web site, the above HTML coding will look like this:
                <br />{" "}
                <b>
                    One highly recommended site is Joan Korenman's{" "}
                    <a href="http://research.umbc.edu/~korenman/links101b.html">
                        Useful Links page
                    </a>
                    .
                </b>
            </p>
            <p>
                You can see that "Useful Links page" is underlined and appears in a different color
                from the rest of the text. If you put your mouse arrow over it, the arrow will
                become a hand--an indication that this is a hypertext link. If you click on it,
                you'll go to my Useful Links page.
            </p>
            <p>
                One more thing: if you simply want to add a link to an HTML document that's in your
                www directory, you don't have to write out the entire address, just the file name.
                Thus, if I wanted to put a link to the Schedule of Assignments for FYS 101B, which
                I've called sched101b.html and which is located in the same directory as this file
                you're reading, I'd make a link that looks like this:
                <b>&lt;a href="sched101b.html"&gt;Schedule of Assignments&lt;/a&gt;</b>. I{" "}
                <b>could</b> write out the full address: &lt;a
                href="http://research.umbc.edu/~korenman/sched101b.html"&gt; , but it's not
                necessary. Either way, the coding will appear this way on my website:{" "}
                <b>
                    <a href="sched101b.html">Schedule of Assignments</a>.
                </b>
            </p>
            <p>
                <b>IMPORTANT!</b> Always be sure to put an identifying word or image between{" "}
                <b>&lt;a href=" "&gt; </b>and <b>&lt;/a&gt;</b>; in the above example, the
                identifying words are "Schedule of Assignments." Without some word or image, the
                reader won't be able to see the link to click on it.
            </p>
            <hr />
            <p>
                Return to <a href="links101b.html">Useful Links Page</a>
            </p>
        </>
    );
}
