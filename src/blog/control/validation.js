export const canDelete = (userName, { creator }) =>
  userName === "system" || creator === userName;

export const canVote = (userName, { creator, voteList }) =>
  userName && creator !== userName && !voteList.includes(userName);
