import os
import time
import requests
import ollama
import pandas as pd
import pandas_ta as ta
from web3 import Web3
from eth_account import Account
from dotenv import load_dotenv

# --- CONFIGURATION ---
load_dotenv()
RPC_URL = os.getenv("RPC_URL")
AGENT_WALLET = os.getenv("AGENT_WALLET_ADDRESS")
BOT_KEY = os.getenv("BOT_PRIVATE_KEY")
MODEL_NAME = "llama3.2" # or "llama3"

# We will monitor these 3 assets
COINS = ['ethereum', 'bitcoin', 'solana']

# ABI for the Agent Wallet
AGENT_ABI = [
    {"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"},{"internalType":"uint8","name":"operation","type":"uint8"}],"name":"execute","outputs":[{"internalType":"bytes","name":"result","type":"bytes"}],"stateMutability":"payable","type":"function"}
]

class MarketAnalyzer:
    def get_market_data(self, coin_id):
        """ Fetches last 100 days of price data for technical analysis """
        try:
            url = f"https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart?vs_currency=usd&days=100&interval=daily"
            response = requests.get(url)
            data = response.json()
            
            prices = [x[1] for x in data['prices']]
            df = pd.DataFrame(prices, columns=['close'])
            return df
        except Exception as e:
            print(f"⚠️ Error fetching {coin_id}: {e}")
            return pd.DataFrame()

    def analyze(self, coin_id):
        """ Calculates RSI and SMA """
        df = self.get_market_data(coin_id)
        if df.empty: return None

        # Calculate Indicators using pandas_ta
        # RSI < 30 = Oversold (Buy signal?)
        # RSI > 70 = Overbought (Sell signal?)
        df['RSI'] = ta.rsi(df['close'], length=14)
        df['SMA_20'] = ta.sma(df['close'], length=20)
        
        current = df.iloc[-1]
        return {
            "coin": coin_id,
            "price": round(current['close'], 2),
            "rsi": round(current['RSI'], 2),
            "sma_20": round(current['SMA_20'], 2),
            "trend": "BULLISH" if current['close'] > current['SMA_20'] else "BEARISH"
        }

def ask_hedge_fund_manager(analysis_list):
    """ Feeds the technical data to the AI for a strategic decision """
    
    # Format the data into a readable report for the AI
    report = "\n".join([str(a) for a in analysis_list])
    
    print("\n📊 MARKET REPORT SENT TO AI:")
    print(report)

    prompt = f"""
    You are a high-frequency trading AI managing a crypto portfolio.
    Here is the current market analysis based on technical indicators:
    
    {report}
    
    TRADING RULES:
    1. RSI < 35 is a potential BUY (Oversold).
    2. RSI > 70 is a potential SELL (Overbought).
    3. Prefer coins that are in a BULLISH trend (Price > SMA_20).
    
    DECISION:
    Which ONE asset should we buy right now? 
    If all look bad or risky, choose "WAIT".
    
    Reply ONLY with the name of the coin (e.g., "ethereum") or "WAIT".
    """

    try:
        response = ollama.chat(model=MODEL_NAME, messages=[
            {'role': 'user', 'content': prompt},
        ])
        return response['message']['content'].strip().lower()
    except Exception as e:
        print(f"❌ AI Error: {e}")
        return "wait"

def execute_trade(coin_name, w3, contract, bot_account):
    """ Executes the trade on-chain if the AI picks a coin """
    print(f"\n🚀 AI DECIDED TO BUY: {coin_name.upper()}")
    
    # In a real app, you would swap ETH for that token.
    # For this demo, we simulate the "Buy" by sending a transaction
    # representing the intent.
    
    target = "0x1234567890123456789012345678901234567890" # Mock Swap Router
    value = w3.to_wei(0.01, 'ether') # Trading 0.01 ETH

    try:
        tx = contract.functions.execute(
            Web3.to_checksum_address(target),
            value,
            b'',
            0
        ).build_transaction({
            'chainId': 31337,
            'gas': 300000,
            'gasPrice': w3.to_wei('1', 'gwei'),
            'nonce': w3.eth.get_transaction_count(bot_account.address)
        })

        signed = w3.eth.account.sign_transaction(tx, private_key=BOT_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
        print(f"✅ Trade Executed on-chain! Hash: {tx_hash.hex()}")
    except Exception as e:
        print(f"❌ Trade Failed: {e}")

def run_complex_agent():
    print(f"\n--- 🧠 QUANT AGENT INITIALIZED ({MODEL_NAME}) ---")
    
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    if not w3.is_connected():
        print("❌ RPC Connection Error")
        return

    analyzer = MarketAnalyzer()
    market_snapshot = []

    # 1. Gather Intelligence
    print("Satellite scanning markets...")
    for coin in COINS:
        data = analyzer.analyze(coin)
        if data:
            market_snapshot.append(data)
            print(f"   -> {coin.upper()}: ${data['price']} | RSI: {data['rsi']} | Trend: {data['trend']}")

    # 2. Strategic Council (AI Decision)
    print("\nThinking...")
    decision = ask_hedge_fund_manager(market_snapshot)
    print(f"🤖 AI Verdict: {decision.upper()}")

    # 3. Execution
    if "wait" in decision or "none" in decision:
        print("✋ Market conditions unfavorable. Holding cash.")
    else:
        # Check if the AI picked a valid coin from our list
        found_coin = next((c for c in COINS if c in decision), None)
        if found_coin:
            bot = Account.from_key(BOT_KEY)
            contract = w3.eth.contract(address=AGENT_WALLET, abi=AGENT_ABI)
            execute_trade(found_coin, w3, contract, bot)
        else:
            print("⚠️ AI hallucinated a coin we don't track. Safety stop.")

if __name__ == "__main__":
    run_complex_agent()