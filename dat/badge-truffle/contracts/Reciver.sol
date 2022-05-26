// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Reciver
 * @dev Store & retrieve value in a variable
 * @custom:dev-run-script ./scripts/deploy_with_ethers.ts
 */

import "./ERC1238/IERC1238Receiver.sol";


contract Reciver is IERC1238Receiver {

    uint256 number;

     function  onERC1238Mint(
        address minter,
        uint256 id,
        uint256 amount,
        bytes calldata data
    ) external override returns (bytes4){
        return bytes4(keccak256("onERC1238Mint(address,uint256,uint256,bytes)"));
    }

     function onERC1238BatchMint(
        address minter,
        uint256[] calldata ids,
        uint256[] calldata amounts,
        bytes calldata data
    ) external override returns (bytes4){
        return bytes4(keccak256("onERC1238Mint(address,address,uint256,uint256,bytes)"));
    }
 
}