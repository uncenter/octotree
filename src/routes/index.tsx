import { For, Show, createSignal } from "solid-js";
import { createRouteAction } from "solid-start/data";
import {
    Button,
    Switch,
    TextField as Input,
    AlertDialog,
    RadioGroup,
} from "@kobalte/core";
import { Page } from "~/components/Page";
import { OcX2 } from "solid-icons/oc";

import { fetchTree, buildTree, flattenPaths } from "../tree";
import { isServer } from "solid-js/web";
import { createStore } from "solid-js/store";

function downloadJson(data: string, filename: string) {
    const blob = new Blob([data], {
        type: "application/json",
    });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(href);
}

const version = "1.1.0";
const options = [
    {
        name: "useRootDir",
        label: "Root Directory",
        description: "Nest files in a root directory.",
        initial: false,
    },
    {
        name: "addTrailingSlash",
        label: "Trailing Slash",
        description: "Add a trailing slash to directories.",
        initial: true,
    },
    {
        name: "useFancyCorners",
        label: "Fancy Corners",
        description: "Use rounded corner characters whenever possible.",
        initial: true,
    },
    {
        name: "addIndentChar",
        label: "Indent Character",
        description: "Add a visible line for each level of indentation.",
        initial: false,
    },
];

const storage = {
    get(name: string) {
        if (!isServer) {
            const value = localStorage.getItem(`octotree:${name}`);
            return value;
        } else {
            return undefined;
        }
    },
    set(name: string, value: any) {
        if (!isServer) {
            localStorage.setItem(
                `octotree:${name}`,
                typeof value !== "string" ? value.toString() : value
            );
        }
    },
};

