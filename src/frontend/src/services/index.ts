import { BrowserProvider, Contract } from "ethers";
import PresiSimTokenAbi from '../../../contract/deployments/boba-sepolia/PresiSimToken.json';
import { PRESI_SIM_TOKEN_CONTRACT } from "@/config/snap";

export const tokenContract = async () => {
  const provider = new BrowserProvider(window.ethereum, 'any')
  const contract = new Contract(
    PRESI_SIM_TOKEN_CONTRACT,
    PresiSimTokenAbi.abi,
    provider
  )
  return contract;
}
export const fetchDailyReward = async () => {
  const contract = await tokenContract();
  return await contract.dailyReward();
}
export const fetchReferralReward = async () => {
  const contract = await tokenContract();
  const reward = await contract.referralReward();
  return Number(reward);
}
export const fetchConsecutiveReward = async () => {
  const contract = await tokenContract();
  return await contract.consecutiveReward()
}
export const fetchTodaysQuestion = async () => {
  const contract = await tokenContract();
  return await contract.getCurrentQuesiton()
}
export const fetchTodaysGameId = async () => {
  const contract = await tokenContract();
  return await contract.currentGameID()
}
export const fetchTodaysQuestionPlayed = async (address: string) => {
  const contract = await tokenContract();
  const gameId = await fetchTodaysGameId();
  const hasPlayed = await contract.hasPlayed(gameId, address)
  return hasPlayed;
}
export const fetchQuestionAnswer = async (address: string) => {
  const contract = await tokenContract();
  const gameId = await fetchTodaysGameId();
  const answer = await contract.answers(gameId, address);
  return answer;
}
export const listenToAnswerSelection = async () => {
  const contract = await tokenContract();
  contract.on('GameResultsSubmitted', (from, to, value, event) => {
    console.log({
      from: from,
      to: to,
      value: value.toString(),
      data: event
    });
    window.location.reload()
  })
}
export const fetchConsecutiveGamesPlayed = async (address: string) => {
  const contract = await tokenContract();
  return await contract.consecutiveGamesPlayed(address)
}

export const fetchBalance = async (address: string) => {
  const contract = await tokenContract();
  return await contract.balanceOf(address)
}
export const fetchWinner = async () => {
  const contract = await tokenContract();
  const gameId = await fetchTodaysGameId();
  const winner = await contract.getWinnerByGameID(gameId)
  return winner || null;
}
