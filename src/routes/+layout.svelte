<script lang="ts">
	import '../app.postcss';
	import { AppBar, LightSwitch, autoModeWatcher, modeCurrent } from '@skeletonlabs/skeleton';

	// Font Awesome
	import '@fortawesome/fontawesome-free/css/fontawesome.css';
	import '@fortawesome/fontawesome-free/css/brands.css';
	import '@fortawesome/fontawesome-free/css/solid.css';
</script>

<svelte:head>{@html '<script>(' + autoModeWatcher.toString() + ')();</script>'}</svelte:head>

<div class="w-full h-full flex flex-col overflow-hidden">
	<header class="flex-none z-10">
		<AppBar background="">
			<svelte:fragment slot="lead">
				<strong class="text-xl">That Tracks</strong>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<a href="https://and.fm/discord" target="_blank"
					><i class="fa-brands fa-discord text-xl" style="display: flex"></i></a
				>
				<a href="https://github.com/npgy/that-tracks" target="_blank"
					><i class="fa-brands fa-github text-xl" style="display: flex"></i></a
				>
				<div></div>
				<LightSwitch ring="ring-1 ring-gray-500" class="mt-[1px]" />
			</svelte:fragment>
		</AppBar>
	</header>

	<slot />
	<footer class="mx-auto p-4">
		<div class="text-white flex justify-center relative">
			<div>
				Made with ❤️ by
				<a
					class="text-yellow-400 hover:text-yellow-500"
					href="https://github.com/npgy"
					target="_blank"
				>
					Nick P</a
				>
			</div>
		</div>
	</footer>
</div>
