import {ethers} from "ethers";
import {crcToTc} from "@circles/timecircles";

const account = process.env.ACCOUNT_TO_MONITOR;
const webhook = process.env.WEBHOOK_URL;
const jsonRpcUrl = process.env.RPC_URL;

const hubAddress = '0x29b9a7fbb8995b2423a71cc17cf9810798f6c543';
const provider = new ethers.JsonRpcProvider(jsonRpcUrl);
const hubAbi = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "HubTransfer",
        "type": "event"
    }
];

const hubContract = new ethers.Contract(hubAddress, hubAbi, provider);

hubContract.on('HubTransfer', async (from, to, amount) => {
    if (to.toLowerCase() !== account.toLowerCase()) {
        return;
    }

    console.log(`Transfer of ${amount} from ${from} to ${to}`);

    const crcAmount = Number(ethers.formatEther(amount.toString()));
    const tcAmount = crcToTc(Date.now(), crcAmount);

    await fetch(webhook, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "text": `<https://circles.garden/profile/${from}|${from}> sent a payment of ${tcAmount} Circles.`
        })
    });
});
