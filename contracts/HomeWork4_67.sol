// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.19;

contract HomeWork4 {

    struct Payment{
        uint256 value;
        address target;
    }

    uint256 public persent;
    address public owner;

    mapping(address => Payment) payments;

    event AddPayment(uint256 value, address sender, address target);
    event GetPayment(uint256 value, address sender, address target);

    constructor(address _target, uint256 _persent) payable {
        owner = msg.sender;
        payments[msg.sender] = Payment(msg.value, _target);
        persent = _persent;
    }

    function addPayment(address target) public payable {
        // console.log("Contract: addPayment, msg.sender: ", msg.sender);
        require(payments[msg.sender].value == 0, "You've already made a payment");
        uint256 commission = msg.value * persent / 100;
        payments[msg.sender] = Payment(msg.value - commission, target);
        payments[owner].value += commission;
        emit AddPayment(msg.value - commission, msg.sender, target);
    }

    function sendPayment(address sender) public returns(bool) {
        // console.log("Contract: sendPayment, msg.sender: ", msg.sender);
        Payment memory payment = payments[sender];
        require(payment.target == msg.sender, "There are no payments for you");
        bool successful = payable(payment.target).send(payment.value);
        delete payments[sender];
        emit GetPayment(payment.value, sender, payment.target);
        return successful;
    }

    function getPayment(address sender) public view returns(Payment memory){
        return payments[sender];
    }
}