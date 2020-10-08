import { integer } from '@protofire/subgraph-toolkit'

import { CurveRegistry, PoolAdded, PoolRemoved, TokenExchange, NewAdmin } from '../../generated/Curve/CurveRegistry'

import { Pool } from '../../generated/schema'

import { getOrCreatePool, getOrCreateToken, getSystemInfo } from '../entities'

export function handlePoolAdded(event: PoolAdded): void {
  let pool = getOrCreatePool(event.params.pool, event.block, event.transaction)

  let registry = CurveRegistry.bind(event.address)
  let poolInfo = registry.get_pool_info(event.params.pool)
  let lpToken = getOrCreateToken(poolInfo.lp_token, event.block, event.transaction)

  pool.poolToken = lpToken.id
  pool.rateMethodId = event.params.rate_method_id

  pool.addedAt = event.block.timestamp
  pool.addedAtBlock = event.block.number
  pool.addedAtTransaction = event.transaction.hash

  pool.save()
}

export function handlePoolRemoved(event: PoolRemoved): void {
  let pool = Pool.load(event.params.pool.toHexString())

  if (pool != null) {
    pool.removedAt = event.block.timestamp
    pool.removedAtBlock = event.block.number
    pool.removedAtTransaction = event.transaction.hash
    pool.save()

    let system = getSystemInfo(event.block, event.transaction)
    system.poolCount = system.poolCount.minus(integer.ONE)
    system.save()
  }
}

export function handleTokenExchange(event: TokenExchange): void {
  let pool = Pool.load(event.params.pool.toHexString())

  if (pool != null) {
    // TODO
  }
}

export function handleNewAdmin(event: NewAdmin): void {
  let system = getSystemInfo(event.block, event.transaction)
  system.registryOwner = event.params.admin

  system.save()
}
