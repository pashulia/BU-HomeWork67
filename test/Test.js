const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { PANIC_CODES } = require("@nomicfoundation/hardhat-chai-matchers/panic")
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect, use } = require("chai");
const { ethers } = require("hardhat");

describe("homeWork4", function () {
    async function deploy() {
        const [owner1, owner2, user1, user2, otherAccount] = await ethers.getSigners();
        const persent = 5;
        const payment = { value: 0, target: owner2.address };
        const eth = ethers.utils.parseUnits("1.0", "ether");
        const HomeWork4 = await ethers.getContractFactory("HomeWork4");
        const homeWork4 = await HomeWork4.deploy(payment, persent);
        await homeWork4.deployed();
        return { homeWork4, owner1, owner2, user1, user2, otherAccount, persent, payment, eth };
    }

    describe("Deployment", function () {
        it("Check persent", async () => {
            const { homeWork4, persent } = await loadFixture(deploy);
            expect(await homeWork4.persent()).to.equal(persent);
        })
        it("Check owner", async () => {
            const { homeWork4, payment: payment, owner1 } = await loadFixture(deploy);
            let returnPayment = await homeWork4.getPayment(owner1.address);
            returnPayment = { value: returnPayment.value, target: returnPayment.target }
            expect(payment).to.deep.equal(returnPayment);
        })
    });

    describe("AddPayament", function () {
        it("Check change balance", async () => {
            const { homeWork4, owner1, user1, eth } = await loadFixture(deploy);
            await expect(homeWork4.addPayment(user1.address, { value: eth }))
            .to.changeEtherBalances(
                [owner1.address, homeWork4.address],
                [eth.mul(-1), eth]
            )
        })
        it("Check change user payment", async () => {
            const { homeWork4, user1, user2, eth, persent } = await loadFixture(deploy);
            const tx = await homeWork4.connect(user1).addPayment(user2.address, { value: eth });
            await tx.wait();
            const tmp = eth.mul(persent);
            const commission = (tmp.sub(eth.mod(100))).div(100); 
            let payment = await homeWork4.getPayment(user1.address);
            expectPayment = { value: eth.sub(commission), target: user2.address };
            returnPayment = { value: payment.value, target: payment.target };
            expect(expectPayment).to.deep.equal(returnPayment);     
        })
        it("Check change owner payment", async () => {
            const { homeWork4, owner1, user1, user2, eth, persent } = await loadFixture(deploy);
            let paymentBefore = await homeWork4.getPayment(owner1.address);
            const tx = await homeWork4.connect(user1).addPayment(user2.address, { value: eth });
            await tx.wait();
            const tmp = eth.mul(persent);
            const commission = (tmp.sub(eth.mod(100))).div(100); 
            let paymentAfter = await homeWork4.getPayment(owner1.address);
            expect(paymentBefore.value.add(commission)).to.deep.equal(paymentAfter.value);     
        })
    })

    describe("Check SendPayament", function () {
        describe("Require", function () {
            it("Check sendPayament", async () => {
                const { homeWork4, user1, eth } = await loadFixture(deploy);
                const tx = await homeWork4.addPayment(user1.address, { value: eth });
                await tx.wait();
                expect(expectPayment).to.deep.equal(returnPayment);
                await expect(homeWork4.addPayment(user1.address))
                .to.revertedWith("You've already made a payment");
            })
        })
        it("Check change balance", async () => {
            const { homeWork4, owner1, user1, user2, eth, persent } = await loadFixture(deploy);
            const tx = await homeWork4.connect(user1).addPayment(user2.address, { value: eth });
            await tx.wait();
            const tmp = eth.mul(persent);
            const commission = (tmp.sub(eth.mod(100))).div(100); 
            await expect(homeWork4.connect(user2).sendPayment(user1.address))
            .to.changeEtherBalances(
                [user2.address, homeWork4.address],
                [eth.sub(commission), eth.sub(commission).mul(-1)]
            )
        })
        it("Check change user payment", async () => {
            const { homeWork4, user1, user2, eth } = await loadFixture(deploy);
            let tx = await homeWork4.connect(user1).addPayment(user2.address, { value: eth });
            await tx.wait(); 
            tx = await homeWork4.connect(user2).sendPayment(user1.address);
            let payment = await homeWork4.getPayment(user1.address);
            expectPayment = { value: 0, target: 0 };
            returnPayment = { value: payment.value, target: payment.target };
            expect(expectPayment).to.deep.equal(returnPayment);     
        })
    })

    describe("SendPayament", function () {
        describe("Require", function () {
            it("Check sendPayament", async () => {
                const { homeWork4, owner1 } = await loadFixture(deploy);
                await expect(homeWork4.sendPayment(owner1.address))
                .to.revertedWith("There are no payments for you");
            })
        })
        it("Check change balance", async () => {
            const { homeWork4, user1, user2, eth, persent } = await loadFixture(deploy);
            const tx = await homeWork4.connect(user1).addPayment(user2.address, { value: eth });
            await tx.wait();
            let tmp = eth.mul(persent);
            const commission = (tmp.sub(eth.mod(100))).div(100); 
            await expect(homeWork4.connect(user2).sendPayment(user1.address))
            .to.changeEtherBalances(
                [user2.address, homeWork4.address],
                [eth.sub(commission), eth.sub(commission).mul(-1)]
            )
        })
        it("Check change user payment", async () => {
            const { homeWork4, user1, user2, eth } = await loadFixture(deploy);
            let tx = await homeWork4.connect(user1).addPayment(user2.address, { value: eth });
            await tx.wait(); 
            tx = await homeWork4.connect(user2).sendPayment(user1.address);
            let payment = await homeWork4.getPayment(user1.address);
            expectPayment = { value: 0, target: 0 };
            returnPayment = { value: payment.value, target: payment.target };
            expect(expectPayment).to.deep.equal(returnPayment);     
        })
        
        describe("Event", function () {
            it("Check GetPayment", async () => {
                const { homeWork4, owner1, user1, eth } = await loadFixture(deploy);
                let tx = await homeWork4.addPayment(user1.address, { value: eth });
                await tx.wait();
                await expect(homeWork4.connect(user1).sendPayment(owner1.address))
                .to.emit(homeWork4, "GetPayment")
                .withArgs(eth, owner1.address, user1.address)
            })
        })
    });
});
