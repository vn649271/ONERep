// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { artifacts, ethers, waffle } from "hardhat";
import type { Artifact } from "hardhat/types";

 import type { ERC1238Mock } from "./src/types/ERC1238Mock";
 import type { ERC1238ReceiverMock } from "./src/types/ERC1238RecieverMock";

async function main() {

  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const [owner, addr1, addr2] = await ethers.getSigners();

  /************************Deploying the Badge Contract************************/

  const Badge = await ethers.getContractFactory("Badge");
  const badge = await Badge.deploy(owner.address,"");

  await badge.deployed();

  console.log("Badge deployed to:", badge.address);

  /***********************Deploying Reciever Smart Contract *******************/
   let smartContractRecipient1: ERC1238ReceiverMock;
  let tokenRecipient: SignerWithAddress;
  const signers: SignerWithAddress[] = await ethers.getSigners();
  console.log("Signer 0 Address", signers[0].address)

  const ERC1238ReceiverMockArtifact: Artifact = await artifacts.readArtifact("ERC1238ReceiverMock");
  smartContractRecipient1 = <ERC1238ReceiverMock>(await waffle.deployContract(signers[0], ERC1238ReceiverMockArtifact));
  console.log("Recipient is deployed at address:", smartContractRecipient1.address )
  const toBN = (units: string, decimalPlaces: number = 18) => ethers.utils.parseUnits(units, decimalPlaces);
  const tokenAmount = toBN("1");
  const tokenURI = "https://your-domain-name.com/credentials/tokens/1";
  await badge.connect(owner).mintToContract(smartContractRecipient1.address, 1, tokenAmount, tokenURI, []);
  console.log("The recipient balance is", await badge.balanceOf(smartContractRecipient1.address, 1));

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
