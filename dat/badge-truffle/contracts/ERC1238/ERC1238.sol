// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./IERC1238.sol";
import "./ERC1238Approval.sol";
import "./IERC1238Receiver.sol";
import "../utils/AddressMinimal.sol";

/**
 * @dev Implementation proposal for non-transferable (Badge) tokens
 * See https://github.com/ethereum/EIPs/issues/1238
 */
contract ERC1238 is IERC1238, ERC1238Approval {
    using Address for address;

    // Mapping from token ID to account balances
    mapping(uint256 => mapping(address => uint256)) internal _balances;

    // Used as the URI by default for all token types by relying on ID substitution,
    // e.g. https://token-cdn-domain/{id}.json
    string private baseURI;

    /**
     * @dev Initializes the contract by setting a `baseURI`.
     * See {_setBaseURI}
     */
    constructor(string memory baseURI_) {
        _setBaseURI(baseURI_);
    }

    // TODO: Add support for ERC165
    // function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
    //     return
    //
    // }

    /**
     * @dev This implementation returns the same URI for *all* token types. It relies
     * on the token type ID substitution mechanism as in EIP-1155:
     * https://eips.ethereum.org/EIPS/eip-1155#metadata
     *
     * Clients calling this function must replace the `\{id\}` substring with the
     * actual token type ID.
     */
    function _baseURI() internal view virtual returns (string memory) {
        return baseURI;
    }

    /**
     * @dev See {IERC1238-balanceOf}.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     */
    function balanceOf(address account, uint256 id)
        public
        view
        virtual
        override
        returns (uint256)
    {
        require(
            account != address(0),
            "ERC1238: balance query for the zero address"
        );
        return _balances[id][account];
    }

    /**
     * @dev See {IERC1238-balanceOfBatch}.
     *
     */
    function balanceOfBatch(address account, uint256[] memory ids)
        public
        view
        virtual
        override
        returns (uint256[] memory)
    {
        uint256[] memory batchBalances = new uint256[](ids.length);

        uint256 length = ids.length;
        for (uint256 i = 0; i < length; ++i) {
            batchBalances[i] = balanceOf(account, ids[i]);
        }

        return batchBalances;
    }

    /**
     * @dev See {IERC1238-balanceOfBundle}.
     *
     */
    function balanceOfBundle(address[] memory accounts, uint256[][] memory ids)
        public
        view
        virtual
        override
        returns (uint256[][] memory)
    {
        uint256[][] memory bundleBalances = new uint256[][](accounts.length);

        uint256 length = accounts.length;
        for (uint256 i = 0; i < length; ++i) {
            bundleBalances[i] = balanceOfBatch(accounts[i], ids[i]);
        }

        return bundleBalances;
    }

    /**
     * @dev Sets a new URI for all token types, by relying on the token type ID
     * substitution mechanism as in EIP-1155
     * https://eips.ethereum.org/EIPS/eip-1155#metadata
     *
     * By this mechanism, any occurrence of the `\{id\}` substring in either the
     * URI or any of the amounts in the JSON file at said URI will be replaced by
     * clients with the token type ID.
     *
     * For example, the `https://token-cdn-domain/\{id\}.json` URI would be
     * interpreted by clients as
     * `https://token-cdn-domain/000000000000000000000000000000000000000000000000000000000004cce0.json`
     * for token type ID 0x4cce0.
     *
     *
     * Because these URIs cannot be meaningfully represented by the {URI} event,
     * this function emits no events.
     */
    function _setBaseURI(string memory newBaseURI) internal virtual {
        baseURI = newBaseURI;
    }

    /**
     * @dev Creates `amount` tokens of token type `id`, and assigns them to a smart contract (to).
     *
     *
     * Requirements:
     * - `to` must be a smart contract and must implement {IERC1238Receiver-onERC1238BatchMint} and return the
     * acceptance magic value.
     *
     * Emits a {MintSingle} event.
     */
    function _mintToContract(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) internal virtual {
        require(to.isContract(), "ERC1238: Recipient is not a contract");

        _mint(to, id, amount, data);

        _doSafeMintAcceptanceCheck(msg.sender, to, id, amount, data);
    }

    /**
     * @dev Creates `amount` tokens of token type `id`, and assigns them to the
     * Externally Owned Account (to).
     *
     * Requirements:
     *
     * - `v`, `r` and `s` must be a EIP712 signature from `to` as defined by ERC1238Approval to
     * approve the minting transaction.
     *
     * Emits a {MintSingle} event.
     */
    function _mintToEOA(
        address to,
        uint256 id,
        uint256 amount,
        uint8 v,
        bytes32 r,
        bytes32 s,
        bytes memory data
    ) internal virtual {
        // bytes32 messageHash = _getMintApprovalMessageHash(to, id, amount);
        // _verifyMintingApproval(to, messageHash, v, r, s);
        bytes32 messageHash = _getMintApprovalMessageHash(msg.sender, id, amount);
        _verifyMintingApproval(msg.sender, messageHash, v, r, s);

        _mint(to, id, amount, data);
    }

    /**
     * @dev [Batched] version of {_mintToContract}. A batch specifies an array of token `id` and
     * the amount of tokens for each.
     *
     * Requirements:
     * - `to` must be a smart contract and must implement {IERC1238Receiver-onERC1238BatchMint} and return the
     * acceptance magic value.
     * - `ids` and `amounts` must have the same length.
     *
     * Emits a {MintBatch} event.
     */
    function _mintBatchToContract(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual {
        require(to.isContract(), "ERC1238: Recipient is not a contract");

        _mintBatch(to, ids, amounts, data);

        _doSafeBatchMintAcceptanceCheck(msg.sender, to, ids, amounts, data);
    }

    /**
     * @dev [Batched] version of {_mintToEOA}. A batch specifies an array of token `id` and
     * the amount of tokens for each.
     *
     * Requirements:
     * - `v`, `r` and `s` must be a EIP712 signature from `to` as defined by ERC1238Approval to
     * approve the batch minting transaction.
     *
     * Emits a {MintBatch} event.
     */
    function _mintBatchToEOA(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        uint8 v,
        bytes32 r,
        bytes32 s,
        bytes memory data
    ) internal virtual {
        bytes32 messageHash = _getMintBatchApprovalMessageHash(
            to,
            ids,
            amounts
        );
        _verifyMintingApproval(to, messageHash, v, r, s);

        _mintBatch(to, ids, amounts, data);
    }

    /**
     * @dev Mints a bundle, which can be viewed as minting several batches
     * to an array of addresses in one transaction.
     *
     * Requirements:
     * - `to` can be a combination of smart contract addresses and EOAs.
     * - If `to` is not a contract, an EIP712 signature from `to` as defined by ERC1238Approval
     * must be passed at the right index in `data`.
     *
     * Emits multiple {MintBatch} events.
     */
    function _mintBundle(
        address[] memory to,
        uint256[][] memory ids,
        uint256[][] memory amounts,
        bytes[] memory data
    ) internal virtual {
        for (uint256 i = 0; i < to.length; i++) {
            if (to[i].isContract()) {
                _mintBatchToContract(to[i], ids[i], amounts[i], data[i]);
            } else {
                (bytes32 r, bytes32 s, uint8 v) = splitSignature(data[i]);
                _mintBatchToEOA(to[i], ids[i], amounts[i], v, r, s, data[i]);
            }
        }
    }

    /**
     * @dev Creates `amount` tokens of token type `id`, and assigns them to `to`.
     *
     * Emits a {MintSingle} event.
     *
     * Requirements:
     *
     * - If `to` refers to a smart contract, it must implement {IERC1238Receiver-onERC1238Mint} and return the
     * acceptance magic value.
     *
     * Emits a {MintSingle} event.
     */
    function _mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) private {
        address minter = msg.sender;

        _beforeMint(minter, to, id, amount, data);

        _balances[id][to] += amount;

        emit MintSingle(minter, to, id, amount);
    }

    /**
     * @dev [Batched] version of {_mint}.
     *
     * Requirements:
     *
     * - `ids` and `amounts` must have the same length.
     *
     * Emits a {MintBatch} event.
     */
    function _mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) private {
        require(
            ids.length == amounts.length,
            "ERC1238: ids and amounts length mismatch"
        );

        address minter = msg.sender;

        for (uint256 i = 0; i < ids.length; i++) {
            _beforeMint(minter, to, ids[i], amounts[i], data);

            _balances[ids[i]][to] += amounts[i];
        }

        emit MintBatch(minter, to, ids, amounts);
    }

    /**
     * @dev Destroys `amount` tokens of token type `id` from `from`
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `from` must have at least `amount` tokens of token type `id`.
     *
     * Emits a {BurnSingle} event.
     */
    function _burn(
        address from,
        uint256 id,
        uint256 amount
    ) internal virtual {
        require(from != address(0), "ERC1238: burn from the zero address");

        address burner = msg.sender;

        _beforeBurn(burner, from, id, amount);

        uint256 fromBalance = _balances[id][from];
        require(fromBalance >= amount, "ERC1238: burn amount exceeds balance");
        unchecked {
            _balances[id][from] = fromBalance - amount;
        }

        emit BurnSingle(burner, from, id, amount);
    }

    /**
     * @dev [Batched] version of {_burn}.
     *
     * Requirements:
     *
     * - `ids` and `amounts` must have the same length.
     *
     * Emits a {BurnBatch} event.
     */
    function _burnBatch(
        address from,
        uint256[] memory ids,
        uint256[] memory amounts
    ) internal virtual {
        require(from != address(0), "ERC1238: burn from the zero address");
        require(
            ids.length == amounts.length,
            "ERC1238: ids and amounts length mismatch"
        );

        address burner = msg.sender;

        for (uint256 i = 0; i < ids.length; i++) {
            uint256 id = ids[i];
            uint256 amount = amounts[i];

            _beforeBurn(burner, from, id, amount);

            uint256 fromBalance = _balances[id][from];
            require(
                fromBalance >= amount,
                "ERC1238: burn amount exceeds balance"
            );
            unchecked {
                _balances[id][from] = fromBalance - amount;
            }
        }

        emit BurnBatch(burner, from, ids, amounts);
    }

    /**
     * @dev Hook that is called before an `amount` of tokens are minted.
     *
     * Calling conditions:
     * - `minter` and `to` cannot be the zero address
     *
     */
    function _beforeMint(
        address minter,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) internal virtual {}

    /**
     * @dev Hook that is called before an `amount` of tokens are burned.
     *
     * Calling conditions:
     * - `minter` and `to` cannot be the zero address
     *
     */
    function _beforeBurn(
        address burner,
        address from,
        uint256 id,
        uint256 amount
    ) internal virtual {}

    function _doSafeMintAcceptanceCheck(
        address minter,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) private {
        try
            IERC1238Receiver(to).onERC1238Mint(minter, id, amount, data)
        returns (bytes4 response) {
            if (response != IERC1238Receiver.onERC1238Mint.selector) {
                revert("ERC1238: ERC1238Receiver rejected tokens");
            }
        } catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("ERC1238: transfer to non ERC1238Receiver implementer");
        }
    }

    function _doSafeBatchMintAcceptanceCheck(
        address minter,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) private {
        try
            IERC1238Receiver(to).onERC1238BatchMint(minter, ids, amounts, data)
        returns (bytes4 response) {
            if (response != IERC1238Receiver.onERC1238BatchMint.selector) {
                revert("ERC1238: ERC1238Receiver rejected tokens");
            }
        } catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("ERC1238: transfer to non ERC1238Receiver implementer");
        }
    }

    // Could have that in a library instead of redeploying it every time?
    function _asSingletonArray(uint256 element)
        private
        pure
        returns (uint256[] memory)
    {
        uint256[] memory array = new uint256[](1);
        array[0] = element;

        return array;
    }

    function splitSignature(bytes memory sig)
        public
        pure
        returns (
            bytes32 r,
            bytes32 s,
            uint8 v
        )
    {
        require(sig.length == 65, "invalid signature length");

        assembly {
            /*
            First 32 bytes stores the length of the signature

            add(sig, 32) = pointer of sig + 32
            effectively, skips first 32 bytes of signature

            mload(p) loads next 32 bytes starting at the memory address p into memory
            */

            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        // implicitly return (r, s, v)
    }
}
