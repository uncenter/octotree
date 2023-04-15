import { JSX } from "solid-js";
interface PageProps {
    children: JSX.Element;
    footer?: boolean;
}

export function Page({ children, footer = true }: PageProps) {
    return (
        <div class="container mx-auto flex flex-col">
            <div class="m-6 flex flex-col items-center">
                <header class="flex flex-row justify-around w-full mb-6">
                    <div class="flex flex-row items-center gap-4">
                        <img
                            src="favicon.svg"
                            class="h-12 w-12"
                            alt="OctoTree Logo"
                        />
                        <h1 class="text-3xl font-bold text-center">OctoTree</h1>
                    </div>
                </header>
                <main class="flex flex-col items-center w-full">
                    {children}
                </main>
                {footer && (
                    <footer class="mt-6">
                        <p class="text-center">
                            Made with ❤️ by{" "}
                            <a href="https://uncenter.org">uncenter</a>
                        </p>
                        <p class="text-center">
                            MIT licensed and{" "}
                            <a href="https://github.com/uncenter/octotree">
                                open source on GitHub
                            </a>{" "}
                            🎉
                        </p>
                    </footer>
                )}
            </div>
        </div>
    );
}
