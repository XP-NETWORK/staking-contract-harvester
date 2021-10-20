import express from "express";
import contract from "./contract";

const app = express();

app.get("/getData", async (_req, res) => {
  const stakedSum = await contract.getStakedSum();
  const balanceOfContract = await contract.getBalanceOfContract();
  const totalRewardsAvailable = await contract.getTotalAvailableRewards();
  const maturityRewards = await contract.getOnMaturityRewards();
  res.json({
    stakedSum: stakedSum.toString(),
    balanceOfContract: balanceOfContract.toString(),
    totalRewardsAvailable: totalRewardsAvailable.toString(),
    maturityRewards: maturityRewards.toString(),
  });
});

app.listen(3000);
