import { Show } from "solid-js";
import { createRouteAction } from "solid-start/data";
import { Button } from "@kobalte/core";
import { TextField as Input } from "@kobalte/core";
import { Page } from "~/components/Page";

import { urlToTree } from "../tree";

export default function App() {
    const [tree, { Form }] = createRouteAction(
        async (formData: FormData) =>
            await urlToTree(formData.get("url") as string)
    );

    return (
        <Page>
            <Form class="flex flex-col items-center w-full">
                <Input.Root class="mt-3 lg:w-3/4 w-full">
                    <Input.Label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Repository Path
                    </Input.Label>
                    <Input.Input
                        type="text"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        name="url"
                        placeholder="uncenter/octotree"
                    />
                    <Input.Description class="text-sm text-gray-500 dark:text-gray-400 mt-4 break-words">
                        <p>
                            Enter the path to a Github repository using one of
                            the following syntaxes. For both, it defaults to
                            checking the main and master branches if none is
                            specified.
                        </p>
                        <ul class="list-disc ml-4">
                            <li class="mt-1">
                                <p>
                                    Shortened path syntax:
                                    <code>:owner/:repo</code>. You can
                                    optionally specify a branch by adding
                                    #branch to the end of the path (e.g.
                                    <code>:owner/:repo#:branch</code>).
                                </p>
                            </li>
                            <li class="mt-1">
                                <p>
                                    Full URL syntax (useful for copy and pasting
                                    directly from Github):
                                    <code>https://github.com/:owner/:repo</code>
                                    . You can specify a branch by adding
                                    /tree/branch-name to the end of the URL
                                    (e.g.
                                    <code>
                                        https://github.com/:owner/:repo/tree/:branch
                                    </code>
                                    , the same as if you copied the URL from
                                    Github).
                                </p>
                            </li>
                        </ul>
                    </Input.Description>
                </Input.Root>
                <Button.Root
                    type="submit"
                    class="btn outline green mt-6 justify-center"
                >
                    Get Tree
                </Button.Root>
            </Form>
            <div class="relative lg:w-3/4 w-full mt-6">
                <pre class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-[60vh] overflow-y-auto">
                    <Show when={!tree.pending} fallback={"Loading..."}>
                        {tree.result}
                    </Show>
                </pre>
                <Button.Root
                    aria-label="Copy to clipboard"
                    class="hover:scale-110 absolute right-2 top-2 transition-transform duration-200"
                    onClick={() => {
                        navigator.clipboard.writeText(tree.result || "");
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="fill-current"
                        width="1em"
                        height="1em"
                        stroke-width="0"
                        viewBox="0 0 24 24"
                    >
                        <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" />
                    </svg>
                </Button.Root>
            </div>
        </Page>
    );
}