export default function App() {
    if (!isServer) {
        if (storage.get("version") !== version) {
            localStorage.clear();
            storage.set("version", version);
        }
    }
    const [state, setState] = createStore(
        options.reduce((acc, { name, initial }) => {
            if (!isServer) {
                const value = storage.get(name) === "true";
                if (value) {
                    acc[name] = value;
                    return acc;
                } else {
                    storage.set(name, initial);
                    acc[name] = initial;
                    return acc;
                }
            } else {
                acc[name] = false;
                return acc;
            }
        }, {} as Record<string, boolean>)
    );
    const [tree, { Form }] = createRouteAction(
        async (formData: FormData) =>
            await fetchTree(formData.get("url") as string)
    );
    const [exportOption, setExportOption] = createSignal("Array of paths");

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
                            <summary class="text-blue-500 cursor-pointer font-extrabold select-none text-center -ml-[0.4rem] mb-2">
                                Syntax Help
                            </summary>
                            <p class="text-center">
                                Octotree will try fetching the main and master
                                branches if none is specified for both syntaxes.
                            </p>
                            <ul class="list-disc block ms-0 me-0 mbs-4 mbe-4 ps-10">
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
                <Button.Root
                    type="submit"
                    class="btn outline green mt-6 justify-center"
                >
                    Get Tree
                </Button.Root>
            </Form>
            <div class="flex flex-row items-center gap-4 mt-6 justify-center flex-wrap">
                <For each={options}>
                    {({ name, label, description, initial }) => (
                        <Switch.Root
                            class="swt"
                            checked={state[name]}
                            onChange={(checked: boolean) => {
                                setState(name, checked);
                                storage.set(name, checked);
                            }}
                        >
                            <Switch.Label class="label">{label}</Switch.Label>
                            <Switch.Input
                                type="checkbox"
                                name={name}
                                class="input"
                            />
                            <Switch.Control class="control">
                                <Switch.Thumb class="thumb"></Switch.Thumb>
                            </Switch.Control>
                        </Switch.Root>
                    )}
                </For>
            </div>
            <div class="relative lg:w-3/4 w-full mt-4">
                <pre class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-[16em] overflow-scroll">
                    <Show when={!tree.pending} fallback={"Loading..."}>
                        <Show when={tree.error}>
                            <p class="text-red-400">{tree.error.message}</p>
                        </Show>
                        <Show when={tree.result && !tree.error}>
                            {buildTree(tree.result, state)}
                        </Show>
                    </Show>
                </pre>
                <Button.Root
                    aria-label="Copy to clipboard"
                    class="hover:scale-110 absolute right-4 top-4 transition-transform duration-200"
                    onClick={(e) => {
                        const button = e.currentTarget;
                        if (document.querySelector("pre")?.textContent !== "") {
                            navigator.clipboard.writeText(
                                tree.result as string
                            );
                        }
                        button.innerHTML = `<svg
                        xmlns="http://www.w3.org/2000/svg"
                        stroke="#2bbd50"
                        fill="none"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                    >
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>`;
                        setTimeout(() => {
                            button.innerHTML = `<svg
                            xmlns="http://www.w3.org/2000/svg"
                            stroke="#a1a1aa"
                            fill="none"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            width="1em"
                            height="1em"
                            viewBox="0 0 24 24"
                        >
                            <rect
                                x="9"
                                y="9"
                                width="13"
                                height="13"
                                rx="2"
                                ry="2"
                            ></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>`;
                        }, 2000);
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        stroke="#a1a1aa"
                        fill="none"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                    >
                        <rect
                            x="9"
                            y="9"
                            width="13"
                            height="13"
                            rx="2"
                            ry="2"
                        ></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </Button.Root>
            </div>
            <AlertDialog.Root>
                <AlertDialog.Trigger
                    class="btn outline purple mt-6 justify-center"
                    disabled={tree.pending || tree.error || !tree.result}
                >
                    Export as JSON
                </AlertDialog.Trigger>
                <AlertDialog.Portal>
                    <AlertDialog.Overlay class="alert-overlay" />
                    <div class="alert-positioner">
                        <AlertDialog.Content class="rounded-md bg-bg p-6">
                            <div class="flex items-baseline justify-between mb-3">
                                <AlertDialog.Title class="text-xl font-medium text-fg">
                                    Export as JSON
                                </AlertDialog.Title>
                                <AlertDialog.CloseButton class="h-6 w-6 text-fg">
                                    <OcX2 />
                                </AlertDialog.CloseButton>
                            </div>
                            <AlertDialog.Description class="text-fg text-sm">
                                <RadioGroup.Root
                                    class="flex flex-col gap-2"
                                    value={exportOption()}
                                    onChange={setExportOption}
                                >
                                    <RadioGroup.Label class="text-sm font-medium text-gray-900 dark:text-gray-300">
                                        Export as...
                                    </RadioGroup.Label>
                                    <div class="flex gap-4">
                                        <For
                                            each={[
                                                "Array of paths",
                                                "Nested tree object",
                                            ]}
                                        >
                                            {(option) => (
                                                <RadioGroup.Item
                                                    value={option}
                                                    class="flex items-center"
                                                >
                                                    <RadioGroup.ItemInput class="radio__input" />
                                                    <RadioGroup.ItemControl class="flex items-center justify-center h-5 w-5 border border-zinc-300 bg-zinc-200 rounded-[10px] border-solid data-[checked]:bg-[hsl(200_98%_39%)] data-[checked]:border-[hsl(200_98%_39%)]">
                                                        <RadioGroup.ItemIndicator class="h-2.5 w-2.5 bg-[white] rounded-[5px]" />
                                                    </RadioGroup.ItemControl>
                                                    <RadioGroup.ItemLabel class="text-zinc-900 text-sm select-none ml-1.5">
                                                        {option}
                                                    </RadioGroup.ItemLabel>
                                                </RadioGroup.Item>
                                            )}
                                        </For>
                                    </div>
                                </RadioGroup.Root>
                                <div class="flex flex-row justify-center">
                                    <Button.Root
                                        class="btn outline purple mt-6 justify-center"
                                        onClick={() => {
                                            if (!tree.result || !exportOption())
                                                return;
                                            if (
                                                exportOption() ===
                                                "Array of paths"
                                            ) {
                                                downloadJson(
                                                    JSON.stringify(
                                                        flattenPaths(
                                                            tree.result
                                                        ),
                                                        null,
                                                        4
                                                    ),
                                                    "tree.json"
                                                );
                                            } else {
                                                downloadJson(
                                                    JSON.stringify(
                                                        tree.result,
                                                        null,
                                                        4
                                                    ),
                                                    "tree.json"
                                                );
                                            }
                                        }}
                                    >
                                        Download
                                    </Button.Root>
                                    <Button.Root
                                        class="btn outline purple mt-6 justify-center"
                                        onClick={() => {
                                            if (!tree.result || !exportOption())
                                                return;
                                            if (
                                                exportOption() ===
                                                "Array of paths"
                                            ) {
                                                navigator.clipboard.writeText(
                                                    JSON.stringify(
                                                        flattenPaths(
                                                            tree.result
                                                        ),
                                                        null,
                                                        4
                                                    )
                                                );
                                            } else {
                                                navigator.clipboard.writeText(
                                                    JSON.stringify(
                                                        tree.result,
                                                        null,
                                                        4
                                                    )
                                                );
                                            }
                                        }}
                                    >
                                        Copy
                                    </Button.Root>
                                </div>
                            </AlertDialog.Description>
                        </AlertDialog.Content>
                    </div>
                </AlertDialog.Portal>
            </AlertDialog.Root>
        </Page>
    );
}
