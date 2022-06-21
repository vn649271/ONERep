import { ethers } from "ethers";

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

export const handleDST = dtStr => {
  Date.prototype.stdTimezoneOffset = function() {
    var fy = this.getFullYear();
    if (!Date.prototype.stdTimezoneOffset.cache.hasOwnProperty(fy)) {
        var maxOffset = new Date(fy, 0, 1).getTimezoneOffset();
        var monthsTestOrder = [6,7,5,8,4,9,3,10,2,11,1];

        for(var mi = 0; mi < 12; mi++) {
            var offset = new Date(fy, monthsTestOrder[mi], 1).getTimezoneOffset();
            if (offset != maxOffset) { 
                maxOffset = Math.max(maxOffset,offset);
                break;
            }
        }
        Date.prototype.stdTimezoneOffset.cache[fy] = maxOffset;
    }
    return Date.prototype.stdTimezoneOffset.cache[fy];
  };

  Date.prototype.stdTimezoneOffset.cache = {};

  Date.prototype.isDST = function() {
    return this.getTimezoneOffset() < this.stdTimezoneOffset(); 
  };
  const d = new Date(dtStr)
  const estOffset = d.isDST() ? 1 : 0;
  const consideredDST = d.valueOf() + (3600 * 1000 * estOffset)
  console.log(new Date(consideredDST).toLocaleString());
  // convert msec value to date string
  return consideredDST
}

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
  // id,
  amount,
  recipient,
}) => {
  // console.log("I am inside get approval")
  const domain = getDomain(web3, chainId, erc1238ContractAddress);

  // const provider = new ethers.providers.JsonRpcProvider(
  //   "https://api.s0.b.hmny.io"
  // );
  // const signer = provider.getSigner(address);

  const value = {
    recipient,
    id: 1, //id,
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
  web3,
  erc1238ContractAddress,
  chainId,
  signer,
  // ids,
  amounts,
  recipient,
}) => {
  // const provider = new ethers.providers.JsonRpcProvider(
  //   "https://api.s0.b.hmny.io"
  // );

  // const signer = provider.getSigner(address);

  // const domain = getDomain(chainId, erc1238ContractAddress);
  const domain = getDomain(web3, chainId, erc1238ContractAddress);

  const value = {
    recipient,
    ids: [1],
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