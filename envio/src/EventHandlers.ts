/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import {
  MiraV1Core,
  MiraV1Core_ReentrancyError,
  MiraV1Core_SwapEvent,
  MiraV1Core_AmmError,
  MiraV1Core_TotalSupplyEvent,
  MiraV1Core_SetSymbolEvent,
  MiraV1Core_CreatePoolEvent,
  MiraV1Core_SetNameEvent,
  MiraV1Core_MintEvent,
  MiraV1Core_AccessError,
  MiraV1Core_BurnEvent,
  MiraV1Core_OwnershipTransferred,
  MiraV1Core_InputError,
  MiraV1Core_OwnershipSet,
  MiraV1Core_InitializationError,
  MiraV1Core_SetDecimalsEvent,
  BridgeFungibleToken,
  BridgeFungibleToken_SetMetadataEvent,
  BridgeFungibleToken_SetNameEvent,
  BridgeFungibleToken_RefundRegisteredEvent,
  BridgeFungibleToken_DepositEvent,
  BridgeFungibleToken_SetSymbolEvent,
  BridgeFungibleToken_ClaimRefundEvent,
  BridgeFungibleToken_WithdrawalEvent,
  BridgeFungibleToken_TotalSupplyEvent,
  BridgeFungibleToken_SetDecimalsEvent

} from "generated";

import * as util from 'util';

BridgeFungibleToken.SetMetadataEvent.handler(async ({ event, context }) => {
  //console.log('BridgeFungibleToken.SetMetadataEvent.handler event', util.inspect(event, false, null, true /* enable colors */));

  // Convert BigInt to string if metadata contains BigInt
  //@ts-ignore
  const metadata = event.params.metadata.payload.case === 'Int' ? { case: event.params.metadata.payload.case, payload: event.params.metadata.payload.payload.toString() } : event.params.metadata.payload;

  const entity: BridgeFungibleToken_SetMetadataEvent = {
    id: `${event.chainId}_${event.block.height}_${event.logIndex}`,
    time: event.block.time,
    block_height: event.block.height,
    transaction_id: event.transaction.id,
    asset: event.params.asset.bits,
    metadata: JSON.stringify(metadata),
    key: event.params.key,
    sender: event.params.sender.payload.bits
  };

  context.BridgeFungibleToken_SetMetadataEvent.set(entity);
});

BridgeFungibleToken.SetNameEvent.handler(async ({ event, context }) => {
  //console.log('BridgeFungibleToken.SetNameEvent.handler event', util.inspect(event, false, null, true /* enable colors */));

  const entity: BridgeFungibleToken_SetNameEvent = {
    id: `${event.chainId}_${event.block.height}_${event.logIndex}`,
    time: event.block.time,
    block_height: event.block.height,
    transaction_id: event.transaction.id,
    asset: event.params.asset.bits,
    name: event.params.name.payload as string || '',
    sender: event.params.sender.payload.bits
  };

  context.BridgeFungibleToken_SetNameEvent.set(entity);
});

BridgeFungibleToken.RefundRegisteredEvent.handler(async ({ event, context }) => {
  console.log('BridgeFungibleToken.RefundRegisteredEvent.handler event', util.inspect(event, false, null, true /* enable colors */));

  const entity: BridgeFungibleToken_RefundRegisteredEvent = {
    id: `${event.chainId}_${event.block.height}_${event.logIndex}`,
    time: event.block.time,
    block_height: event.block.height,
    transaction_id: event.transaction.id,
    from: '',
    token_address: '',
    token_id: '',
    amount: BigInt(0),
  };

  context.BridgeFungibleToken_RefundRegisteredEvent.set(entity);
});


BridgeFungibleToken.DepositEvent.handler(async ({ event, context }) => {
  //console.log('BridgeFungibleToken.DepositEvent.handler event', util.inspect(event, false, null, true /* enable colors */));

  const entity: BridgeFungibleToken_DepositEvent = {
    id: `${event.chainId}_${event.block.height}_${event.logIndex}`,
    time: event.block.time,
    block_height: event.block.height,
    transaction_id: event.transaction.id,
    to: event.params.to.payload.bits,
    from: event.params.from,
    amount: event.params.amount
  };

  context.BridgeFungibleToken_DepositEvent.set(entity);
});

