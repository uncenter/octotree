import { JSX } from "solid-js";
interface PageProps {
    children: JSX.Element;
}

export function Page({ children }: PageProps) {
    return (
        <div class="container mx-auto flex flex-col">
            <div class="m-6 flex flex-col items-center">
                <div class="flex flex-row justify-around w-full mb-6">
                    <div class="flex flex-row items-center gap-4">
                        <img
                            src="favicon.svg"
                            class="h-12 w-12"
                            alt="OctoTree Logo"
                        />
                        <h1 class="text-3xl font-bold text-center">OctoTree</h1>
                    </div>
                </div>
                {children}
            </div>
        </div>
    );
}
