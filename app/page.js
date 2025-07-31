"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from '../contractJson/Chai.json';

export default function Home() {
  const [state, setState] = useState({
    provider: null,
    signer: null,
    contract: null
  });
  const [account, setAccount] = useState('Not Connected');
  const [memos, setMemos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const connectWallet = async () => {
      const contractAddress = "0xd4c594E6203Fa5FeB61B3Fd66701eE42d842c84B";
      const contractAbi = abi.abi;

      try {
        if (typeof window.ethereum !== "undefined") {
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

          window.ethereum.on("accountsChanged", () => {
            window.location.reload();
          });

          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(contractAddress, contractAbi, signer);
          
          setAccount(accounts[0]);
          setState({ provider, signer, contract });

        } else {
          console.log("Please install MetaMask.");
          alert("Please install MetaMask to use this dApp.");
        }
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    };
    connectWallet();
  }, []);

  useEffect(() => {
    const fetchMemos = async () => {
      if (state.contract) {
        try {
          const fetchedMemos = await state.contract.getMemos();
          setMemos(fetchedMemos);
        } catch (error) {
          console.error("Error fetching memos:", error);
        }
      }
    };
    fetchMemos();
  }, [state.contract]);

  const handleBuyChai = async (event) => {
    event.preventDefault();
    const { contract } = state;
    const name = event.target.name.value;
    const message = event.target.message.value;

    if (!name.trim() || !message.trim()) {
      alert("Please enter both a name and a message.");
      return;
    }

    setIsLoading(true);
    try {
      const amount = { value: ethers.parseEther("0.001") };
      const transaction = await contract.buyChai(name, message, amount);
      await transaction.wait();

      console.log("Transaction is successful");
      event.target.reset(); 
      const updatedMemos = await state.contract.getMemos();
      setMemos(updatedMemos);

    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Transaction failed! Check the console for more details.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (addr) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 font-sans">
      <header className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-orange-500">
            Buy Me a Chai ☕
          </h1>
          <div className="text-right">
            {account !== 'Not Connected' ? (
              <span className="text-sm sm:text-base font-mono bg-stone-200 text-stone-700 rounded-full px-4 py-2">
                {formatAddress(account)}
              </span>
            ) : (
               <span className="text-sm sm:text-base font-mono bg-red-200 text-red-700 rounded-full px-4 py-2">
                Not Connected
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 sticky top-28">
              <h2 className="text-2xl font-semibold mb-6 text-center">Send a Chai</h2>
              <form onSubmit={handleBuyChai} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-stone-600 mb-1">Your Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                    placeholder="Satoshi"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-stone-600 mb-1">Your Message</label>
                  <textarea 
                    id="message" 
                    rows="4"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                    placeholder="Thanks for the great work!"
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  className="w-full font-bold text-white bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 rounded-full py-3 px-6 text-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center"
                  disabled={!state.contract || isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Send 1 Chai (0.001 ETH)"
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-6 text-center lg:text-left">Memos from Supporters</h2>
            <div className="space-y-4">
              {memos.length > 0 ? (
                [...memos].reverse().map((memo, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-md p-5 border-l-4 border-amber-500 transition-transform hover:scale-[1.02]">
                    <p className="text-lg font-semibold text-stone-800 mb-2">&quot;{memo.message}&quot;</p>
                    <div className="text-sm text-stone-500 flex flex-wrap items-center justify-between gap-2">
                      <span>From: <strong className="text-stone-700">{memo.name}</strong></span>
                      <span className="font-mono text-xs break-all">
                        {formatAddress(memo.from)}
                      </span>
                      <span className="whitespace-nowrap">
                        {new Date(Number(memo.timestamp) * 1000).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-white rounded-xl shadow-md">
                  <p className="text-stone-500">No memos yet. Be the first to send a chai!</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
