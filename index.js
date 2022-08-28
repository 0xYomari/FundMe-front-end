import { ContractFactory, ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const balanceButton = document.getElementById("balanceButton")
const fundButton = document.getElementById("fundButton")
const withdrawButton = document.getElementById("withdrawButton")
const balanceAmount = document.getElementById("balance")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
    if (typeof window.etherum !== undefined) {
        try {
            await window.ethereum.request({
                method: "eth_requestAccounts",
            })
        } catch (error) {
            console.log(error)
        }
        connectButton.textContent = "Connected"
    } else {
        connectButton.textContent = "Please install Metamask"
    }
}

async function getBalance() {
    if (typeof window.ethereum != undefined) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
        balanceAmount.textContent = `${ethers.utils.formatEther(balance)} ETH`
    }
}
async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    // console.log(`Funding with ${ethAmount}`)
    //provider / connection to the blockchain
    //signer/ wallet / someone with some gas
    // contract that we are interacting with
    // ^ABI & Address
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
        const transactionResponse = await contract.fund({
            value: ethers.utils.parseEther(ethAmount),
        })
        await listenForTransactionMine(transactionResponse, provider)
        console.log("Done!")
        getBalance()
    } catch (error) {
        console.log(error)
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}.....`)
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (TransactionReceipt) => {
            console.log(
                `Completed with ${TransactionReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
}

async function withdraw() {
    if (typeof window.ethereum != undefined) {
        console.log("Withdrawing......")
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done!")
            getBalance()
        } catch (error) {
            console.log(error)
        }
    }
}
