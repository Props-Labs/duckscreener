<script lang="ts">
    import Modal from "$lib/components/modal.svelte";
    import { createEventDispatcher } from "svelte";
    import { connect, connectors, FuelConnector } from "svelte-fuels";


    const dispatch = createEventDispatcher();

    export let open = false;

    // Define connector styles and icons
    const connectorConfig = [
        {
            name: "Fuel Wallet",
            icon: "/wallets/fuel-logo.svg",
        },
        {
            name: "Bako Safe",
            icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiByeD0iOCIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzEzMjQ5XzE2MjI4MCkiLz4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzEzMjQ5XzE2MjI4MCkiPgo8cGF0aCBkPSJNMTMgMjUuOTE2N0wzNyAzNy44NjcxTDI1LjAwMjQgMTguOTg5M0wxMyAyNS45MTY3WiIgZmlsbD0iI0Y1RjVGNSIvPgo8cGF0aCBkPSJNMzMuODg2NCAyMi4yMTgyTDI0Ljk5NzYgMTcuMDg2NVY1LjEzNTc0TDEzIDEyLjA2MjhWMjUuOTE2TDI0Ljk5NzYgMTguOTg4OVYzMC45Mzk2TDEzIDM3Ljg2NjhMMjQuOTk3NiA0NC43OTM4TDM2Ljk5NTIgMzcuODY2OFYyNy42MDMzQzM2Ljk5NTIgMjUuMzgxNiAzNS44MDk4IDIzLjMyOTEgMzMuODg2NCAyMi4yMTgyWiIgZmlsbD0iIzFFMUYyMiIvPgo8L2c+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMTMyNDlfMTYyMjgwIiB4MT0iMCIgeTE9IjAiIHgyPSI1Mi4zMjg1IiB5Mj0iNDcuNDMxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNGRkMwMTAiLz4KPHN0b3Agb2Zmc2V0PSIwLjQ4IiBzdG9wLWNvbG9yPSIjRUJBMzEyIi8+CjxzdG9wIG9mZnNldD0iMC43MSIgc3RvcC1jb2xvcj0iI0QzODAxNSIvPgo8c3RvcCBvZmZzZXQ9IjAuOTkiIHN0b3AtY29sb3I9IiNCMjRGMTgiLz4KPC9saW5lYXJHcmFkaWVudD4KPGNsaXBQYXRoIGlkPSJjbGlwMF8xMzI0OV8xNjIyODAiPgo8cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iNDAiIGZpbGw9IndoaXRlIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMyA1KSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=",
        },
        {
            name: "Ethereum Wallets",
            icon: "data:image/svg+xml;utf8;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0yNTMgMzM1LjEyMkwyNTUuODg2IDMzOEwzODggMjU5Ljk4N0wyNTUuODg2IDQxTDI1MyA1MC43OTgzVjMzNS4xMjJaIiBmaWxsPSIjMzQzNDM0Ii8+CjxwYXRoIGQ9Ik0yNTYgMzM4VjQxTDEyNCAyNTkuOTg2TDI1NiAzMzhaIiBmaWxsPSIjOEM4QzhDIi8+CjxwYXRoIGQ9Ik0yNTQgNDY1LjI4MUwyNTUuNjI4IDQ3MEwzODggMjg1TDI1NS42MjkgMzYyLjU2M0wyNTQuMDAxIDM2NC41MzJMMjU0IDQ2NS4yODFaIiBmaWxsPSIjM0MzQzNCIi8+CjxwYXRoIGQ9Ik0xMjQgMjg1TDI1NiA0NzBWMzYyLjU2MkwxMjQgMjg1WiIgZmlsbD0iIzhDOEM4QyIvPgo8cGF0aCBkPSJNMjU2IDIwMFYzMzhMMzg4IDI1OS45ODhMMjU2IDIwMFoiIGZpbGw9IiMxNDE0MTQiLz4KPHBhdGggZD0iTTI1NiAyMDBMMTI0IDI1OS45ODhMMjU2IDMzOFYyMDBaIiBmaWxsPSIjMzkzOTM5Ii8+Cjwvc3ZnPgo=",
        },
        {
            name: "Solana Wallets",
            icon: "data:image/svg+xml;utf8;base64,PHN2ZyB3aWR0aD0iMTAxIiBoZWlnaHQ9Ijg4IiB2aWV3Qm94PSIwIDAgMTAxIDg4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMTAwLjQ4IDY5LjM4MTdMODMuODA2OCA4Ni44MDE1QzgzLjQ0NDQgODcuMTc5OSA4My4wMDU4IDg3LjQ4MTYgODIuNTE4NSA4Ny42ODc4QzgyLjAzMTIgODcuODk0IDgxLjUwNTUgODguMDAwMyA4MC45NzQzIDg4SDEuOTM1NjNDMS41NTg0OSA4OCAxLjE4OTU3IDg3Ljg5MjYgMC44NzQyMDIgODcuNjkxMkMwLjU1ODgyOSA4Ny40ODk3IDAuMzEwNzQgODcuMjAyOSAwLjE2MDQxNiA4Ni44NjU5QzAuMDEwMDkyMyA4Ni41MjkgLTAuMDM1OTE4MSA4Ni4xNTY2IDAuMDI4MDM4MiA4NS43OTQ1QzAuMDkxOTk0NCA4NS40MzI0IDAuMjYzMTMxIDg1LjA5NjQgMC41MjA0MjIgODQuODI3OEwxNy4yMDYxIDY3LjQwOEMxNy41Njc2IDY3LjAzMDYgMTguMDA0NyA2Ni43Mjk1IDE4LjQ5MDQgNjYuNTIzNEMxOC45NzYyIDY2LjMxNzIgMTkuNTAwMiA2Ni4yMTA0IDIwLjAzMDEgNjYuMjA5NUg5OS4wNjQ0Qzk5LjQ0MTUgNjYuMjA5NSA5OS44MTA0IDY2LjMxNjkgMTAwLjEyNiA2Ni41MTgzQzEwMC40NDEgNjYuNzE5OCAxMDAuNjg5IDY3LjAwNjcgMTAwLjg0IDY3LjM0MzZDMTAwLjk5IDY3LjY4MDYgMTAxLjAzNiA2OC4wNTI5IDEwMC45NzIgNjguNDE1QzEwMC45MDggNjguNzc3MSAxMDAuNzM3IDY5LjExMzEgMTAwLjQ4IDY5LjM4MTdaTTgzLjgwNjggMzQuMzAzMkM4My40NDQ0IDMzLjkyNDggODMuMDA1OCAzMy42MjMxIDgyLjUxODUgMzMuNDE2OUM4Mi4wMzEyIDMzLjIxMDggODEuNTA1NSAzMy4xMDQ1IDgwLjk3NDMgMzMuMTA0OEgxLjkzNTYzQzEuNTU4NDkgMzMuMTA0OCAxLjE4OTU3IDMzLjIxMjEgMC44NzQyMDIgMzMuNDEzNkMwLjU1ODgyOSAzMy42MTUxIDAuMzEwNzQgMzMuOTAxOSAwLjE2MDQxNiAzNC4yMzg4QzAuMDEwMDkyMyAzNC41NzU4IC0wLjAzNTkxODEgMzQuOTQ4MiAwLjAyODAzODIgMzUuMzEwM0MwLjA5MTk5NDQgMzUuNjcyMyAwLjI2MzEzMSAzNi4wMDgzIDAuNTIwNDIyIDM2LjI3N0wxNy4yMDYxIDUzLjY5NjhDMTcuNTY3NiA1NC4wNzQyIDE4LjAwNDcgNTQuMzc1MiAxOC40OTA0IDU0LjU4MTRDMTguOTc2MiA1NC43ODc1IDE5LjUwMDIgNTQuODk0NCAyMC4wMzAxIDU0Ljg5NTJIOTkuMDY0NEM5OS40NDE1IDU0Ljg5NTIgOTkuODEwNCA1NC43ODc5IDEwMC4xMjYgNTQuNTg2NEMxMDAuNDQxIDU0LjM4NDkgMTAwLjY4OSA1NC4wOTgxIDEwMC44NCA1My43NjEyQzEwMC45OSA1My40MjQyIDEwMS4wMzYgNTMuMDUxOCAxMDAuOTcyIDUyLjY4OTdDMTAwLjkwOCA1Mi4zMjc3IDEwMC43MzcgNTEuOTkxNyAxMDAuNDggNTEuNzIzTDgzLjgwNjggMzQuMzAzMlpNMS45MzU2MyAyMS43OTA1SDgwLjk3NDNDODEuNTA1NSAyMS43OTA3IDgyLjAzMTIgMjEuNjg0NSA4Mi41MTg1IDIxLjQ3ODNDODMuMDA1OCAyMS4yNzIxIDgzLjQ0NDQgMjAuOTcwNCA4My44MDY4IDIwLjU5MkwxMDAuNDggMy4xNzIxOUMxMDAuNzM3IDIuOTAzNTcgMTAwLjkwOCAyLjU2NzU4IDEwMC45NzIgMi4yMDU1QzEwMS4wMzYgMS44NDM0MiAxMDAuOTkgMS40NzEwMyAxMDAuODQgMS4xMzQwOEMxMDAuNjg5IDAuNzk3MTMgMTAwLjQ0MSAwLjUxMDI5NiAxMDAuMTI2IDAuMzA4ODIzQzk5LjgxMDQgMC4xMDczNDkgOTkuNDQxNSAxLjI0MDc0ZS0wNSA5OS4wNjQ0IDBMMjAuMDMwMSAwQzE5LjUwMDIgMC4wMDA4NzgzOTcgMTguOTc2MiAwLjEwNzY5OSAxOC40OTA0IDAuMzEzODQ4QzE4LjAwNDcgMC41MTk5OTggMTcuNTY3NiAwLjgyMTA4NyAxNy4yMDYxIDEuMTk4NDhMMC41MjQ3MjMgMTguNjE4M0MwLjI2NzY4MSAxOC44ODY2IDAuMDk2NjE5OCAxOS4yMjIzIDAuMDMyNTE4NSAxOS41ODM5Qy0wLjAzMTU4MjkgMTkuOTQ1NiAwLjAxNDA2MjQgMjAuMzE3NyAwLjE2Mzg1NiAyMC42NTQ1QzAuMzEzNjUgMjAuOTkxMyAwLjU2MTA4MSAyMS4yNzgxIDAuODc1ODA0IDIxLjQ3OTlDMS4xOTA1MyAyMS42ODE3IDEuNTU4ODYgMjEuNzg5NiAxLjkzNTYzIDIxLjc5MDVaIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMTc0XzQ0MDMpIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMTc0XzQ0MDMiIHgxPSI4LjUyNTU4IiB5MT0iOTAuMDk3MyIgeDI9Ijg4Ljk5MzMiIHkyPSItMy4wMTYyMiIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBvZmZzZXQ9IjAuMDgiIHN0b3AtY29sb3I9IiM5OTQ1RkYiLz4KPHN0b3Agb2Zmc2V0PSIwLjMiIHN0b3AtY29sb3I9IiM4NzUyRjMiLz4KPHN0b3Agb2Zmc2V0PSIwLjUiIHN0b3AtY29sb3I9IiM1NDk3RDUiLz4KPHN0b3Agb2Zmc2V0PSIwLjYiIHN0b3AtY29sb3I9IiM0M0I0Q0EiLz4KPHN0b3Agb2Zmc2V0PSIwLjcyIiBzdG9wLWNvbG9yPSIjMjhFMEI5Ii8+CjxzdG9wIG9mZnNldD0iMC45NyIgc3RvcC1jb2xvcj0iIzE5RkI5QiIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+Cjwvc3ZnPgo=",
        },
        {
            name: "Burner Wallet",
            icon: "data:image/svg+xml;utf8;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0Ny41IDQ3LjUiPjxkZWZzPjxjbGlwUGF0aCBpZD0iYSI+PHBhdGggZD0iTTAgMzhoMzhWMEgwdjM4WiIvPjwvY2xpcFBhdGg+PGNsaXBQYXRoIGlkPSJiIj48cGF0aCBkPSJNMTguNTgzIDI3LjgzM2MtMi45NTctLjIzMS01LjY2NiAyLjU0Mi00LjY2NiA3LjA0Mi0zLjIzOS0yLjM4Ni0zLjMzMi02LjQwMy0yLjMzMy05IDEuMDQxLTIuNzA4LS4wNDItNC45NTgtMi41ODQtNS4yMDgtMi44MzktLjI4LTQuNDE2IDMuMDQyLTIuOTYyIDguMzMzQTE2LjkzNiAxNi45MzYgMCAwIDEgMiAxOEMyIDguNjExIDkuNjExIDEgMTkgMXMxNyA3LjYxMSAxNyAxN2MwIDIuMDYzLS4zNjcgNC4wMzktMS4wNCA1Ljg2OC0uNDYtNS4zODgtMy4zMzMtOC4xNTctNi4zMzUtNi44NjgtMi44MTIgMS4yMDgtLjkxNyA1LjkxNy0uNzc3IDguMTY0LjIzNiAzLjgwOS0uMDEyIDguMTY5LTYuOTMxIDExLjc5NCAyLjg3NS01LjQ5OS4zMzMtOC45MTctMi4zMzQtOS4xMjUiLz48L2NsaXBQYXRoPjwvZGVmcz48ZyBjbGlwLXBhdGg9InVybCgjYSkiIHRyYW5zZm9ybT0ibWF0cml4KDEuMjUgMCAwIC0xLjI1IDAgNDcuNSkiPjxwYXRoIGZpbGw9IiNmNDkwMGMiIGQ9Ik0zNiAxOGMwIDIuMDYzLS4zNjcgNC4wMzktMS4wNCA1Ljg2OC0uNDYtNS4zODktMy4zMzMtOC4xNTctNi4zMzUtNi44NjgtMi44MTMgMS4yMDgtLjkxNyA1LjkxNy0uNzc3IDguMTY0LjIzNiAzLjgwOS0uMDEyIDguMTY5LTYuOTMxIDExLjc5NCAyLjg3NS01LjUuMzMzLTguOTE2LTIuMzM0LTkuMTI1LTIuOTU4LS4yMy01LjY2NiAyLjU0Mi00LjY2NiA3LjA0Mi0zLjIzOC0yLjM4Ni0zLjMzMy02LjQwMi0yLjMzNC05IDEuMDQyLTIuNzA4LS4wNDEtNC45NTgtMi41ODMtNS4yMDgtMi44MzktLjI4LTQuNDE3IDMuMDQxLTIuOTYyIDguMzMzQTE2LjkzNiAxNi45MzYgMCAwIDEgMiAxOEMyIDguNjExIDkuNjExIDEgMTkgMXMxNyA3LjYxMSAxNyAxNyIvPjwvZz48ZyBjbGlwLXBhdGg9InVybCgjYikiIHRyYW5zZm9ybT0ibWF0cml4KDEuMjUgMCAwIC0xLjI1IDAgNDcuNSkiPjxwYXRoIGZpbGw9IiNmZmNjNGQiIGQ9Ik0zMSA3YzAgMi4xODctLjU4NCA0LjIzNi0xLjYwNSA2LjAwMS4xNDctMy4wODQtMi41NjItNC4yOTMtNC4wMi0zLjcwOS0yLjEwNS44NDMtMS41NDEgMi4yOTEtMi4wODMgNS4yOTEtLjU0MiAzLTIuNjI1IDUuMDg0LTUuNzA5IDYgMi4yNS02LjMzMy0xLjI0Ny04LjY2Ny0zLjA4LTkuMDg0LTEuODcyLS40MjYtMy43NTMuMDAxLTMuOTY4IDQuMDA3QTExLjk2NyAxMS45NjcgMCAwIDEgNyA3QzcgLjM3MyAxMi4zNzMtNSAxOS01UzMxIC4zNzMgMzEgNyIvPjwvZz48L3N2Zz4="
        }
        // Add more connectors as needed
    ];

    let loading = false;

    function handleConnect(connector: FuelConnector) {
        loading = true;
        connect(connector.name);
        dispatch('close');
        loading = false;
    }

    // Add this function before the #each block
    $: uniqueConnectors = $connectors.filter((connector, index, self) =>
        index === self.findIndex((t) => t.name === connector.name)
    );

</script>

<Modal {open} on:close={() => dispatch('close')} className="max-w-md">
    <div>
        <h2>Select Wallet</h2>
        <div class="flex flex-col gap-2 mt-8">
        {#if $connectors.length === 0}
            <div>
                <a href="https://chromewebstore.google.com/detail/fuel-wallet/dldjpboieedgcmpkchcjcbijingjcgok" target="_blank" rel="noopener noreferrer" class="btn btn-outline w-full">
                    Install Fuel Wallet
                </a>
            </div>
        {:else}
            {#each uniqueConnectors as connector}
                {@const config = connectorConfig.find(c => c.name === connector.name)}
                {#if config}
                    <div>
                        <button 
                            disabled={loading} 
                            on:click={() => handleConnect(connector)} 
                            class="font-semibold btn btn-secondary  transition-colors duration-300 w-full justify-start"
                        >
                            {#if loading}
                                <span class="animate-spin">
                                    Loading...
                                </span>
                            {:else}
                                <img src={config.icon} alt="{config.name} Logo" class="w-6 h-6 mr-2">
                                Connect with {config.name}
                            {/if}
                        </button>
                    </div>
                {/if}
            {/each}
        {/if}

        </div>
    </div>
</Modal>