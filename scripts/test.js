// scripts/deploy.js
const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const SwissTronik = await hre.ethers.getContractFactory("SwissTronik");
    console.log("Deploying SwissTronik...");
    const swisstronik = await hre.upgrades.deployProxy(SwissTronik, ["Initial Message"], {
        initializer: "initialize",
    });
    console.log("SwissTronik deployed to:", swisstronik.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
