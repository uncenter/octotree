import type { Component } from "solid-js";
import { createSignal } from "solid-js";
import { Button } from "@kobalte/core";
import { TextField as Input } from "@kobalte/core";

import { urlToTree } from "./tree";

import logo from "./assets/logo.svg";

const App: Component = () => {
    const [url, setUrl] = createSignal("");
    const [tree, setTree] = createSignal("");

    return (
        <div class="container mx-auto flex flex-col">
            <div class="m-6 flex flex-col items-center">
                <div class="flex flex-row justify-between w-full mb-6 align-middle">
                    <div class="flex flex-row items-center">
                        <img
                            src={logo}
                            alt="Tree Scout"
                            class="h-10 rounded-full mr-2"
                        />
                        <h1 class="text-3xl font-bold text-center">OctoTree</h1>
                    </div>
                </div>
                <div class="flex flex-col items-center w-full">
                    <Input.Root class="mt-3 lg:w-3/4 w-full">
                        <Input.Label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            Github URL
                        </Input.Label>
                        <Input.Input
                            type="text"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={url() as string}
                            onInput={(e) => {
                                setUrl(e.target.value);
                                localStorage.setItem("url", e.target.value);
                            }}
                        />
                    </Input.Root>
                    <Button.Root
                        class="btn outline green mt-6"
                        onClick={async () => {
                            setTree((await urlToTree(url())) as string);
                        }}
                    >
                        Get Tree
                    </Button.Root>
                    <Input.Root class="mt-3 lg:w-3/4 w-full">
                        <div class="relative">
                            <Input.TextArea
                                disabled
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-[60vh]"
                                value={tree() as string}
                            ></Input.TextArea>
                            <Button.Root
                                class="clipboard icon"
                                onClick={() => {
                                    navigator.clipboard.writeText(
                                        tree() as string
                                    );
                                }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    stroke="currentColor"
                                    width="1em"
                                    height="1em"
                                    stroke-width="0"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" />
                                </svg>
                            </Button.Root>
                        </div>
                    </Input.Root>
                </div>
            </div>
            <div class="lg:w-1/2"></div>
        </div>
    );
};

export default App;
