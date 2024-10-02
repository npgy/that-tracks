<script lang="ts">
	import filesStore from '$lib/state/files.store';

	function clearFiles(): void {
		filesStore.set([]);
		(document.getElementById('file-dropper') as any).value = '';
	}
</script>

{#if $filesStore?.length > 0}
	<div class="w-full mt-8">
		<button class="btn variant-filled-primary mb-4" on:click={clearFiles}>Clear</button>
		<dl class="list-dl">
			{#each $filesStore as file}
				<div>
					<span class="badge bg-primary-500">📄</span>
					<span class="flex-auto">
						<dt>{file.name}</dt>
						<dd>
							{file.type.includes('audio')
								? 'An audio file'
								: file.type.includes('image')
									? 'An image file'
									: 'An unknown file'}
						</dd>
					</span>
				</div>
			{/each}
		</dl>
	</div>
{/if}
