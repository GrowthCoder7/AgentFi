import time
from web3 import Web3
from eth_account import Account

# --- CONFIGURATION ---
RPC_URL = "http://127.0.0.1:8545"

# 1. The Agent Wallet Address (From your deployment)
AGENT_WALLET_ADDRESS = "0x49679Df02cBB98b2EC3fbb005Bbdbe15e9AbDBe1"

# 2. The Bot's Private Key (The "Accountant")
# This is the Anvil account ending in ...690d
BOT_PRIVATE_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"

# 3. Minimal ABI (Interface) for the Agent Wallet
# We only need to know about the 'execute' function and 'state'
AGENT_ABI = [
    {
        "inputs": [
            {"internalType": "address", "name": "to", "type": "address"},
            {"internalType": "uint256", "name": "value", "type": "uint256"},
            {"internalType": "bytes", "name": "data", "type": "bytes"},
            {"internalType": "uint8", "name": "operation", "type": "uint8"}
        ],
        "name": "execute",
        "outputs": [{"internalType": "bytes", "name": "result", "type": "bytes"}],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "state",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
]

def run_ai_bot():
    # 1. Connect to Blockchain
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    if not w3.is_connected():
        print("❌ Failed to connect to Anvil")
        return
    print(f"✅ Connected to Anvil at {RPC_URL}")

    # 2. Setup Accounts
    bot_account = Account.from_key(BOT_PRIVATE_KEY)
    agent_contract = w3.eth.contract(address=Web3.to_checksum_address(AGENT_WALLET_ADDRESS), abi=AGENT_ABI)

    print(f"🤖 Bot Address: {bot_account.address}")
    print(f"🏦 Agent Wallet: {AGENT_WALLET_ADDRESS}")

    # 3. Check Balance Before
    balance_before = w3.eth.get_balance(AGENT_WALLET_ADDRESS)
    print(f"💰 Agent Balance: {w3.from_wei(balance_before, 'ether')} ETH")

    # 4. SIMULATE AI DECISION
    print("\n🧠 AI is analyzing the market...")
    time.sleep(2)
    print("🚀 Opportunity detected! Executing trade...")

    # 5. Build the Transaction
    # We want the AGENT to send 0.05 ETH to a random address
    target_address = "0x1234567890123456789012345678901234567890"
    amount_to_send = w3.to_wei(0.05, 'ether')

    # This is the function call payload
    # execute(target, value, data, operation)
    tx_data = agent_contract.functions.execute(
        Web3.to_checksum_address(target_address),
        amount_to_send,
        b'', # No data (just sending ETH)
        0    # Operation 0 = Call
    ).build_transaction({
        'chainId': 31337, # Anvil Chain ID
        'gas': 200000,
        'gasPrice': w3.to_wei('1', 'gwei'),
        'nonce': w3.eth.get_transaction_count(bot_account.address),
    })

    # 6. Sign & Send Transaction (Signed by BOT, Executed by AGENT)
    signed_tx = w3.eth.account.sign_transaction(tx_data, private_key=BOT_PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

    print(f"📡 Transaction Sent! Hash: {tx_hash.hex()}")
    
    # 7. Wait for Receipt
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    if receipt.status == 1:
        print("✅ Trade Successful!")
        balance_after = w3.eth.get_balance(AGENT_WALLET_ADDRESS)
        print(f"💰 New Agent Balance: {w3.from_wei(balance_after, 'ether')} ETH")
    else:
        print("❌ Trade Failed!")

if __name__ == "__main__":
    run_ai_bot()