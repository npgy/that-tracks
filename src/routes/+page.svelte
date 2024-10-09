<script lang="ts">
	import { hasRequiredFiles } from '$lib/components/FileDropper/FileDropper.js';
	import FileDropper from '$lib/components/FileDropper/FileDropper.svelte';
	import TrackList from '$lib/components/TrackList/TrackList.svelte';
	import { ffmpegLog } from '$lib/services/ffmpeg/ffmpeg-log.js';
	import { createVideo } from '$lib/services/ffmpeg/ffmpeg.js';
	import filesStore from '$lib/state/files.store.js';
	import { FFmpeg } from '@ffmpeg/ffmpeg';
	import { ProgressBar, modeCurrent } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import type { FileData } from '../../node_modules/@ffmpeg/ffmpeg/dist/esm/types.d.ts';

	let ffmpeg: FFmpeg;

	let vidOutput: FileData;
	$: fileInputEl = {};

	let encodeProgress: number = 0;
	let encodeDone: boolean = false;

	onMount(() => {
		ffmpeg = new FFmpeg();
		ffmpegLog(ffmpeg, ffmpegProgress, ffmpegDone);
	});

	function ffmpegProgress(progress: number) {
		encodeProgress = progress;
	}
	function ffmpegDone(done: boolean) {
		encodeDone = done;
	}

	function download(): void {
		const vidUrl = URL.createObjectURL(
			new Blob([(vidOutput as Uint8Array).buffer], { type: 'video/mp4' })
		);

		let a = document.createElement('a');
		document.body.appendChild(a);
		a.setAttribute('style', 'display: none');

		a.href = vidUrl;
		a.download = 'out.mp4';
		a.click();
		window.URL.revokeObjectURL(vidUrl);
	}

	async function ffmpegCreateVideo(): Promise<void> {
		vidOutput = await createVideo(ffmpeg, $filesStore);
	}

	$: trackUnderLineClass = $modeCurrent ? 'decoration-cyan-700' : 'decoration-yellow-300';
</script>

<div id="page" class="w-full flex flex-col" style="scrollbar-gutter: auto;">
	<main id="page-content" class="flex-auto mt-[10vh] mx-4">
		<div class="container h-full mx-auto flex justify-center">
			<div class="w-full mx-12">
				<h1 class="text-5xl mb-12 mx-auto">
					Upload those <span class="underline {trackUnderLineClass} font-bold">tracks</span>.
				</h1>

				<FileDropper bind:fileInputEl />

				<br />

				<ProgressBar value={encodeProgress} max={1} />

				<TrackList bind:fileInputEl />

				<div class="flex flex-col items-center justify-center mt-12">
					<button
						disabled={!hasRequiredFiles($filesStore)}
						class="btn variant-filled-primary mb-4 w-60 min-w-20 font-bold disabled"
						on:click={ffmpegCreateVideo}>Create Video</button
					>

					<br />

					{#if encodeDone}
						<p class="mb-2">Your video is ready!</p>
						<button class="btn variant-filled-primary font-bold" on:click={download}
							>Download</button
						>
					{/if}
				</div>
			</div>
		</div>
	</main>
</div>
