<script lang="ts">
    import { createEventDispatcher } from "svelte";

	export let open = false;
	export let className = '';
	export let bindElement: HTMLDivElement | undefined;
	export let hasClose = true;

    const dispatch = createEventDispatcher();

    function closeModal() {
        dispatch("close");
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Escape") {
            closeModal();
        }
    }
</script>

<dialog class="modal" class:modal-open={open}>
	<div class="modal-box w-full relative max-w-lg {className}" role="dialog" bind:this={bindElement}>
		{#if hasClose}
			<button class="btn btn-sm btn-circle absolute right-2 top-2" on:click={closeModal}>
				X
			</button>
		{/if}
		<slot />
	</div>
	<div class="modal-backdrop" role="button" tabindex="0" on:click={closeModal} on:keydown={handleKeydown}></div>
</dialog>
