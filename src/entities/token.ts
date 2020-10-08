import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { integer } from '@protofire/subgraph-toolkit'

import { ERC20 } from '../../generated/Curve/ERC20'
import { Token } from '../../generated/schema'

import { getSystemInfo } from './system'

export function getOrCreateToken(address: Address, block: ethereum.Block, tx: ethereum.Transaction): Token {
  let token = Token.load(address.toHexString())

  if (token == null) {
    let erc20 = ERC20.bind(address)

    let name = erc20.try_name()
    let symbol = erc20.try_symbol()
    let decimals = erc20.try_decimals()

    token = new Token(address.toHexString())
    token.address = address
    token.name = name.reverted ? null : name.value.toString()
    token.symbol = symbol.reverted ? null : symbol.value.toString()
    token.decimals = BigInt.fromI32(decimals.reverted ? 18 : <i32>decimals.value)
    token.save()

    let system = getSystemInfo(block, tx)
    system.tokenCount = system.tokenCount.plus(integer.ONE)
    system.save()
  }

  return token as Token
}
