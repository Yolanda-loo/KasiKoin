const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying KasiKoin to Celo Alfajores testnet...");

  // Get the contract factory
  const KasiKoin = await ethers.getContractFactory("KasiKoin");
  
  // Deploy the contract
  const kasiKoin = await KasiKoin.deploy();
  await kasiKoin.deployed();

  console.log("KasiKoin deployed to:", kasiKoin.address);
  
  // Verify the contract on the testnet explorer (optional)
  console.log("Verifying contract on explorer...");
  try {
    await run("verify:verify", {
      address: kasiKoin.address,
      constructorArguments: [],
    });
    console.log("Contract verified successfully");
  } catch (error) {
    console.log("Error verifying contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
