import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { decimal } from '@protofire/subgraph-toolkit'

const FEE_DECIMALS = 10

export function toFeeDecimal(value: BigInt): BigDecimal {
  return decimal.convert(value, FEE_DECIMALS)
}
