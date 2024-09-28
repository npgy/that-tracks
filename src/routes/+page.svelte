<script lang="ts">
	import { FileDropzone, ProgressBar, modeCurrent } from '@skeletonlabs/skeleton';
	import { FFmpeg } from '@ffmpeg/ffmpeg';
	import type { FileData, LogEvent } from '../../node_modules/@ffmpeg/ffmpeg/dist/esm/types';
	import { fetchFile, toBlobURL } from '@ffmpeg/util';

	// Local
	let files: FileList;

	let imgUrl: string;

	let vidOutput: FileData;

	let encodeProgress: number = 0;
	let encodeStarted: boolean = false;
	let encodeDone: boolean = false;

	const baseFfmpegURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

	function onChangeHandler(e: Event): void {
		console.log('file data:', e);
		console.log('files:', files);

		imgUrl = URL.createObjectURL(files[0]);
	}

	async function ffmpegStuff(): Promise<void> {
		encodeStarted = true;
		console.log('starting ffmpeg stuff');

		const ffmpeg = new FFmpeg();
		ffmpeg.on('log', ({ message: msg }: LogEvent) => {
			console.log(msg);
		});

		ffmpeg.on('progress', (pe) => {
			encodeProgress = pe.progress;
			if (pe.progress === 1) {
				encodeDone = true;
			}

			console.log(pe);
		});

		console.log('about to load');
		await ffmpeg.load({
			coreURL: await toBlobURL(`${baseFfmpegURL}/ffmpeg-core.js`, 'text/javascript'),
			wasmURL: await toBlobURL(`${baseFfmpegURL}/ffmpeg-core.wasm`, 'application/wasm'),
			workerURL: await toBlobURL(`${baseFfmpegURL}/ffmpeg-core.worker.js`, 'text/javascript')
		});
		console.log('loaded ffmpeg');

		await ffmpeg.writeFile('test.mp4', await fetchFile(imgUrl));
		console.log('writing input file');

		await ffmpeg.exec(['-i', 'test.mp4', 'test.avi']);
		console.log('encoding to avi');

		vidOutput = await ffmpeg.readFile('test.avi');
	}

	function download(): void {
		const vidUrl = URL.createObjectURL(
			new Blob([(vidOutput as Uint8Array).buffer], { type: 'video/avi' })
		);

		let a = document.createElement('a');
		document.body.appendChild(a);
		a.setAttribute('style', 'display: none');

		a.href = vidUrl;
		a.download = 'test.avi';
		a.click();
		window.URL.revokeObjectURL(vidUrl);
	}

	$: trackUnderLineClass = $modeCurrent ? 'decoration-cyan-700' : 'decoration-yellow-300';
</script>

<div class="flex-auto w-full h-full flex overflow-hidden">
	<div id="page" class="flex-1 overflow-x-hidden flex flex-col" style="scrollbar-gutter: auto;">
		<main id="page-content" class="flex-auto mt-[10vh]">
			<div class="container h-full mx-auto flex justify-center">
				<div class="w-full mx-12">
					<h1 class="text-5xl mb-12 mx-auto">
						Upload those <span class="underline {trackUnderLineClass} font-bold">tracks</span>.
					</h1>
					<FileDropzone
						class="h-[40vh]"
						name="files-example-two"
						accept="image/*"
						on:change={onChangeHandler}
						bind:files
					>
						<svelte:fragment slot="lead"
							><i class="fa-solid fa-file-arrow-up text-4xl"></i></svelte:fragment
						>
						<svelte:fragment slot="meta">MP3, WAV, JPG, PNG allowed.</svelte:fragment>
					</FileDropzone>
					<br />

					<button class="btn variant-filled-primary mb-4" on:click={ffmpegStuff}
						>Start Encode</button
					>

					{#if encodeStarted}
						<ProgressBar value={encodeProgress} max={1} />
					{/if}
					<br />

					{#if encodeDone}
						<p class="mb-2">Your video is ready!</p>
						<button class="btn variant-filled-primary" on:click={download}>Download</button>
					{/if}
					<!-- <img src={imgUrl} /> -->
				</div>
			</div>
		</main>
	</div>
</div>
