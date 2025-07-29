// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

contract Vault {
    uint256 private salt;
    uint256 private hiddenPassword = 123_456_789;

    error IncorrectPassword();

    constructor(uint256 initialSeed) payable {
        salt = block.timestamp;
        hiddenPassword |= initialSeed;
    }

    function updateHiddenPassword(uint256 newSeed) external {
        hiddenPassword |= newSeed;
    }

    function claim(uint256 password) external {
        if (
            password
                != uint256(keccak256(abi.encode(hiddenPassword + salt)))
        ) {
            revert IncorrectPassword();
        }
        (bool success,) = msg.sender.call{value: address(this).balance}("");
        if (!success) {
            revert();
        }
    }

    receive() external payable {}
} 