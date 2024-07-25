const hre = require("hardhat")
const { sendSignedShieldedQuery } = require("./utils");

describe("SwissTronikPERC20", function () {
  let perc20, wallet

  before(async () => {
    // Deploy PERC20Sample.sol
    const PERC20 = await hre.ethers.getContractFactory("SwissTronikPERC20")
    perc20 = await PERC20.deploy()
    await perc20.deployed()

    // We restore wallet from private key, since hardhat signer does not support
    // transaction signing without sending it
    wallet = new hre.ethers.Wallet(
      process.env.PRIVATE_KEY, 
      new hre.ethers.providers.JsonRpcProvider(hre.network.config.url)
    )

    // Convert some uswtr to pSWTR token
    const tx = await wallet.sendTransaction({
      to: perc20.address,
      value: 100
    })
    await tx.wait()
  })

  it('Example how to obtain balance with signed query', async () => {
    const req = await sendSignedShieldedQuery(
      wallet,
      perc20.address,
      perc20.interface.encodeFunctionData("balanceOf", [wallet.address]),
    );
  
    const balance = perc20.interface.decodeFunctionResult("balanceOf", req)[0]
    console.log('balance: ', balance)
  })
})
