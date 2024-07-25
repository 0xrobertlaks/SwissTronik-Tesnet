require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");

require("dotenv").config();

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.9", // Versi untuk kontrak SwissTronikERC20.sol
      },
      {
        version: "0.8.19", // Versi untuk kontrak Swisstronik.sol
      },
      {
        version: "0.8.20", // Versi untuk OpenZeppelin contracts
      },
      {
        version: "0.8.0", // Versi untuk ERC721
      },
      {
        version: "0.8.17", // Versi untuk PERC20
      },
      {
        version: "0.8.18", // Versi untuk PERC20
      },{
        version: "0.8.10", // Versi untuk PERC20
      },
    ]
  },
  networks: {
    swisstronik: {
      url: "https://json-rpc.testnet.swisstronik.com/",
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: `ANY_STRING_WILL_DO`,
    customChains: [
      {
        network: "swisstronik",
        chainId: 1291,
        urls: {
          apiURL: "https://explorer-evm.testnet.swisstronik.com/api",
          browserURL: "https://explorer-evm.testnet.swisstronik.com",
        },
      },
    ],
  },
};