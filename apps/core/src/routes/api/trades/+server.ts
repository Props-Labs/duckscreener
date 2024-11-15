import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {getTradingData} from '$lib/services/data.server';

//@ts-ignore
export const GET: RequestHandler = async ({ url }) => {
  const pool_id = url.searchParams.get('pool_id');
  const limit: number = parseInt(url.searchParams.get('limit') || '1000');
  const offset: number = parseInt(url.searchParams.get('offset') || '0');


  try {
    const data = await getTradingData(pool_id, offset, limit);
    return json(data);
  } catch (error) {
    console.error('Error fetching trades:', error);
    return json({ error: 'Failed to fetch trade data' }, { status: 500 });
  }
};