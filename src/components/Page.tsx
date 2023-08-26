import { JSX } from 'solid-js';
interface PageProps {
	children: JSX.Element;
	footer?: boolean;
}

export function Page({ children, footer = true }: PageProps) {
	return (
		<div class="mx-auto flex flex-col bg-bg text-fg min-h-screen">
			<div class="m-6 flex flex-col items-center">
				<header class="flex flex-row justify-around w-full mb-6">
					<div class="flex flex-row items-center gap-4">
						<img src="logo.webp" class="h-11 w-12" alt="Octotree logo" />
						<h1 class="text-3xl font-bold text-center">Octotree</h1>
					</div>
				</header>
				<main class="flex flex-col items-center w-full">{children}</main>
				{footer && (
					<footer class="mt-6 mb-2">
						<p class="text-center">
							MIT licensed and{' '}
							<a href="https://github.com/uncenter/octotree" class="mt-3">
								open source on GitHub.
							</a>
						</p>
					</footer>
				)}
			</div>
		</div>
	);
}
