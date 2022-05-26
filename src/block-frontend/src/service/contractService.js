import { TESTNET_ADDRESS, MAINNET_ADDRESS } from "../shared/constants";
import { getMintBatchApprovalSignature } from "./utils";
import { ethers } from "ethers";
import ONERepDeployedInfo from "../shared/ONERep.json";
import ERC1238ReceiverMockDeployInfo from "../shared/ERC1238ReceiverMock.json";


let contract = null;
let deployedContractAddress = null;
let gas_price = '';

let mainnetChainIDs = [1666600000, 1666600001, 1666600002, 1666600003];

let testnetChainIDs = [1666700000, 1666700001, 1666700002, 1666700003];

const determineAddress = async (chainId) => {
  if (mainnetChainIDs.find((id) => id === chainId)) {
    return MAINNET_ADDRESS;
  } else if (testnetChainIDs.find((id) => id === chainId)) {
    return TESTNET_ADDRESS;
  } else {
    throw new Error("This chain ID does not exist on the HARMONY NETWORK");
  }
};

/*******************************Deploy badge contract******************/
export const deployBadgeContract = async web3 => {
  console.log("Getting account...");
  const accounts = await web3.eth.getAccounts();
  console.log("This account: ", accounts[0]);
  console.log("Getting current gas price...");
  let gasPrice = await web3.eth.getGasPrice();
  if (gasPrice === null || gasPrice === "" || parseInt(gasPrice) <= 0) {
    console.log("Failed to get gas price in deployBadgeContract()");
    return null;
  }
  console.log("Current gas price:", gasPrice);
  const result = await new web3.eth.Contract(ONERepDeployedInfo.abi)
    .deploy({ data: ONERepDeployedInfo.bytecode, arguments:[localStorage.getItem('wallet') , ''] })
    .send({ from: accounts[0], gasPrice: gasPrice });
  console.log("Deployed Badge token Contract: ", result.options.address);
  return result.options.address;
};

/*******************************Deploy New contract******************/
export const deployRecipientContract = async (web3) => {

  console.log("Deploying Recipient Contract....");
  const toBN1 = (units, decimalPlaces) => ethers.utils.parseUnits(units, 18);
  
  const accounts = await web3.eth.getAccounts();
  console.log("After getting accounts", accounts)
  //console.log("bytecode",bytecode)
  console.log("ABI : ", ERC1238ReceiverMockDeployInfo.abi)
  console.log("Getting current gas price...");
  let gasPrice = await web3.eth.getGasPrice();
  if (gasPrice === null || gasPrice === "" || parseInt(gasPrice) <= 0) {
    console.log("Failed to get gas price in deployBadgeContract()");
    return null;
  }
  console.log("Current gas price:", gasPrice);

  const result = await new web3.eth.Contract(ERC1238ReceiverMockDeployInfo.abi)
    .deploy({ data: ERC1238ReceiverMockDeployInfo.bytecode, arguments:[localStorage.getItem('wallet') , ''] })
    .send({ from: accounts[0], gasPrice: parseInt(gasPrice) });
  
  console.log("Deployed Recipient Contract: ", result.options.address);
  return result.options.address;
};
// export const deployContract = async(web3) =>{

// //   let deploy_contract = new web3.eth.Contract(JSON.parse(abi));

// //   let payload = {
// //     data: bytecode
// // }

// // let parameter = {
// //   from: account,
// //   gas: web3.utils.toHex(800000),
// //   gasPrice: web3.utils.toHex(web3.utils.toWei('30', 'gwei'))
// // }

// // deploy_contract.deploy(payload).send(parameter, (err, transactionHash) => {
// //   console.log('Transaction Hash :', transactionHash);
// // }).on('confirmation', () => {}).then((newContractInstance) => {

// //   deployedContractAddress = newContractInstance.options.address; 
// //   console.log('Deployed Contract Address : ', newContractInstance.options.address);
// // }) 

// // return deployContractAddress

// }
export const initContractByChainId = async (web3, chainId) => {
  contract = new web3.eth.Contract(ONERepDeployedInfo.abi, await determineAddress(chainId));
  return contract;
};
export const initContractByAddress = async (web3, address, provider) => {
  console.log("before calling address")
  contract = new ethers.Contract(address, ONERepDeployedInfo.abi, provider)
  return contract;
};

// export const initContractAddress = async (web3) => {
//  // contract = new web3.eth.Contract(ONERepDeployedInfo.abi, await determineAddress(1666700000));
 
//   return contract.options.address;
// };

export const getContractInstance = async () => {
  if (contract) {
    return contract;
  } else {
    throw new Error("Contract not yet initalized");
  }
};

export const testBundleMint = async (
  signer1,
  eoaRecipient,
  walletAddress,
  chainId
) => {
  const tokenBatchIds = ["2000", "2010", "2020"];
  const tokenBatchURIs = [
    "https://ipfs.io/ipfs/Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu",
    "https://ipfs.io/ipfs/Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiv",
    "https://ipfs.io/ipfs/Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiw",
  ];
  const mintBatchAmounts = ["5000", "10000", "42195"];

  const ids = [tokenBatchIds, tokenBatchIds, tokenBatchIds];
  const amounts = [mintBatchAmounts, mintBatchAmounts, mintBatchAmounts];
  const uris = [tokenBatchURIs, tokenBatchURIs, tokenBatchURIs];

  const signatureFromSigner1 = await getMintBatchApprovalSignature({
    erc1238ContractAddress: TESTNET_ADDRESS,
    chainId,
    signer: signer1,
    ids: ids[0],
    amounts: amounts[0],
  });

  const signatureFromEoaRecipient = await getMintBatchApprovalSignature({
    erc1238ContractAddress: TESTNET_ADDRESS,
    chainId,
    signer: eoaRecipient,
    ids: ids[2],
    amounts: amounts[2],
  });

  const data = [
    signatureFromSigner1.fullSignature,
    [],
    signatureFromEoaRecipient.fullSignature,
  ];

  // mintBundle(to, ids, amounts, uris, data, walletAddress);
};

export const mintBundle = async (to, ids, amounts, uris, data, address) => {
  return await contract.methods
    .mintBundle(to, ids, amounts, uris, data)
    .send({ from: address });
};
