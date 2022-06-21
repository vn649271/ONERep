// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ERC1238/extensions/ERC1238URIStorage.sol";
import "./utils/AddressMinimal.sol";

contract ONERep is ERC1238, ERC1238URIStorage {
    using Address for address;
    mapping(address => bool) public owners;
    string private _symbol;

    constructor(address owner_, string memory symbol_, string memory baseURI_) ERC1238(baseURI_) {
        owners[owner_] = true;
        require(!_compareStrings(symbol_, "") , "Invalid symbol");
        _symbol = symbol_;
    }

    modifier onlyOwner() {
        require(owners[msg.sender], "Unauthorized: sender is not the owner");
        _;
    }

    function addOwner(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Invalid address for new owner");
        owners[newOwner] = true;
    }

    function removeOwner(address _owner) public onlyOwner {
        require(_owner != address(0), "Invalid address for owner");
        owners[_owner] = false;
    }
    /**
     * @dev Returns the name of the token.
     */
    function name() public view virtual returns (string memory) {
        return "ONE Rep Badge Token";
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }

    function _compareStrings(string memory a, string memory b) public view returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }

    function setBaseURI(string memory newBaseURI) external onlyOwner {
        _setBaseURI(newBaseURI);
    }
    
    function mintToEOA(
        address to,
        uint256 amount,
        uint8 v,
        bytes32 r,
        bytes32 s,
        string memory uri,
        bytes memory data
    ) external onlyOwner {
        _mintToEOA(to, 1, amount, v, r, s, data);
        _setTokenURI(1, uri);
    }

    function mintToContract(
        address to,
        uint256 amount,
        string memory uri,
        bytes memory data
    ) external onlyOwner {
        _mintToContract(to, 1, amount, data);
        _setTokenURI(1, uri);
    }

    function mintToContract(
        address to,
        uint256 id,
        uint256 amount,
        string memory uri,
        bytes memory data
    ) external onlyOwner {
        _mintToContract(to, id, amount, data);
        _setTokenURI(id, uri);
    }

    function mintBundle(
        address[] memory to,
        uint256[][] memory ids,
        uint256[][] memory amounts,
        string[][] memory uris,
        bytes[] memory data
    ) external onlyOwner {
        for (uint256 i = 0; i < to.length; i++) {
            _setBatchTokenURI(ids[i], uris[i]);

            if (to[i].isContract()) {
                _mintBatchToContract(to[i], ids[i], amounts[i], data[i]);
            } else {
                (bytes32 r, bytes32 s, uint8 v) = splitSignature(data[i]);
                _mintBatchToEOA(to[i], ids[i], amounts[i], v, r, s, data[i]);
            }
        }
    }

    function burn(
        address from,
        uint256 id,
        uint256 amount,
        bool deleteURI
    ) external onlyOwner {
        if (deleteURI) {
            _burnAndDeleteURI(from, id, amount);
        } else {
            _burn(from, id, amount);
        }
    }

    function burnBatch(
        address from,
        uint256[] memory ids,
        uint256[] memory amounts,
        bool deleteURI
    ) external onlyOwner {
        if (deleteURI) {
            _burnBatchAndDeleteURIs(from, ids, amounts);
        } else {
            _burnBatch(from, ids, amounts);
        }
    }

    /**
     * @dev Destroys `amount` of tokens with id `id` owned by `from` and deletes the associated URI.
     *
     * Requirements:
     *  - A token URI must be set.
     *  - All tokens of this type must have been burned.
     */
    function _burnAndDeleteURI(
        address from,
        uint256 id,
        uint256 amount
    ) internal virtual {
        super._burn(from, id, amount);

        _deleteTokenURI(id);
    }

    /**
     * @dev [Batched] version of {_burnAndDeleteURI}.
     *
     * Requirements:
     *
     * - `ids` and `amounts` must have the same length.
     * - For each id the balance of `from` must be at least the amount wished to be burnt.
     *
     * Emits a {BurnBatch} event.
     */
    function _burnBatchAndDeleteURIs(
        address from,
        uint256[] memory ids,
        uint256[] memory amounts
    ) internal virtual {
        require(from != address(0), "ERC1238: burn from the zero address");
        require(ids.length == amounts.length, "ERC1238: ids and amounts length mismatch");

        address burner = msg.sender;

        for (uint256 i = 0; i < ids.length; i++) {
            uint256 id = ids[i];
            uint256 amount = amounts[i];

            _beforeBurn(burner, from, id, amount);

            uint256 fromBalance = _balances[id][from];
            require(fromBalance >= amount, "ERC1238: burn amount exceeds balance");
            unchecked {
                _balances[id][from] = fromBalance - amount;
            }

            _deleteTokenURI(id);
        }

        emit BurnBatch(burner, from, ids, amounts);
    }
}
