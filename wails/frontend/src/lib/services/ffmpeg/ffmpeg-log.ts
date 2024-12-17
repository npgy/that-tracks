import type { FFmpeg } from '@ffmpeg/ffmpeg';
import type { LogEvent } from '../../../../node_modules/@ffmpeg/ffmpeg/dist/esm/types';

type ProgressCallback = (progress: number) => void;
type DoneCallback = (done: boolean) => void;

export function ffmpegLog(
	ffmpeg: FFmpeg,
	progressCallback: ProgressCallback,
	doneCallback: DoneCallback
): void {
	ffmpeg.on('log', ({ message: msg }: LogEvent) => {
		console.log(msg);
	});

	ffmpeg.on('progress', (pe) => {
		progressCallback(pe.progress);
		if (pe.progress === 1) {
			doneCallback(true);
		}

		console.log(pe);
	});
}
