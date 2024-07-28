const hre = require("hardhat");
const { encryptDataField, decryptNodeResponse } = require('@swisstronik/utils');

// Fungsi untuk mengirimkan transaksi shielded
const sendShieldedTransaction = async (signer, destination, data, value) => {
    const rpcLink = hre.network.config.url; // Mengambil URL RPC dari konfigurasi Hardhat
    try {
        const [encryptedData] = await encryptDataField(rpcLink, data); // Enkripsi data

        return await signer.sendTransaction({
            to: destination,
            data: encryptedData,
            value,
        });
    } catch (error) {
        console.error("Error sending shielded transaction:", error);
        throw error; // Lempar ulang error untuk ditangani di fungsi utama
    }
};

// Fungsi untuk mengirimkan query shielded
const sendShieldedQuery = async (provider, destination, data) => {
    const rpcLink = hre.network.config.url;
    try {
        const [encryptedData, usedEncryptedKey] = await encryptDataField(rpcLink, data); // Enkripsi data
        const response = await provider.call({
            to: destination,
            data: encryptedData,
        });
        return await decryptNodeResponse(rpcLink, response, usedEncryptedKey); // Dekripsi respons
    } catch (error) {
        console.error("Error sending shielded query:", error);
        throw error; // Lempar ulang error untuk ditangani di fungsi utama
    }
};