BridgeFungibleToken.SetSymbolEvent.handler(async ({ event, context }) => {
  //console.log('BridgeFungibleToken.SetSymbolEvent.handler event', util.inspect(event, false, null, true /* enable colors */));

  const entity: BridgeFungibleToken_SetSymbolEvent = {
    id: `${event.chainId}_${event.block.height}_${event.logIndex}`,
    time: event.block.time,
    block_height: event.block.height,
    transaction_id: event.transaction.id,
    asset: event.params.asset.bits,
    symbol: event.params.symbol.payload as string || '',
    sender: event.params.sender.payload.bits
  };

  context.BridgeFungibleToken_SetSymbolEvent.set(entity);
});

BridgeFungibleToken.ClaimRefundEvent.handler(async ({ event, context }) => {
  console.log('BridgeFungibleToken.ClaimRefundEvent.handler event', util.inspect(event, false, null, true /* enable colors */));

  const entity: BridgeFungibleToken_ClaimRefundEvent = {
    id: `${event.chainId}_${event.block.height}_${event.logIndex}`,
    time: event.block.time,
    block_height: event.block.height,
    transaction_id: event.transaction.id,
    amount: event.params.amount,
    from: '',
    token_address: '',
    token_id: ''
  };

  context.BridgeFungibleToken_ClaimRefundEvent.set(entity);
});

BridgeFungibleToken.WithdrawalEvent.handler(async ({ event, context }) => {
  console.log('BridgeFungibleToken.WithdrawalEvent.handler event', util.inspect(event, false, null, true /* enable colors */));

  const entity: BridgeFungibleToken_WithdrawalEvent = {
    id: `${event.chainId}_${event.block.height}_${event.logIndex}`,
    time: event.block.time,
    block_height: event.block.height,
    transaction_id: event.transaction.id,
    amount: event.params.amount,
    to: event.params.to,
    from: event.params.from.payload.bits
  };

  context.BridgeFungibleToken_WithdrawalEvent.set(entity);
});

BridgeFungibleToken.TotalSupplyEvent.handler(async ({ event, context }) => {
  console.log('BridgeFungibleToken.TotalSupplyEvent.handler event', util.inspect(event, false, null, true /* enable colors */));

  const entity: BridgeFungibleToken_TotalSupplyEvent = {
    id: `${event.chainId}_${event.block.height}_${event.logIndex}`,
    time: event.block.time,
    block_height: event.block.height,
    transaction_id: event.transaction.id,
    asset: event.params.asset.bits,
    supply: event.params.supply,
    sender: event.params.sender.payload.bits
  };

  context.BridgeFungibleToken_TotalSupplyEvent.set(entity);
});

BridgeFungibleToken.SetDecimalsEvent.handler(async ({ event, context }) => {
  console.log('BridgeFungibleToken.SetDecimalsEvent.handler event', util.inspect(event, false, null, true /* enable colors */));

  const entity: BridgeFungibleToken_SetDecimalsEvent = {
    id: `${event.chainId}_${event.block.height}_${event.logIndex}`,
    time: event.block.time,
    block_height: event.block.height,
    transaction_id: event.transaction.id,
    asset: event.params.asset.bits,
    decimals: event.params.decimals,
    sender: event.params.sender.payload.bits
  };

  context.BridgeFungibleToken_SetDecimalsEvent.set(entity);
});

MiraV1Core.ReentrancyError.handler(async ({ event, context }) => {
  const entity: MiraV1Core_ReentrancyError = {
    id: `${event.chainId}_${event.block.height}_${event.logIndex}`,
    time: event.block.time,
    block_height: event.block.height,
    transaction_id: event.transaction.id,
  };

  context.MiraV1Core_ReentrancyError.set(entity);
});

