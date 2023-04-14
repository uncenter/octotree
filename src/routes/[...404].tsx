import { A } from "solid-start";
import { Page } from "~/components/Page";

export default function NotFound() {
    return (
        <Page>
            <div class="flex flex-col items-center w-full">
                <p class="text-center text-gray-500 dark:text-gray-400">
                    The page you are looking for does not exist.
                </p>
                <A href="/" class="mt-3 text-center text-blue-500">
                    Go back to the homepage
                </A>
            </div>
        </Page>
    );
}
