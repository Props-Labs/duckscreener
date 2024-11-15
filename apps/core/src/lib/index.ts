// place files you want to import through the `$lib` alias in this folder.
export { default as WalletProvider } from './WalletProvider.svelte';

import { Fuel, BN, Account, FuelConnector } from 'fuels';
import { FuelWalletConnector } from '@fuels/connectors';

export * from 'fuels';

import { derived, writable } from 'svelte/store';

let fuel: Fuel;

type WalletState = {
	connected: boolean;
	currentAccount?: string;
	hasConnector?: boolean;
	wallet?: Account;
	walletBalance?: BN;
	fuel?: Fuel;
};

export const walletStore = writable<WalletState>({
	connected: false
});

export const loading = writable(true);

export const connected = derived(walletStore, ($walletStore) => {
	return $walletStore.connected;
});

export const account = derived(walletStore, ($walletStore) => {
	return $walletStore.currentAccount;
});

export const wallet = derived(walletStore, ($walletStore) => {
	return $walletStore.wallet;
});

export const fuelStore = derived(walletStore, ($walletStore) => {
	return $walletStore.fuel;
});

export type WalletStoreOptions = {
	connectors?: Array<FuelConnector>;
}

export const createWalletStore = (options: WalletStoreOptions) => {

	fuel = new Fuel({
		connectors: [new FuelWalletConnector(), ...(options.connectors || [])]
	});

	const handleConnection = async () => {
		const hasConnector = await fuel?.hasConnector();
		if (!hasConnector) {
			console.error('svelte-fuels: No connector found. Please provide a connector and install the wallet.');
			return;
		}
		const connected = await fuel?.isConnected();

		let currentAccount: string | null = null;
		let wallet: Account | undefined = undefined;

		if (connected) {
			try {
				currentAccount = await fuel?.currentAccount();
				wallet = await fuel?.getWallet(currentAccount as string);
			} catch (e) {
				console.error(e);
				fuel?.disconnect();
				handleConnection();
			}
		}

		walletStore.update((state) => {
			state.connected = connected || false;
			state.currentAccount = currentAccount || undefined;
			state.hasConnector = hasConnector;
			state.wallet = wallet || undefined;
			state.fuel = fuel;

			return state;
		});
		loading.set(false);
	};

	fuel?.on(fuel.events.connection, handleConnection);
    fuel?.on(fuel.events.accounts, handleConnection);
    fuel?.on(fuel.events.currentAccount, handleConnection);
    fuel?.on(fuel.events.currentNetwork, handleConnection);
    fuel?.on(fuel.events.networks, handleConnection);

	handleConnection();
};

export const connect = async (connectorName?: string) => {
	try {
		fuel?.selectConnector(connectorName || 'Fuel Wallet');
		await fuel?.connect();
	} catch (error) {
		console.error('Failed to connect:', error);
		throw error;
	}
};

export const disconnect = async (connectorName?: string) => {
    try {
		fuel?.selectConnector(connectorName || 'Fuel Wallet');
        await fuel?.disconnect();
    } catch (error) {
        console.error('Failed to disconnect:', error);
        throw error;
    }
};