MiraV1Core.SwapEvent.handler(async ({ event, context }) => {
  console.log('MiraV1Core.SwapEvent.handler event', util.inspect(event, false, null, true /* enable colors */));

  const is_buy = event.params.asset_1_in > 0;
  const is_sell = event.params.asset_1_out > 0;
  let exchange_rate = BigInt(0);
  try{
    if (is_buy) {
      exchange_rate = (BigInt(event.params.asset_1_in) * BigInt(10n ** 18n)) / BigInt(event.params.asset_0_out);
    } else {
      exchange_rate = (BigInt(event.params.asset_1_out) * BigInt(10n ** 18n)) / BigInt(event.params.asset_0_in);
    }
  }
  catch(e){
    console.log('Error calculating exchange rate', e);
  }
  

  const entity: MiraV1Core_SwapEvent = {
    id: `${event.chainId}_${event.block.height}_${event.logIndex}`,
    time: event.block.time,
    block_height: event.block.height,
    transaction_id: event.transaction.id,
    pool_id: `${event.params.pool_id[0].bits}_${event.params.pool_id[1].bits}_${event.params.pool_id[2]}`,
    recipient: event.params.recipient.payload.bits,
    asset_0_in: event.params.asset_0_in,
    asset_1_in: event.params.asset_1_in,
    asset_0_out: event.params.asset_0_out,
    asset_1_out: event.params.asset_1_out,
    exchange_rate: exchange_rate,
    is_buy: is_buy,
    is_sell: is_sell,
  };

  context.MiraV1Core_SwapEvent.set(entity);
});

MiraV1Core.AmmError.handler(async ({ event, context }) => {
  const entity: MiraV1Core_AmmError = {
    id: `${event.chainId}_${event.block.height}_${event.logIndex}`,
    time: event.block.time,
    block_height: event.block.height,
    transaction_id: event.transaction.id,
  };

  context.MiraV1Core_AmmError.set(entity);
});

MiraV1Core.TotalSupplyEvent.handler(async ({ event, context }) => {
  const entity: MiraV1Core_TotalSupplyEvent = {
    id: `${event.chainId}_${event.block.height}_${event.logIndex}`,
    time: event.block.time,
    block_height: event.block.height,
    transaction_id: event.transaction.id,
    asset: event.params.asset.bits,
    supply: event.params.supply,
    sender: event.params.sender.payload.bits,
  };

  context.MiraV1Core_TotalSupplyEvent.set(entity);
});

MiraV1Core.SetSymbolEvent.handler(async ({ event, context }) => {
  const entity: MiraV1Core_SetSymbolEvent = {
    id: `${event.chainId}_${event.block.height}_${event.logIndex}`,
    time: event.block.time,
    block_height: event.block.height,
    transaction_id: event.transaction.id,
    asset: event.params.asset.bits,
    symbol: event.params.symbol.case === "Some" ? event.params.symbol.payload : undefined,
    sender: event.params.sender.payload.bits,
  };

  context.MiraV1Core_SetSymbolEvent.set(entity);
});

MiraV1Core.CreatePoolEvent.handler(async ({ event, context }) => {
  const entity: MiraV1Core_CreatePoolEvent = {
    id: `${event.chainId}_${event.block.height}_${event.logIndex}`,
    time: event.block.time,
    block_height: event.block.height,
    transaction_id: event.transaction.id,
    pool_id: `${event.params.pool_id[0].bits}_${event.params.pool_id[1].bits}_${event.params.pool_id[2]}`,
    decimals_0: event.params.decimals_0,
    decimals_1: event.params.decimals_1,
  };

  context.MiraV1Core_CreatePoolEvent.set(entity);
});

MiraV1Core.SetNameEvent.handler(async ({ event, context }) => {
  console.log('MiraV1Core_SetNameEvent', event)
  const entity: MiraV1Core_SetNameEvent = {
    id: `${event.chainId}_${event.block.height}_${event.logIndex}`,
    time: event.block.time,
    block_height: event.block.height,
    transaction_id: event.transaction.id,
    asset: event.params.asset.bits,
    name: event.params.name.case === "Some" ? event.params.name.payload : undefined,
    sender: event.params.sender.payload.bits,
  };

  context.MiraV1Core_SetNameEvent.set(entity);
});

