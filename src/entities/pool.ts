import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { decimal, integer, ZERO_ADDRESS } from '@protofire/subgraph-toolkit'

import { StableSwap } from '../../generated/Curve/StableSwap'
import { Pool } from '../../generated/schema'

import { getOrCreateToken, getSystemInfo, toFeeDecimal } from './index'

class PoolInfo {
  coins: Address[]
  underlyingCoins: Address[]
  balances: BigInt[]
  A: BigInt
  fee: BigInt
  adminFee: BigInt
  owner: Address
  virtualPrice: BigInt
}

export function getOrCreatePool(address: Address, block: ethereum.Block, tx: ethereum.Transaction): Pool {
  let pool = Pool.load(address.toHexString())

  if (pool == null) {
    let info = getPoolInfo(address)

    pool = new Pool(address.toHexString())
    pool.address = address
    pool.balances = info.balances
    pool.coinCount = info.coins.length
    pool.coins = registerTokens(info.coins, block, tx)
    pool.underlyingCoins = registerTokens(info.underlyingCoins, block, tx)

    pool.A = info.A
    pool.fee = toFeeDecimal(info.fee)
    pool.adminFee = toFeeDecimal(info.adminFee)

    pool.owner = info.owner

    pool.virtualPrice = decimal.fromBigInt(info.virtualPrice)

    pool.addedAt = block.timestamp
    pool.addedAtBlock = block.number
    pool.addedAtTransaction = tx.hash

    pool.save()

    let system = getSystemInfo(block, tx)
    system.poolCount = system.poolCount.plus(integer.ONE)
    system.save()
  }

  return pool as Pool
}

// Gets poll info from swap contract
export function getPoolInfo(swap: Address): PoolInfo {
  let swapContract = StableSwap.bind(swap)

  let coins: Address[] = []
  let underlyingCoins: Address[] = []
  let balances: BigInt[] = []

  let c: ethereum.CallResult<Address>
  let u: ethereum.CallResult<Address>
  let b: ethereum.CallResult<BigInt>

  let i = integer.ZERO

  do {
    c = swapContract.try_coins(i)
    u = swapContract.try_underlying_coins(i)
    b = swapContract.try_balances(i)

    if (!c.reverted && c.value.toHexString() != ZERO_ADDRESS) {
      coins.push(c.value)
    }

    if (!u.reverted && u.value.toHexString() != ZERO_ADDRESS) {
      underlyingCoins.push(u.value)
    }

    if (!b.reverted) {
      balances.push(b.value)
    }

    i = i.plus(integer.ONE)
  } while (!c.reverted && !u.reverted && !b.reverted)

  return {
    coins,
    underlyingCoins,
    balances,
    A: swapContract.A(),
    fee: swapContract.fee(),
    adminFee: swapContract.admin_fee(),
    owner: swapContract.owner(),
    virtualPrice: swapContract.get_virtual_price(),
  }
}

export function getBalances(swap: Address, N_COINS: i32): BigInt[] {
  let swapContract = StableSwap.bind(swap)
  let balances = new Array<BigInt>(N_COINS)

  for (let i = 0; i < N_COINS; ++i) {
    let index = BigInt.fromI32(i)

    balances[i] = swapContract.balances(index)
  }

  return balances
}

function registerTokens(list: Address[], block: ethereum.Block, tx: ethereum.Transaction): string[] {
  let result: string[] = []

  for (let i = 0; i < list.length; ++i) {
    let current = list[i]

    if (current.toHexString() != ZERO_ADDRESS) {
      let token = getOrCreateToken(current, block, tx)

      result.push(token.id)
    }
  }

  return result
}
