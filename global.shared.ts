declare global {
    namespace JSX {
        interface IntrinsicElements {
            "streaming-content": {
                endpoint: ValidEndpoint;
                trigger: string;
                children: React.ReactNode;
            };
        }
    }

    type ValidUrl = `http${"s" | ""}://${string}`;
    type ValidUrlPath = `/${string}`;
    type ValidEndpoint = ValidUrl | ValidUrlPath;
}
