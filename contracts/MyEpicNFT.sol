// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

// We first import some OpenZeppelin Contracts.
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

import  { Base64 } from "./libraries/StringUtils.sol";

// We inherit the contract we imported. This means we'll have access
// to the inherited contract's methods.
contract MyEpicNFT is ERC721URIStorage {

  event NewEpicNFTMinted(address sender, uint256 tokenId);


  string[] firstWords = [ "apple", "google", "microsoft", "amazon", "uber", "meta", "cardiweb", "ibm", "eurobat", "arago" ];
  string[] secondWords = [ "screen", "cpu", "hard-drive", "memory", "keyboard", "mouse", "touchpad", "turbo", "ssd", "vga", "hercules" ];
  string[] thirdWords = [ "centronic", "serial", "usb", "pci", "isa", "rs232", "dma", "agp", "sata", "sas" ];


  string svgBefore = "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 350 350'><style>.base { fill: green; font-family: serif; font-size: 14px; }</style><rect width='100%' height='100%' fill='lightgreen' />";
  string text1Before = "<text x='25%' y='25%'";
  string text2Before = "</text><text x='50%' y='50%'";
  string text3Before = "</text><text x='75%' y='75%'";
  string textBefore = " class='base' dominant-baseline='middle' text-anchor='middle'>";
  //string textAfter = "</text>";
  //string svgAfter="</svg>";

  // Magic given to us by OpenZeppelin to help us keep track of tokenIds.
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  // We need to pass the name of our NFTs token and it's symbol.
  constructor() ERC721 ("MbaNFT v3", "MBA") {
    console.log("Contract created");
  }

   function pickRandomFirstWord(uint256 tokenId) public view returns (string memory) {
    uint256 rand = random(string(abi.encodePacked("FIRST_WORD", Strings.toString(tokenId))));
    rand = rand % firstWords.length;
    return firstWords[rand];
  }

  function pickRandomSecondWord(uint256 tokenId) public view returns (string memory) {
    uint256 rand = random(string(abi.encodePacked("SECOND_WORD", Strings.toString(tokenId))));
    rand = rand % secondWords.length;
    return secondWords[rand];
  }

  function pickRandomThirdWord(uint256 tokenId) public view returns (string memory) {
    uint256 rand = random(string(abi.encodePacked("THIRD_WORD", Strings.toString(tokenId))));
    rand = rand % thirdWords.length;
    return thirdWords[rand];
  }

  function random(string memory input) internal pure returns (uint256) {
      return uint256(keccak256(abi.encodePacked(input)));
  }

  // A function our user will hit to get their NFT.
  function makeAnEpicNFT() public {
     // Get the current tokenId, this starts at 0.
    uint256 newItemId = _tokenIds.current();

     // Actually mint the NFT to the sender using msg.sender.
    _safeMint(msg.sender, newItemId);


    string memory first = pickRandomFirstWord(newItemId);
    string memory second = pickRandomSecondWord(newItemId);
    string memory third = pickRandomThirdWord(newItemId);
    string memory name = string(abi.encodePacked(first, second, third));
    string memory finalSvg = string(abi.encodePacked(
        svgBefore, 
        text1Before, textBefore, first, //textAfter, 
        text2Before, textBefore, second, //textAfter, 
        text3Before, textBefore, third, //textAfter, 
        "</text></svg>" //svgAfter
    ));

    string memory json = Base64.encode(
        bytes(
            string(
                abi.encodePacked(
                    '{"name": "',
                    // We set the title of our NFT as the generated word.
                    name,
                    '", "description": "Mike\'s third nft.", "image": "data:image/svg+xml;base64,',
                    // We add data:image/svg+xml;base64 and then append our base64 encode our svg.
                    Base64.encode(bytes(finalSvg)),
                    '"}'
                )
            )
        )
    );

    // Just like before, we prepend data:application/json;base64, to our data.
    string memory finalTokenUri = string(
        abi.encodePacked("data:application/json;base64,", json)
    );

    console.log("\n--------------------");
    console.log(finalTokenUri);
    console.log("--------------------\n");


    // Set the NFTs data.
    _setTokenURI(newItemId, finalTokenUri);

    emit NewEpicNFTMinted(msg.sender, newItemId);

    // Increment the counter for when the next NFT is minted.
    _tokenIds.increment();

    console.log("An NFT w/ ID %s has been minted to %s", newItemId, msg.sender);
  }
}