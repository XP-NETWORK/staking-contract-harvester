import { providers, Contract, BigNumber } from "ethers";
import Staker from "./XPNetworkStaker.json";
import XPNet from "./XPNet.json";
import axios from "axios";

const provider = new providers.JsonRpcProvider({
  url: "https://bsc-dataseed.binance.org/",
});

const StakerContract = new Contract(
  "0xbC9091bE033b276b7c2244495699491167C20037",
  Staker.abi,
  provider
);

const XpNet = new Contract(
  "0x8cf8238abf7b933bf8bb5ea2c7e4be101c11de2a",
  XPNet,
  provider
);

const getStakedSum = async () => {
  return await StakerContract.functions.stakedCount();
};

const APY = {
  7776000: 0.11,
  15552000: 0.35,
  23328000: 0.75,
  31536000: 1.25,
};

let availableRewards: {
  //@ts-ignore
  value: any;
  //@ts-ignore
  lockIn: any;
  startTime: any;
}[] = [];

const getOnMaturityRewards = async () => {
  const lastNonce = await StakerContract.functions.totalSupply();
  for (let i = availableRewards.length; i <= lastNonce; i++) {
    try {
      let stake = await axios.get(
        `https://staking-api.xp.network/staking-nfts/${i}`
      );

      availableRewards.push({
        //@ts-ignore
        value: stake.data.attributes[0].value,
        //@ts-ignore
        lockIn: stake.data.attributes[2].value,
        //@ts-ignore
        startTime: stake.data.attributes[1].value,
      });
    } catch (e) {
      break;
    }
  }
  let rewards = BigNumber.from("0");
  for (let i = 0; i < availableRewards.length; i++) {
    let lockIn = availableRewards[i].lockIn;
    let value = availableRewards[i].value;
    let startTime = availableRewards[i].startTime;
    let currentTime = Math.floor(Date.now() / 1000);
    let td = _calculateTimeDifference(currentTime, lockIn, startTime);
    let valueBN = BigNumber.from(value.toString());
    let rew = valueBN
      .mul(1125)
      .mul(td)
      .div(lockIn / 1000)
      .div(10000);
    rewards = rewards.add(rew);
  }
  return rewards;
};

function _calculateTimeDifference(
  now: number,
  lockIn: number,
  startTime: number
) {
  if (now - startTime > lockIn) {
    return lockIn;
  } else {
    return now - startTime;
  }
}

let totalAvailableRewards: BigNumber[] = [];

const getTotalAvailableRewards = async () => {
  const lastNonce = await StakerContract.functions.totalSupply();
  for (let i = totalAvailableRewards.length; i <= lastNonce; i++) {
    try {
      let stake = await axios.get(
        `https://staking-api.xp.network/staking-nfts/${i}`
      );
      //@ts-ignore
      totalAvailableRewards.push(stake.data.attributes[4].value);
    } catch (e) {
      break;
    }
  }
  const totalRewards = totalAvailableRewards.reduce((sum, current) => {
    const sumBN = BigNumber.from(sum);
    const currentBN = BigNumber.from(current);
    return sumBN.add(currentBN);
  });
  return totalRewards;
};

const getBalanceOfContract = async () => {
  return await XpNet.functions.balanceOf(
    "0xbC9091bE033b276b7c2244495699491167C20037"
  );
};

export default {
  getStakedSum,
  getBalanceOfContract,
  getOnMaturityRewards,
  getTotalAvailableRewards,
};
