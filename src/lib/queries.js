export const leaderboardQuery = `
query LeaderboardQuery {
  KickTheMarket_Mint(limit: 50, order_by: {score: desc}) {
    anomalyLevel
    blackSwanLevel
    score
    to
    totalKicks
    tokenId
  }
}
`
