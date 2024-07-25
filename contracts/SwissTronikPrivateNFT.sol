// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract SwissTronikPrivateNFT is ERC721 {
    uint256 private _currentTokenId = 0;
    address private owner;

    event NFTMinted(address recipient, uint256 tokenId);
    event NFTBurned(uint256 tokenId);

    constructor() ERC721("SMDNFT", "SMDNFT") {
        owner = msg.sender;
    }
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;

    }

    function mintNFT(address recipient) public returns (uint256) {
        _currentTokenId += 1;
        uint256 newItemId = _currentTokenId;
        _mint(recipient, newItemId);
        
        emit NFTMinted(recipient, newItemId);  

        return newItemId;
    }

    function burnNFT(uint256 tokenId) public onlyOwner {
        _burn(tokenId);
        emit NFTBurned(tokenId);
    }
}