MiraV1Core.MintEvent.handler(async ({ event, context }) => {
  // console.log('MiraV1Core.MintEvent.handler event', util.inspect(event, false, null, true /* enable colors */));
  const entity: MiraV1Core_MintEvent = {
    id: `${event.chainId}_${event.block.height}_${event.logIndex}`,
    time: event.block.time,
    block_height: event.block.height,
    transaction_id: event.transaction.id,
    pool_id: `${event.params.pool_id[0].bits}_${event.params.pool_id[1].bits}_${event.params.pool_id[2]}`,
    recipient: event.params.recipient.payload.bits,
    liquidity: `${event.params.liquidity.id.bits}_${event.params.liquidity.amount.toString()}`,
    asset_0_in: event.params.asset_0_in,
    asset_1_in: event.params.asset_1_in,
  };

  context.MiraV1Core_MintEvent.set(entity);
});

MiraV1Core.AccessError.handler(async ({ event, context }) => {
  const entity: MiraV1Core_AccessError = {
    id: `${event.chainId}_${event.block.height}_${event.logIndex}`,
    time: event.block.time,
    block_height: event.block.height,
    transaction_id: event.transaction.id,
  };

  context.MiraV1Core_AccessError.set(entity);
});

MiraV1Core.BurnEvent.handler(async ({ event, context }) => {
  const entity: MiraV1Core_BurnEvent = {
    id: `${event.chainId}_${event.block.height}_${event.logIndex}`,
    time: event.block.time,
    block_height: event.block.height,
    transaction_id: event.transaction.id,
    pool_id: `${event.params.pool_id[0].bits}_${event.params.pool_id[1].bits}_${event.params.pool_id[2]}`,
    recipient: event.params.recipient.payload.bits,
    liquidity: `${event.params.liquidity.id.bits}_${event.params.liquidity.amount.toString()}`,
    asset_0_out: event.params.asset_0_out,
    asset_1_out: event.params.asset_1_out,
  };

  context.MiraV1Core_BurnEvent.set(entity);
});

MiraV1Core.OwnershipTransferred.handler(async ({ event, context }) => {
  const entity: MiraV1Core_OwnershipTransferred = {
    id: `${event.chainId}_${event.block.height}_${event.logIndex}`,
    time: event.block.time,
    block_height: event.block.height,
    transaction_id: event.transaction.id,
    previousOwner: event.params.previous_owner?.payload.bits,
    newOwner: event.params.new_owner?.payload.bits,
  };

  context.MiraV1Core_OwnershipTransferred.set(entity);
});

MiraV1Core.InputError.handler(async ({ event, context }) => {
  const entity: MiraV1Core_InputError = {
    id: `${event.chainId}_${event.block.height}_${event.logIndex}`,
    time: event.block.time,
    block_height: event.block.height,
    transaction_id: event.transaction.id,
  };

  context.MiraV1Core_InputError.set(entity);
});

MiraV1Core.OwnershipSet.handler(async ({ event, context }) => {
  const entity: MiraV1Core_OwnershipSet = {
    id: `${event.chainId}_${event.block.height}_${event.logIndex}`,
    time: event.block.time,
    block_height: event.block.height,
    transaction_id: event.transaction.id,
    owner: event.params.new_owner.payload.bits,
  };

  context.MiraV1Core_OwnershipSet.set(entity);
});

MiraV1Core.InitializationError.handler(async ({ event, context }) => {
  const entity: MiraV1Core_InitializationError = {
    id: `${event.chainId}_${event.block.height}_${event.logIndex}`,
    time: event.block.time,
    block_height: event.block.height,
    transaction_id: event.transaction.id,
  };

  context.MiraV1Core_InitializationError.set(entity);
});

MiraV1Core.SetDecimalsEvent.handler(async ({ event, context }) => {
  const entity: MiraV1Core_SetDecimalsEvent = {
    id: `${event.chainId}_${event.block.height}_${event.logIndex}`,
    time: event.block.time,
    block_height: event.block.height,
    transaction_id: event.transaction.id,
    asset: event.params.asset.bits,
    decimals: event.params.decimals,
    sender: event.params.sender.payload.bits,
  };

  context.MiraV1Core_SetDecimalsEvent.set(entity);
});
