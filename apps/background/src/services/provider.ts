import 'dotenv/config';
import {Provider} from "fuels";

let provider: Provider;
export async function initializeProvider() {
    if (!provider) {
        provider = await Provider.create(process.env.PUBLIC_FUEL_RPC_URL);
    }
    return provider;
}