// Fungsi untuk mendapatkan URL eksplorasi transaksi
const getExplorerUrl = (txHash) => `https://explorer-evm.testnet.swisstronik.com/tx/${txHash}`;

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy SwissTronik contract
    const swisstronik = await hre.ethers.deployContract("SwissTronik", ["Initial Message"]);
    await swisstronik.waitForDeployment();
    console.log("[Task 1] SwissTronik contract deployed to:", swisstronik.target);

    // Verify SwissTronik contract

    // Set message in SwissTronik contract
    try {
        const functionName = "setMessage";
        const messageToSet = "Hello Swisstronik from samidbangkit";
        const setMessageTx = await sendShieldedTransaction(
            deployer,
            swisstronik.target,
            swisstronik.interface.encodeFunctionData(functionName, [messageToSet]),
            0
        );
        await setMessageTx.wait();
        console.log("Set message transaction hash:", getExplorerUrl(setMessageTx.hash));
    } catch (error) {
        console.error("Error setting message:", error);
    }

    // Get message from SwissTronik contract using shielded query
    try {
        const functionName = "getMessage";
        const responseMessage = await sendShieldedQuery(
            deployer.provider,
            swisstronik.target,
            swisstronik.interface.encodeFunctionData(functionName)
        );
        console.log("Decoded response:", swisstronik.interface.decodeFunctionResult(functionName, responseMessage)[0]);
    } catch (error) {
        console.error("Error getting message:", error);
    }

    // Deploy SwissTronikERC20 contract
    const swissTronikERC20 = await hre.ethers.deployContract("SwissTronikERC20");
    await swissTronikERC20.waitForDeployment();
    console.log("[Task 2] SwissTronikERC20 contract deployed to:", swissTronikERC20.target);

    // Verify SwissTronikERC20 contract

    // Mint and burn tokens using SwissTronikERC20
    try {
        // Mint 100 tokens
        const mintFunctionName = "mint100tokens";
        const mintTx = await sendShieldedTransaction(
            deployer,
            swissTronikERC20.target,
            swissTronikERC20.interface.encodeFunctionData(mintFunctionName),
            0
        );
        await mintTx.wait();
        console.log("Minted 100 tokens transaction hash:", getExplorerUrl(mintTx.hash));

        // Burn 100 tokens
        const burnFunctionName = "burn100tokens";
        const burnTx = await sendShieldedTransaction(
            deployer,
            swissTronikERC20.target,
            swissTronikERC20.interface.encodeFunctionData(burnFunctionName),
            0
        );
        await burnTx.wait();
        console.log("Burned 100 tokens transaction hash:", getExplorerUrl(burnTx.hash));

        // Mint additional 100 tokens
        const additionalMintTx = await sendShieldedTransaction(
            deployer,
            swissTronikERC20.target,
            swissTronikERC20.interface.encodeFunctionData(mintFunctionName),
            0
        );
        await additionalMintTx.wait();
        console.log("Mint additional 100 tokens transaction hash:", getExplorerUrl(additionalMintTx.hash));

        // Transfer 1 token to a specific address
        const recipient = "0x16af037878a6cAce2Ea29d39A3757aC2F6F7aac1";
        const transferAmount = hre.ethers.parseUnits("1", 18);
        const transferFunctionArgs = [recipient, transferAmount];
        const transferTx = await sendShieldedTransaction(
            deployer,
            swissTronikERC20.target,
            swissTronikERC20.interface.encodeFunctionData("transfer", transferFunctionArgs),
            0
        );
        await transferTx.wait();
        console.log(`Transferred 1 token to ${recipient} transaction hash:`, getExplorerUrl(transferTx.hash));

        // Get recipient balance
        const balanceData = swissTronikERC20.interface.encodeFunctionData("balanceOf", [recipient]);
        const balanceResponse = await sendShieldedQuery(deployer.provider, swissTronikERC20.target, balanceData);
        const [recipientBalance] = swissTronikERC20.interface.decodeFunctionResult("balanceOf", balanceResponse);
        console.log(`Recipient balance: ${hre.ethers.formatUnits(recipientBalance, 18)}`);
    } catch (error) {
        console.error("Error interacting with SwissTronikERC20 contract:", error);
    }

    // Deploy SwissTronikNFT contract
    const swissTronikNFT = await hre.ethers.deployContract("SwissTronikNFT", [deployer.address]);
    await swissTronikNFT.waitForDeployment();
    console.log(`[Task 3] SwissTronikNFT contract deployed to ${swissTronikNFT.target}`);

    // Verify SwissTronikNFT contract

    // Mint NFT
    try {
        const mintFunctionName = "safeMint";
        const mintTx = await sendShieldedTransaction(
            deployer,
            swissTronikNFT.target,
            swissTronikNFT.interface.encodeFunctionData(mintFunctionName, [deployer.address, 1]), // Use a unique tokenId
            0
        );
        await mintTx.wait();
        console.log("Mint NFT transaction hash:", getExplorerUrl(mintTx.hash));

        // Check NFT balance
        const balanceOfFunctionName = "balanceOf";
        const nftBalanceData = swissTronikNFT.interface.encodeFunctionData(balanceOfFunctionName, [deployer.address]);
        const nftBalanceResponse = await sendShieldedQuery(deployer.provider, swissTronikNFT.target, nftBalanceData);
        const [nftBalance] = swissTronikNFT.interface.decodeFunctionResult(balanceOfFunctionName, nftBalanceResponse);
        console.log(`NFT balance of deployer: ${nftBalance.toString()}`);
    } catch (error) {
        console.error("Error minting or querying NFT:", error);
    }

    // Deploy SwissTronikPERC20 contract
    try {
        const perc20Contract = await hre.ethers.deployContract("SwissTronikPERC20");
        await perc20Contract.waitForDeployment();
        console.log(`[Task 4] SwissTronikPERC20 contract deployed to: ${perc20Contract.target}`);

        // Verify SwissTronikPERC20 contract

        // Mint 100 tokens
        const mintFunctionName = "mint100tokens";
        const mintTx = await sendShieldedTransaction(
            deployer,
            perc20Contract.target,
            perc20Contract.interface.encodeFunctionData(mintFunctionName),
            0
        );
        await mintTx.wait();
        console.log(`Minting token has been successful! Transaction hash: ${getExplorerUrl(mintTx.hash)}`);

        // Transfer 1 token
        const transferFunctionName = "transfer";
        const recipient = "0x16af037878a6cAce2Ea29d39A3757aC2F6F7aac1";
        const transferAmount = hre.ethers.parseUnits("1", 18);
        const transferTx = await sendShieldedTransaction(
            deployer,
            perc20Contract.target,
            perc20Contract.interface.encodeFunctionData(transferFunctionName, [recipient, transferAmount]),
            0
        );
        await transferTx.wait();
        console.log(`Token transfer successful! Transaction hash: ${getExplorerUrl(transferTx.hash)}`);
    } catch (error) {
        console.error("Error deploying or interacting with SwissTronikPERC20 contract:", error);
    }

    // Deploy SwissTronikPrivateNFT contract
    try {
        const swissTronikPrivateNFT = await hre.ethers.deployContract("SwissTronikPrivateNFT");
        await swissTronikPrivateNFT.waitForDeployment();
        console.log("[Task 5] SwissTronikPrivateNFT contract deployed to:", swissTronikPrivateNFT.target);


        // Mint Private NFT
        const mintFunctionName = "mintNFT";
        const mintTx = await sendShieldedTransaction(
            deployer,
            swissTronikPrivateNFT.target,
            swissTronikPrivateNFT.interface.encodeFunctionData(mintFunctionName, [deployer.address]),
            0
        );
        await mintTx.wait();
        console.log("Mint Private NFT transaction hash:", getExplorerUrl(mintTx.hash));
    } catch (error) {
        console.error("Error minting Private NFT:", error);
    }

    // Deploy SwissTronikProxy contract
    const [deployer] = await ethers.getSigners();

  const SwisstronikProxy = await ethers.getContractFactory('SwissTronikSimple');
  const swisstronikProxy = await SwisstronikProxy.deploy();
  await swisstronikProxy.waitForDeployment(); 
  console.log('Swisstronik deployed to:', swisstronikProxy.target);
  console.log(`Deployment transaction hash: https://explorer-evm.testnet.swisstronik.com/address/${swisstronik.target}`);

  console.log('');
  
  const upgradedSwisstronik = await upgrades.deployProxy(SwisstronikProxy, ['Hello Swisstronik from samidbangkit!!'], { kind: 'transparent' });
  await upgradedSwisstronik.waitForDeployment(); 
  console.log("[Task 6] SwissTronikProxy contract deployed to:", upgradedSwisstronik.target);
  console.log(`Deployment transaction hash: https://explorer-evm.testnet.swisstronik.com/address/${upgradedSwisstronik.target}`);

}

main().catch((error) => {
    console.error("An error occurred in the main function:", error);
});
