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

// let availableRewards: BigNumber[] = [];

// const getOnMaturityRewards = async () => {
//   const lastNonce = await StakerContract.functions.totalSupply();
//   for (let i = availableRewards.length; i <= 4; i++) {
//     try {
//       let stake = await axios.get(
//         `https://staking-api.xp.network/staking-nfts/${i}`
//       );

//       availableRewards.push({
//         //@ts-ignore
//         value: stake.data.attributes[0].value,
//         //@ts-ignore
//         lockIn: stake.data.attributes[2].value,
//       });
//     } catch (e) {
//       break;
//     }
//   }
//   const totalRewards = availableRewards.reduce((sum, current) => {
//     const sumBN = BigNumber.from(sum.toString());
//     const currentBN = BigNumber.from(current.toString());
//     const rewards = currentBN.mul(APY);
//     return sumBN.add(currentBN);
//   });
//   return totalRewards.toString();
// };

let totalAvailableRewards: BigNumber[] = [];

const getTotalAvailableRewards = async () => {
  const lastNonce = await StakerContract.functions.totalSupply();
  console.log("TOTAL SUPPLY: ", lastNonce.toString());
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
  // getOnMaturityRewards,
  getTotalAvailableRewards,
};
