export const leaderboardQuery = `
query LeaderboardQuery($ktm: String!) {
  KickTheMarket_Mint(where: {address: {_eq: $ktm}}, limit: 50, order_by: {score: desc}) {
    address
    anomalyLevel
    blackSwanLevel
    score
    to
    totalKicks
    tokenId
  }
}
`
