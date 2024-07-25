const hre = require("hardhat");

async function main() {
  const JAN_1ST_2030 = 1893456010;
  const message = "Initial Message";

  console.log("Deploying contract...");
  const swisstronik = await hre.ethers.deployContract("SwissTronikPrivateNFT");

  await swisstronik.waitForDeployment();
  console.log(`Contract deployed to ${swisstronik.target}`);

  console.log(`Pausing 5 seconds in order to verify Contract`);
  await delay();
  console.log(`Pause finished. Verifying Contract...`);

  try {
    await hre.run("verify:verify", {
      address: swisstronik.target,
      constructorArguments: [],
    });
    console.log("Contract verified to", hre.config.etherscan.customChains[0].urls.browserURL + "/address/" + contract.target);
  } catch (err) {
    console.error("Error veryfing Contract. Reason:", err);
  }
}

function delay() {
  return new Promise((resolve) => setTimeout(resolve, 5 * 1000));
}

//DEFAULT BY HARDHAT:
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});