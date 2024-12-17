import { FFmpeg } from '@ffmpeg/ffmpeg';
import type { FileData } from '../../../../node_modules/@ffmpeg/ffmpeg/dist/esm/types.d.ts';
import ffmpegCore from '@ffmpeg/core?url';

import { fetchFile } from '../../../../node_modules/@ffmpeg/util/dist/esm/index.js';
import type { AppFile } from '$lib/state/files.store.js';

type FileUrls = { [file: string]: string };

/// Code attributed to ffmpegwasm/ffmpeg.wasm under the MIT License ///
const toBlobURL = async (url: string, mimeType: string): Promise<string> => {
	const buf = await (await fetch(url)).arrayBuffer();
	const blob = new Blob([buf], { type: mimeType });
	return URL.createObjectURL(blob);
};
///////////////////////////////////////////////////////////////////////

function getFileUrlsAndFfmpegParams(files: AppFile[]): {
	fileUrls: FileUrls;
	audParams: string[];
	concatParams: string[];
	multiAudio: boolean;
} {
	let audCount = 0;
	let fileUrls: FileUrls = { aud0: 'fileurl' };
	let ffmpegAudParams: string[] = [];
	let ffmpegConcatParams: string[] = ['[1:a]'];

	const filesSorted = files.sort((a, b) => a.order - b.order);

	console.log(filesSorted);
	for (const file of filesSorted) {
		if (file.nativeFile.type.includes('audio')) {
			fileUrls['aud' + file.order] = file.blobUrl ?? '';

			if (audCount > 0) {
				ffmpegAudParams = [...ffmpegAudParams, '-i', 'aud' + file.order];
				ffmpegConcatParams = [...ffmpegConcatParams, `[${file.order + 1}:a]`];
			}
			audCount++;
		}
		if (file.nativeFile.type.includes('image')) {
			fileUrls['cover'] = file.blobUrl ?? '';
		}
	}

	return {
		fileUrls: fileUrls,
		audParams: ffmpegAudParams,
		concatParams: ffmpegConcatParams,
		multiAudio: audCount > 1
	};
}

export async function createVideo(ffmpeg: FFmpeg, files: AppFile[]): Promise<FileData> {
	console.log('loading ffmpeg');

	await ffmpeg.load({
		coreURL: ffmpegCore,
		wasmURL: await toBlobURL(`https://cdn.thatracks.com/ffmpeg-core.wasm`, 'application/wasm')
	});
	console.log('loaded ffmpeg');

	let { fileUrls, audParams, concatParams, multiAudio } = getFileUrlsAndFfmpegParams(files);

	console.log(fileUrls);
	for (const fileName in fileUrls) {
		await ffmpeg.writeFile(fileName, await fetchFile(fileUrls[fileName]));
	}

	console.log('writing input file(s)');
	console.log(audParams);
	console.log(concatParams);

	let multiAudioParams: string[] = [];
	if (multiAudio) {
		multiAudioParams = [
			...audParams,
			'-filter_complex',
			concatParams.join('') + 'concat=n=' + concatParams.length + ':v=0:a=1'
		];
		console.log(multiAudioParams);
	}

	console.log('encoding to mp4');
	await ffmpeg.exec([
		'-hwaccel',
		'auto',
		'-loop',
		'1',
		'-framerate',
		'1',
		'-i',
		'cover',
		'-i',
		'aud0',
		...multiAudioParams,
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
	console.log('encoding complete!');

	return ffmpeg.readFile('out.mp4');
}
