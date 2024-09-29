<script lang="ts">
	import { FileDropzone, ProgressBar, modeCurrent } from '@skeletonlabs/skeleton';
	import { FFmpeg } from '@ffmpeg/ffmpeg';
	import type { FileData, LogEvent } from '../../node_modules/@ffmpeg/ffmpeg/dist/esm/types.d.ts';
	import { fetchFile, toBlobURL } from '../../node_modules/@ffmpeg/util/dist/esm/index.js';
	import ffmpegCore from '@ffmpeg/core?url';

	// Local
	let files: FileList;

	let fileUrls: { [file: string]: string } = { aud0: 'fileurl' };
	let audCount = 0;

	let vidOutput: FileData;

	let encodeProgress: number = 0;
	let encodeStarted: boolean = false;
	let encodeDone: boolean = false;

	function onChangeHandler(e: Event): void {
		console.log('file data:', e);
		console.log('files:', files);

		for (const file of files) {
			if (file.type.includes('audio')) {
				fileUrls['aud' + audCount] = URL.createObjectURL(file);
				audCount++;
			} else if (file.type.includes('image')) {
				fileUrls['cover'] = URL.createObjectURL(file);
			}
		}
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
			coreURL: ffmpegCore
		});
		console.log('loaded ffmpeg');

		for (const fileName in fileUrls) {
			await ffmpeg.writeFile(fileName, await fetchFile(fileUrls[fileName]));
		}

		console.log('writing input file');

		await ffmpeg.exec([
			'-hwaccel',
			'auto',
			'-loop',
			'1',
			'-y',
			'-framerate',
			'1',
			'-i',
			'cover',
			'-i',
			'aud0',
			'-i',
			'aud1',
			'-i',
			'aud2',
			'-i',
			'aud3',
			'-i',
			'aud4',
			'-filter_complex',
			'[1:a][2:a][3:a][4:a][5:a]concat=n=5:v=0:a=1',
			'-tune',
			'stillimage',
			'-shortest',
			'-fflags',
			'+shortest',
			'-max_interleave_delta',
			'100M',
			'-vf',
			'format=yuv420p',
			'-s',
			'1080x1080',
			'-preset',
			'ultrafast',
			'-b:a',
			'320k',
			'out.mp4'
		]);
		// await ffmpeg.exec(['-i', 'in.mp4', '-c:a', 'copy', 'out.mp4']);
		console.log('encoding to mp4');

		vidOutput = await ffmpeg.readFile('out.mp4');

		// await ffmpeg.writeFile('in.mp4', vidOutput);
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
						accept="image/*,video/*,audio/*"
						multiple
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
