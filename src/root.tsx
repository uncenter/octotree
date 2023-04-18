// @refresh reload
import { Suspense } from "solid-js";
import {
    Body,
    ErrorBoundary,
    FileRoutes,
    Head,
    Html,
    Link,
    Meta,
    Routes,
    Scripts,
    Title,
} from "solid-start";
import "./root.css";

export default function Root() {
    return (
        <Html lang="en">
            <Head>
                <Title>OctoTree</Title>
                <Meta
                    name="description"
                    content="OctoTree - create ASCII trees from Github repositories"
                />
                <Meta name="author" content="uncenter" />
                <Meta charset="utf-8" />
                <Meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <Meta name="color-scheme" content="light dark" />
                <Link rel="icon" type="image/svg+xml" href="favicon.svg" />
                <script
                    async
                    defer
                    data-website-id="5fdeff0b-1326-478c-b06a-e03694f60553"
                    data-domains="tree.uncenter.org"
                    src="https://stats.uncenter.org/beepboop.js"
                ></script>
            </Head>
            <Body>
                <Suspense>
                    <ErrorBoundary>
                        <Routes>
                            <FileRoutes />
                        </Routes>
                    </ErrorBoundary>
                </Suspense>
                <Scripts />
            </Body>
        </Html>
    );
}
