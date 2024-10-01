import { FFmpeg } from '@ffmpeg/ffmpeg';
import type { FileData } from '../../../../node_modules/@ffmpeg/ffmpeg/dist/esm/types.d.ts';

import { fetchFile } from '../../../../node_modules/@ffmpeg/util/dist/esm/index.js';

type FileUrls = { [file: string]: string };

const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

const toBlobURL = async (url: string, mimeType: string): Promise<string> => {
	const buf = await (await fetch(url)).arrayBuffer();
	const blob = new Blob([buf], { type: mimeType });
	return URL.createObjectURL(blob);
};

function getFileUrlsAndFfmpegParams(files: File[]): {
	fileUrls: FileUrls;
	audParams: string[];
	concatParams: string[];
	multiAudio: boolean;
} {
	let audCount = 0;
	let fileUrls: FileUrls = { aud0: 'fileurl' };
	let ffmpegAudParams: string[] = [];
	let ffmpegConcatParams: string[] = [];

	for (const file of files) {
		if (file.type.includes('audio')) {
			fileUrls['aud' + audCount] = URL.createObjectURL(file);

			if (audCount > 0) {
				ffmpegAudParams = [...ffmpegAudParams, '-i', 'aud' + audCount];
				ffmpegConcatParams = [...ffmpegConcatParams, `[${audCount + 1}:a]`];
			}
			audCount++;
		}
		if (file.type.includes('image')) {
			fileUrls['cover'] = URL.createObjectURL(file);
		}
	}

	return {
		fileUrls: fileUrls,
		audParams: ffmpegAudParams,
		concatParams: ffmpegConcatParams,
		multiAudio: audCount > 1
	};
}

export async function createVideo(ffmpeg: FFmpeg, files: File[]): Promise<FileData> {
	console.log('loading ffmpeg');

	await ffmpeg.load({
		coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
		wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
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
