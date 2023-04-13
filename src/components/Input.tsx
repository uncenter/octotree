import { TextField as KInput } from "@kobalte/core";

function combineClasses(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
}

interface Props {
    label?: string;
    placeholder?: string;
    type: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    description?: string;
    class?: string;
    autoresize?: boolean;
    textarea?: boolean;
    id?: string;
    onInput?: (e: any) => void;
}

const Input = (props: Props) => {
    return (
        <>
            <KInput.Root class="mt-3 lg:w-3/4 w-full">
                {props.label && (
                    <KInput.Label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        {props.label}
                    </KInput.Label>
                )}
                {props.textarea ? (
                    <KInput.TextArea
                        placeholder={props.placeholder}
                        required={props.required}
                        disabled={props.disabled}
                        class={combineClasses(
                            "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",
                            props.class || ""
                        )}
                        autoResize={props.autoresize}
                    />
                ) : (
                    <KInput.Input
                        type={props.type}
                        id={props.id}
                        placeholder={props.placeholder}
                        required={props.required}
                        disabled={props.disabled}
                        class={combineClasses(
                            "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",
                            props.class || ""
                        )}
                        onInput={props.onInput}
                    />
                )}
                {props.description && (
                    <KInput.Description class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {props.description}
                    </KInput.Description>
                )}
                {props.error && (
                    <KInput.ErrorMessage>{props.error}</KInput.ErrorMessage>
                )}
            </KInput.Root>
        </>
    );
};

export default Input;
