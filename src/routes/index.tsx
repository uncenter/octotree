import { Show } from "solid-js";
import { createRouteAction } from "solid-start/data";
import { Button, Switch, TextField as Input } from "@kobalte/core";
import { Page } from "~/components/Page";

import { urlToTree } from "../tree";
import { isServer } from "solid-js/web";

const version = "1.0.1";

export default function App() {
    if (!isServer) {
        if (localStorage.getItem("version") !== version) {
            localStorage.clear();
        }
        localStorage.setItem("version", version);
    }
    const [tree, { Form }] = createRouteAction(
        async (formData: FormData) =>
            await urlToTree(formData.get("url") as string, {
                roundLast: formData.get("roundLast") === "on" ? true : false,
                rootDir: formData.get("rootDir") === "on" ? true : false,
                trailingSlash:
                    formData.get("trailingSlash") === "on" ? true : false,
                cache: formData.get("cache") === "on" ? true : false,
            })
    );

    return (
        <Page>
            <Form class="flex flex-col items-center w-full flex-0">
                <Input.Root class="mt-3 lg:w-3/4 w-full">
                    <Input.Label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Repository Path
                    </Input.Label>
                    <Input.Input
                        type="text"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        name="url"
                        placeholder="https://github.com/owner/repo or owner/repo"
                    />
                    <Input.Description class="text-sm text-gray-500 dark:text-gray-400 mt-4 break-words">
                        <details>
                            <summary class="text-blue-500 cursor-pointer mb-2 font-extrabold select-none text-center">
                                More Info
                            </summary>
                            <p class="text-center">
                                Octotree will try fetching the main and master
                                branches if none is specified for both syntaxes.
                            </p>
                            <ul class="list-disc ml-4">
                                <li class="mt-1">
                                    <p>
                                        Short syntax:
                                        <code>:owner/:repo</code>. Optionally
                                        specify a branch by appending{" "}
                                        <code>#:branch</code> (e.g.
                                        <code>:owner/:repo#:branch</code>).
                                    </p>
                                </li>
                                <li class="mt-1">
                                    <p>
                                        URL syntax:
                                        <code>
                                            https://github.com/:owner/:repo
                                        </code>
                                        . You can specify a branch by appending
                                        <code>/tree/:branch</code> (e.g.
                                        <code>
                                            https://github.com/:owner/:repo/tree/:branch
                                        </code>
                                        ).
                                    </p>
                                </li>
                            </ul>
                        </details>
                    </Input.Description>
                </Input.Root>
                <div class="flex flex-row items-center gap-4 mt-6 justify-center flex-wrap">
                    <Switch.Root class="swt">
                        <Switch.Label class="label">
                            Rounded Corners
                        </Switch.Label>
                        <Switch.Input
                            type="checkbox"
                            name="roundLast"
                            class="input"
                        />
                        <Switch.Control class="control">
                            <Switch.Thumb class="thumb"></Switch.Thumb>
                        </Switch.Control>
                    </Switch.Root>
                    <Switch.Root class="swt">
                        <Switch.Label class="label">
                            Root Directory
                        </Switch.Label>
                        <Switch.Input
                            type="checkbox"
                            name="rootDir"
                            class="input"
                        />
                        <Switch.Control class="control">
                            <Switch.Thumb class="thumb"></Switch.Thumb>
                        </Switch.Control>
                    </Switch.Root>
                    <Switch.Root defaultIsChecked class="swt">
                        <Switch.Label class="label">
                            Trailing Slash
                        </Switch.Label>
                        <Switch.Input
                            type="checkbox"
                            name="trailingSlash"
                            class="input"
                        />
                        <Switch.Control class="control">
                            <Switch.Thumb class="thumb"></Switch.Thumb>
                        </Switch.Control>
                    </Switch.Root>
                    <Switch.Root defaultIsChecked class="swt">
                        <Switch.Label class="label">Cache</Switch.Label>
                        <Switch.Input
                            type="checkbox"
                            name="cache"
                            class="input"
                        />
                        <Switch.Control class="control">
                            <Switch.Thumb class="thumb"></Switch.Thumb>
                        </Switch.Control>
                    </Switch.Root>
                </div>
                <Button.Root
                    type="submit"
                    class="btn outline green mt-6 justify-center"
                >
                    Get Tree
                </Button.Root>
            </Form>
            <div class="relative lg:w-3/4 w-full mt-4">
                <pre class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 flex-auto min-h-[16em]">
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
