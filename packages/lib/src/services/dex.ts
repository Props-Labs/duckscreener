import { Provider } from 'fuels';
import { ReadonlyMiraAmm } from 'mira-dex-ts';
import { config } from '../config';

let miraAmm: ReadonlyMiraAmm | null = null;

export function getReadonlyMiraAmm(): ReadonlyMiraAmm {
    if (!miraAmm) {
        const provider = new Provider(config.graphql.url);
        miraAmm = new ReadonlyMiraAmm(provider);
    }
    return miraAmm;
} 