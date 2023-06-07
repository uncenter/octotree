// @refresh reload
import { Suspense, createSignal } from "solid-js";
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
import { isServer } from "solid-js/web";

export default function Root() {
    const [isDark, setIsDark] = createSignal(
        isServer
            ? false
            : window.matchMedia("(prefers-color-scheme: dark)").matches
    );
    if (!isServer) {
        window
            .matchMedia("(prefers-color-scheme: dark)")
            .addEventListener("change", (e) => {
                setIsDark(e.matches);
            });
    }

    return (
        <Html lang="en">
            <Head>
                <Title>Octotree</Title>
                <Meta
                    name="description"
                    content="Octotree - turn Github repositories into ASCII trees."
                />
                <Meta name="author" content="uncenter" />
                <Meta charset="utf-8" />
                <Meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <Meta name="color-scheme" content="light dark" />
                <Meta
                    name="theme-color"
                    content={isDark() ? "#18181b" : "#ffffff"}
                />
                <Link rel="icon" type="image/png" href="logo.png" />
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
