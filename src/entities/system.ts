import { ethereum } from '@graphprotocol/graph-ts'
import { integer } from '@protofire/subgraph-toolkit'

import { SystemInfo } from '../../generated/schema'

export function getSystemInfo(block: ethereum.Block, tx: ethereum.Transaction): SystemInfo {
  let state = SystemInfo.load('current')

  if (state == null) {
    state = new SystemInfo('current')

    state.exchangeCount = integer.ZERO
    state.poolCount = integer.ZERO
    state.tokenCount = integer.ZERO
  }

  state.updated = block.timestamp
  state.updatedAtBlock = block.number
  state.updatedAtTransaction = tx.hash

  return state as SystemInfo
}
