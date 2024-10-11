<script lang="ts">
	import { ProgressRadial } from '@skeletonlabs/skeleton';
	import { hasRequiredFiles } from '../FileDropper';
	import filesStore, { imageStore, type AppFile } from '$lib/state/files.store';
	import { createVideo } from '$lib/services/ffmpeg';
	import type { FileData } from '../../../../node_modules/@ffmpeg/ffmpeg/dist/esm/types.d.ts';
	import { onMount } from 'svelte';
	import { FFmpeg } from '@ffmpeg/ffmpeg';
	import { ffmpegLog } from '$lib/services/ffmpeg/ffmpeg-log';

	let vidOutput: FileData;
	let ffmpeg: FFmpeg;

	let encodeProgress: number = 0;
	export let encodeDone: boolean = false;
	export let encodeStarted: boolean = false;

	onMount(() => {
		ffmpeg = new FFmpeg();
		ffmpegLog(ffmpeg, ffmpegProgress, ffmpegDone);
	});

	function ffmpegProgress(progress: number) {
		encodeProgress = progress;
	}
	function ffmpegDone(done: boolean) {
		encodeDone = done;
		getTracklist();
	}

	async function ffmpegCreateVideo(): Promise<void> {
		encodeStarted = true;
		try {
			vidOutput = await createVideo(ffmpeg, [...$filesStore, $imageStore]);
		} catch {}
		encodeStarted = false;
	}

	async function ffmpegCancel(): Promise<void> {
		encodeDone = false;
		encodeProgress = 0;
		ffmpeg.terminate();
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

	function resetState(): void {
		encodeDone = false;
		encodeStarted = false;
		encodeProgress = 0;
		filesStore.set([]);
		imageStore.set({} as AppFile);
	}

	function fancyTimeFormat(duration: number): string {
		const hrs: number = Math.floor(duration / 3600);
		const mins: number = Math.floor((duration % 3600) / 60);
		const secs: number = Math.floor(duration % 60);

		let ret: string = '';

		ret =
			`${hrs}`.padStart(hrs < 10 ? 2 : 0, '0') +
			':' +
			`${mins}`.padStart(mins < 10 ? 2 : 0, '0') +
			':' +
			`${secs}`.padStart(secs < 10 ? 2 : 0, '0');

		return ret;
	}

	function getTracklist(): void {
		let currentTs: number = 0;
		let tracklistEl = document.getElementById('tracklist-text') as HTMLTextAreaElement;
		let audEl: HTMLAudioElement;
		tracklistEl.value = 'Track List:\n';

		const sortedFiles = $filesStore.sort((a, b) => a.order - b.order);

		for (const file of sortedFiles) {
			tracklistEl.value += `${file.order + 1}. ${file.nativeFile.name.split('.')[0]} — ${fancyTimeFormat(currentTs)}\n`;
			audEl = document.getElementById(`ghost-aud-${file.uuid}`) as HTMLAudioElement;
			currentTs += audEl.duration;
		}
	}
</script>

<div class="flex flex-col items-center justify-center mt-12">
	{#if !encodeDone}
		<button
			disabled={!hasRequiredFiles([...$filesStore, $imageStore]) || encodeStarted}
			class="btn variant-filled-primary mb-4 w-60 min-w-20 font-bold disabled"
			on:click={ffmpegCreateVideo}>Create Video</button
		>
	{/if}
	<br />
	{#if encodeStarted}
		<ProgressRadial
			value={encodeProgress < 1 ? encodeProgress * 100 : undefined}
			stroke={50}
			strokeLinecap="round"
			class="w-[200px]"
		/>
		<img alt="loading cat" src="/catbopping.gif" class="relative bottom-[135px] left-1 w-16" />
	{/if}
	{#if encodeDone}
		<h2 class="mb-4 text-2xl">Your video is ready!</h2>
		<button class="btn variant-filled-primary font-bold" on:click={download}>Download</button>
		<br />
	{/if}

	<h3 hidden={!encodeDone} class="my-6 text-xl">Oh, also here's the tracklist</h3>
	<textarea
		hidden={!encodeDone}
		id="tracklist-text"
		class="textarea"
		rows="8"
		placeholder="Tracklist will be here"
	/>

	{#if encodeDone}
		<button class="btn variant-filled-tertiary mt-12" on:click={resetState}>Create Another</button>
	{/if}

	{#if encodeStarted}
		<button
			disabled={!hasRequiredFiles([...$filesStore, $imageStore])}
			class="btn variant-filled-error mb-4 w-60 min-w-20 font-bold disabled"
			on:click={ffmpegCancel}>Cancel</button
		>
	{/if}

	<!-- Easy hacky way to get runtime and tracklist -->
	{#each $filesStore as file, _}
		<audio hidden id="ghost-aud-{file.uuid}" src={file.blobUrl}></audio>
	{/each}
</div>
