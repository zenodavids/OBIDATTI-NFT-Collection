// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


contract ObiDatti is ERC721Enumerable, Ownable {
    using Strings for uint256;
    /**
    * @dev _baseTokenURI for computing {tokenURI}. If set, the resulting URI for each
    * token will be the concatenation of the `baseURI` and the `tokenId`.
    */
    string _baseTokenURI;

    // The upper limit of NFTs that you can mint at once.
    uint public MAX_PER_MINT = 20;

    //  _price is the price of one ObiDatti NFT
    uint256 public _price = 113.015 ether;
    // max number of ObiDatti
    uint256 public maxTokenIds = 50;
    // total number of tokenIds minted
    uint256 public tokenIds;
    // _paused is used to pause the contract in case of an emergency
    bool public _paused;

        /**
    * @dev setPaused makes the contract paused or unpaused
        */
    modifier onlyWhenNotPaused {
        require(!_paused, "Contract currently paused");
        _;
    }

    /**
        * @dev ERC721 constructor takes in a `name` and a `symbol` to the token collection.
        * name in our case is `ObiDatti` and symbol is `gt`.
        * Constructor for LW3P takes in the baseURI to set _baseTokenURI for the collection.
        */
    constructor (string memory baseURI) ERC721("ObiDatti", "OBDI") {
        _baseTokenURI = baseURI;
    }
    // only owner can set the baseUrl
    function setBaseURI(string memory baseURI) public onlyOwner {
        _baseTokenURI = baseURI;
    }
    // only owner can set the price of one ObiDatti NFT
    function setPRICE(uint256 price) public onlyOwner {
        _price = price;
    }
    // only owner can set the max number of ObiDatti an address can mint
    function setMAXTOKENID(uint256 _maxTokenIds) public onlyOwner {
        maxTokenIds = _maxTokenIds;
    }

    // only owner can set The upper limit of NFTs that you can mint at once.
    function setMAX_PER_MINT(uint256 _MAX_PER_MINT) public onlyOwner {
        MAX_PER_MINT = _MAX_PER_MINT;
    }

    // only owner can pause the contract at will
    function setPaused(bool paused) public onlyOwner {
        _paused = paused;
    }

    /**
    * @dev mint allows an user to mint 1 NFT per transaction.
    */
    function mint() public payable onlyWhenNotPaused {

        require(tokenIds < maxTokenIds, "Exceed maximum ObiDatti NFTs supply");
        require(msg.value >= _price, "Ether sent is not correct");
        tokenIds += 1;
        _safeMint(msg.sender, tokenIds);

        //////////////////////////////////////


    }

    /**
    * @dev _baseURI overides the Openzeppelin's ERC721 implementation which by default
    * returned an empty string for the baseURI
    */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    /**
    * @dev tokenURI overides the Openzeppelin's ERC721 implementation for tokenURI function
    * This function returns the URI from where we can extract the metadata for a given tokenId
    */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory baseURI = _baseURI();
        // Here it checks if the length of the baseURI is greater than 0, if it is return the baseURI and attach
        // the tokenId and `.json` to it so that it knows the location of the metadata json file for a given
        // tokenId stored on IPFS
        // If baseURI is empty return an empty string
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json")) : "";
    }

    // know which NFTs from your collection each user holds
    function tokensOfOwner(address _owner) external view returns (uint[] memory) {

        uint tokenCount = balanceOf(_owner);
        uint[] memory tokensId = new uint256[](tokenCount);

        for (uint i = 0; i < tokenCount; i++) {
            tokensId[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokensId;
    }



    // recieve money from the buyer
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

   /**
    * @dev withdraw sends all the ether in the contract
    * to the owner of the contract
        */

 function withdraw(address payable _input_labourParty_Address) public onlyOwner  {
    // This will send 70% of the sale to Labour Party.
    (bool artistShare, ) = payable(_input_labourParty_Address).call{value: (address(this).balance * 70/100)}("");
    require(artistShare, "Failed to send to Labour Party");
    // =============================================================================
    // the rest (30%) goes to the artists
        address _owner = owner();
        uint amount = address(this).balance;
        (bool sent, ) =  _owner.call{value: amount}("");
        require(sent, "Failed to send to artists");
    }



    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}

    ///////////////////////////////////////////////////////////////////////////////////


}