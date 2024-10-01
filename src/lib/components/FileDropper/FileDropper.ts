export function hasRequiredFiles(files: File[]): boolean {
	return true;
}

export function clearFiles(): void {
	(document.getElementById('file-dropper') as any).value = '';
}
