<script lang="ts">
	import FileDropper from '$lib/components/FileDropper/FileDropper.svelte';
	import TrackList from '$lib/components/TrackList/TrackList.svelte';
	import VideoCreator from '$lib/components/VideoCreator/VideoCreator.svelte';
	import { modeCurrent } from '@skeletonlabs/skeleton';

	$: fileInputEl = {};
	$: trackUnderLineClass = $modeCurrent ? 'decoration-cyan-700' : 'decoration-yellow-300';

	let encodeStarted: boolean;
	let encodeDone: boolean;
</script>

<div id="page" class="w-full flex flex-col" style="scrollbar-gutter: auto;">
	<main id="page-content" class="flex-auto mt-[10vh] mx-4">
		<div class="container h-full mx-auto flex justify-center">
			<div class="w-full mx-12">
				<h1 class="text-5xl mb-12 mx-auto">
					{encodeStarted ? 'Crunch' : encodeDone ? 'Bop' : 'Upload'} those
					<span class="underline {trackUnderLineClass} font-bold">tracks</span>.
				</h1>

				{#if !encodeStarted && !encodeDone}
					<FileDropper bind:fileInputEl />
				{/if}

				<VideoCreator bind:encodeStarted bind:encodeDone />

				{#if !encodeStarted && !encodeDone}
					<TrackList bind:fileInputEl />
				{/if}
			</div>
		</div>
	</main>
</div>
