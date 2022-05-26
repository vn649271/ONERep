import { ethers } from "ethers";
import { TESTNET_ADDRESS } from "../shared/constants";

const MintApprovaltypes = {
  MintApproval: [
    { name: "recipient", type: "address" },
    { name: "id", type: "uint256" },
    { name: "amount", type: "uint256" },
  ],
};
const MintBatchApprovalTypes = {
  MintBatchApproval: [
    { name: "recipient", type: "address" },
    { name: "ids", type: "uint256[]" },
    { name: "amounts", type: "uint256[]" },
  ],
};

const getDomain = (web3, chainId, verifyingContract) => ({
  name: web3.utils.keccak256("ERC1238 Mint Approval"),
  version: web3.utils.keccak256("1"),
  chainId: chainId,
  verifyingContract: verifyingContract,
});

export const getContractAddress = async (chainid) => {};

export const getMintApprovalSignature = async ({
  web3,
  erc1238ContractAddress,
  chainId,
  signer,
  id,
  amount,
  address,
}) => {
  // console.log("I am inside get approval")
  const domain = getDomain(web3, chainId, erc1238ContractAddress);

  // const provider = new ethers.providers.JsonRpcProvider(
  //   "https://api.s0.b.hmny.io"
  // );
  // const signer = provider.getSigner(address);

  const value = {
    recipient: address,
    id,
    amount,
  };

  let sig;
  try {
    sig = await signer._signTypedData(domain, MintApprovaltypes, value);
  } catch (err) {
    console.error(err);
    throw err;
  }

  return { fullSignature: sig, ...ethers.utils.splitSignature(sig) };
};

export const getMintBatchApprovalSignature = async ({
  erc1238ContractAddress,
  chainId,
  ids,
  amounts,
  address,
}) => {
  const provider = new ethers.providers.JsonRpcProvider(
    "https://api.s0.b.hmny.io"
  );

  const signer = provider.getSigner(address);

  const domain = getDomain(chainId, erc1238ContractAddress);

  const value = {
    recipient: address,
    ids,
    amounts,
  };

  const sig = await signer._signTypedData(
    domain,
    MintBatchApprovalTypes,
    value
  );

  return { fullSignature: sig, ...ethers.utils.splitSignature(sig) };
};

export const orAlert = msg => {
  alert(msg);
}