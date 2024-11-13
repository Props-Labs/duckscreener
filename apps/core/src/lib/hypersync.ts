import { env } from '$env/dynamic/public';
import type { Query } from "@envio-dev/hyperfuel-client";

export async function query(payload: Query) {

    const response = await fetch('https://fuel.hypersync.xyz/query', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.PUBLIC_HYPERSYNC_API_KEY}`
        },
        body: JSON.stringify({
            payload
        })
    });

    const data = await response.json();

    return data;

  }