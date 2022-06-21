// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const [owner, addr1, addr2] = await ethers.getSigners();
  const OneRep = await ethers.getContractFactory("ONERep");
  const oneRep = await OneRep.deploy(owner.address, "ORBDG", "")

  await oneRep.deployed();

  console.log("ONERep deployed to:", oneRep.address);

  // const erc1238reciever = await ethers.getContractFactory("ERC1238ReceiverMock");
  // const erc1238 = await erc1238reciever.deploy("0x5BE6E77b69BD3d9418712E21B26b920CA86478Cc","");

  // await erc1238.deployed();

  // console.log("ERC1238 receiver 1 deployed to:", erc1238.address);

  // const erc1238reciever1 = await ethers.getContractFactory("ERC1238ReceiverMock");
  // const erc12381 = await erc1238reciever1.deploy("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266","");

  // await erc12381.deployed();

  // console.log("ERC1238 receiver 2 deployed to:", erc12381.address);

  // const erc1238reciever2 = await ethers.getContractFactory("ERC1238ReceiverMock");
  // const erc12382 = await erc1238reciever2.deploy("0x70997970C51812dc3A010C7d01b50e0d17dc79C8","");

  // await erc1238.deployed();

  // console.log("ERC1238 receiver 3 deployed to:", erc12382.address);


  // const erc1238reciever3 = await ethers.getContractFactory("ERC1238ReceiverMock");
  // const erc12383 = await erc1238reciever3.deploy("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC","");

  // await erc12383.deployed();

  // console.log("ERC1238 receiver 4 deployed to:", erc12383.address);

  // const erc1238reciever4 = await ethers.getContractFactory("ERC1238ReceiverMock");
  // const erc12384 = await erc1238reciever4.deploy("0x236264b88b4221817FB853B03a3369E275B32344","");

  // await erc12384.deployed();

  // console.log("ERC1238 receiver 5 deployed to:", erc12384.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
