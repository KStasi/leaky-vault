import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("🏗️  Deploying Vault Contract");
  console.log("============================");
  console.log("Deployer address:", deployer.address);
  console.log(
    "Deployer balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "ETH"
  );

  // Initial seed for the vault
  const initialSeed = 42;

  console.log("\n📋 Deployment Parameters");
  console.log("========================");
  console.log("Initial seed:", initialSeed);
  console.log("Initial ETH deposit: 1.0 ETH");

  // Deploy the Vault contract with 1 ETH
  console.log("\n🚀 Deploying contract...");
  const Vault = await ethers.getContractFactory("Vault");
  const vault = await Vault.deploy(initialSeed, {
    value: ethers.parseEther("1.0"),
  });

  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();

  console.log("\n✅ Deployment Successful!");
  console.log("========================");
  console.log("Vault contract address:", vaultAddress);
  console.log("Initial seed used:", initialSeed);
  console.log(
    "Contract balance:",
    ethers.formatEther(await ethers.provider.getBalance(vaultAddress)),
    "ETH"
  );

  console.log("\n📝 Next Steps:");
  console.log("1. Copy the vault address above");
  console.log("2. Update the vaultAddress variable in scripts/attack.ts");
  console.log("3. Run: npm run attack");

  return vaultAddress;
}

main()
  .then((address) => {
    console.log("\n🎉 Deployment completed successfully!");
    console.log("Vault address:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Deployment failed:", error);
    process.exit(1);
  });
