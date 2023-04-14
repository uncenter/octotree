import { A } from "solid-start";

export default function NotFound() {
    return (
        <div class="container mx-auto flex flex-col">
            <div class="m-6 flex flex-col items-center">
                <div class="flex flex-row justify-between w-full mb-6 align-middle">
                    <div class="flex flex-row items-center">
                        <svg
                            class="h-10 rounded-full mr-2"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="21 39 18 20"
                        >
                            <path
                                fill="none"
                                stroke="#6c4127"
                                stroke-linecap="round"
                                stroke-miterlimit="10"
                                stroke-width="2"
                                d="M30 40.247V58"
                            />
                            <path
                                fill="none"
                                stroke="#426d5f"
                                stroke-linecap="round"
                                stroke-miterlimit="10"
                                stroke-width="2"
                                d="M30 40c0 2.211-1.789 4-4 4m4 0c0 3.316-2.684 6-6 6m6-2c0 4.422-3.578 8-8 8m8-16c0 2.211 1.789 4 4 4m-4 0c0 3.316 2.684 6 6 6m-6-2c0 4.422 3.578 8 8 8"
                            />
                        </svg>
                        <h1 class="text-3xl font-bold text-center">OctoTree</h1>
                    </div>
                </div>
                <div class="flex flex-col items-center w-full">
                    <p class="text-center text-gray-500 dark:text-gray-400">
                        The page you are looking for does not exist.
                    </p>
                    <A href="/" class="mt-3 text-center text-blue-500">
                        Go back to the homepage
                    </A>
                </div>
            </div>
        </div>
    );
}
