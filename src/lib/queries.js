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

export const allSponsorsQuery = `
query AllSponsorsQuery {
  Sponsors_NewSponsor(order_by: {week: asc, tier: asc}) {
    id
    sponsor
    name
    description
    amount
    cta
    logoUrl
    tier
    website
    week
  }
}
`

export const sponsorsByWeekQuery = `
query SponsorsByWeekQuery($week: numeric_comparison_exp = {_eq: ""}) {
  Sponsors_NewSponsor(where: {week: $week}, order_by: {tier: asc}) {
    id
    sponsor
    name
    description
    amount
    cta
    logoUrl
    tier
    website
    week
  }
}
`

export const jackpotWinnersQuery = `
query JackpotWinners {
  Jackpot_JackpotWinner(order_by: {ticketId: desc}) {
    id
    prize
    ticketId
    winner
  }
}
`

export const jackpotClaimedQuery = `
query JackpotClaimed {
  Jackpot_JackpotClaimed {
    id
    prize
    winner
    caller
  }
}
`

export const jackpotTicketsQuery = `
query JackpotTickets {
  Jackpot_TicketAssigned(order_by: {ticketId: desc}) {
    id
    amount
    gameAddress
    player
    ticketId
  }
}
`
