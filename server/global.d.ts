declare module "arcdown" {
    export class Arcdown {
        static slugify: (x: any) => string;
        static findLanguages(mdContent: string): Set<string>;
        constructor(options?: {
            markdownIt?: object;
            plugins?: object;
            renderer?: MarkdownIt;
            hljs?: {
                classString?: string;
                ignoreIllegals?: boolean;
                languages?: object;
                sublanguages?: object;
                plugins?: object[];
            };
            pluginOverrides?: {
                markdownItClass?: object | boolean;
                markdownItExternalAnchor?: object | boolean;
                markdownItAnchor?: object | boolean;
                markdownItToc?: object | boolean;
            };
        });
        render(mdContent: Buffer | string): Promise<{
            html: string;
            tocHtml: string;
            title?: string;
            slug?: string;
            frontmatter?: Record<string, unknown>;
        }>;
    }
}
