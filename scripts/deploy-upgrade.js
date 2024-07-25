const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Check if Proxy contract address is provided
    const proxyAddress = "<PROXY_CONTRACT_ADDRESS>"; // Set this to the existing Proxy contract address or keep it as empty for initial deployment

    let proxy;
    let swisstronik;
    
    if (!proxyAddress || proxyAddress === "<PROXY_CONTRACT_ADDRESS>") {
        // Deploy SwissTronik
        console.log("Deploying new SwissTronik contract...");
        swisstronik = await hre.ethers.deployContract("SwissTronik", ["Initial Message"]);
        await swisstronik.waitForDeployment();
        console.log("SwissTronik deployed to:", swisstronik.target);

        // Deploy Proxy
        console.log("Deploying Proxy contract...");
        proxy = await hre.ethers.deployContract("Proxy", [swisstronik.target]);
        await proxy.waitForDeployment();
        console.log("Proxy deployed to:", proxy.target);

        console.log("Deployment complete. Proxy deployed at:", proxy.target);
    } else {
        // Attach to existing Proxy contract
        console.log("Attaching to existing Proxy contract at:", proxyAddress);
        proxy = await hre.ethers.getContractAt("Proxy", proxyAddress);

        // Get the current implementation
        const currentImplementation = await proxy.implementation();
        console.log("Current implementation address:", currentImplementation);

        // Deploy new implementation contract if an upgrade is needed
        const newImplementationAddress = "<NEW_IMPLEMENTATION_CONTRACT_ADDRESS>"; // Set this to the new implementation address
        
        if (currentImplementation !== newImplementationAddress) {
            console.log("Upgrading Proxy to new implementation...");
            
            // Deploy new implementation contract
            const swisstronikV2 = await hre.ethers.deployContract("SwissTronikV2", ["Updated Message"]);
            await swisstronikV2.waitForDeployment();
            console.log("SwissTronikV2 deployed to:", swisstronikV2.target);

            // Update Proxy to point to new implementation
            const tx = await proxy.setImplementation(swisstronikV2.target);
            await tx.wait();
            console.log("Proxy upgraded to new implementation:", swisstronikV2.target);
        } else {
            console.log("No upgrade needed. Proxy is using the latest implementation.");
        }
    }

    // Interact with the deployed Proxy
    const proxyInstance = await hre.ethers.getContractAt("SwissTronik", proxy.target);
    console.log("Message from proxy:", await proxyInstance.getMessage());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
