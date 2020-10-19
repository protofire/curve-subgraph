Curve Subgraph
==============

This subgraph provides information about the following Curve liquidity pools:

1. Compound pool
2. USDT pool
3. PAX pool, with lending on yearn.finance
4. Y Pool
5. BUSD pool
6. sUSD pool (v2)
7. renBTC pool
8. sBTC pool
9. HBTC pool
10. Tri-pool
11. GUSD metapool
12. HUSD metapool
13. USDK metapool
14. USDN metapool
15. LinkUSD metapool
16. MUSD metapool
17. RSV metapool


Note: this subgraph doesn't provide transfer data about neither ERC20 nor LP tokens because that would imply indexing 
a lot of events and would cost too much indexing time; it just covers basic token description including address, name,
symbol and decimal precision.


# Queries

## General system summary

```graphql
{
  systemInfo(id: "current") {
    # Total number of pools registered
    poolCount

    # Total number of tokens registered as LP, composing or underlying coins
    tokenCount
  }
}
```


## List all supported pools

```graphql
{
  pools(orderBy: addedAt) {
    # StableSwap contract address
    address

    # Composing coins
    coinCount

    coins {
      address
      name
      symbol
      decimals
    }

    # Current balances
    balances

    # LP token information
    poolToken {
      name
      symbol
      address
    }

    # Pool parameters
    A
    fee
    adminFee
    virtualPrice

    # Pool's events
    events {
      # ...
    }
  }
}
```

Note: pool events that are indexed include exchanges, add/remove liquidity, transfer ownership and pool parameters
 changelogs (A coeff, fee and admin fee changes)
 