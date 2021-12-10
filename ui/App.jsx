import * as React from "react";
import { ethers } from "ethers";
import './App.css';
import abi from '../artifacts/contracts/MyEpicNFT.sol/MyEpicNFT.json'

const contractAddress = "0x00AB871DcB34090322ef0EAEBF64450c8b713C6a"
const contractABI = abi.abi
export default function App() {

  
  const [status, setStatus] = React.useState("loading");
  const [currentAccount, setCurrentAccount] = React.useState()
  const [lastMintedURL, setLastMintedURL] = React.useState()
  
  React.useEffect(()=>{
    const { ethereum } = window;
    console.log("Status=", status)

    if (!ethereum) {
      setStatus("error")
    } else {
      if (status==="loading") {
        setStatus("checking")
      } else
      if (status=="checking") {
        ethereum.request({ method: 'eth_chainId' }).
        then(chainId=>{
          const rinkebyChainId = "0x4"; 
          if (chainId !== rinkebyChainId) {
            throw new Error("You are not connected to the Rinkeby Test Network!");
          }
          return ethereum.request({ method: 'eth_accounts' })
        }).
        then(accounts => {
          if (accounts.length !== 0) {
            const account = accounts[0];
            setCurrentAccount(account)
            setStatus("ready")
          } else {
            setStatus("no_account")
          }
        }).catch(err=>{
          console.error(err)
          setStatus("error")
        })
      } else {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(contractAddress, contractABI, signer);

        if (status==="mint") {
          nftContract.makeAnEpicNFT()
          .then(tx => {
            console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${tx.hash}`, tx);
            return tx.wait()
          }).then(()=>setStatus("ready")).catch(err=>{
            console.error(err)
            setStatus("error")
          })
        }  
      }
    }
  }, [status])
  React.useEffect(()=>{
    if (currentAccount) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const nftContract = new ethers.Contract(contractAddress, contractABI, signer);
      const listener = (from, tokenId)=>{
        setLastMintedURL(`https://testnets.opensea.io/assets/${contractAddress}/${tokenId.toNumber()}`)
      }
      nftContract.on("NewEpicNFTMinted", listener)
      return ()=>{
        nftContract.off("NewEpicNFTMinted", listener)
      }
    }
  }, [currentAccount])

  const mint = () => {
    setStatus("mint")
  }
  const retry = () => {
    setStatus("loading")
  }
  const connect = ()=>{
    const { ethereum } = window;
    const accounts = ethereum.request({ method: "eth_requestAccounts" }).then(()=>setStatus("loading"));
  }
  
  return (
    <>
      <div className="mainContainer">
        <div className="dataContainer">
          <div className="header">
            Mint Your NFT
          </div>
          <div className="info">
              <a target="_blank" href={`https://rinkeby.etherscan.io/address/${contractAddress}`}>Contract : {contractAddress}</a>
          </div>
          <div className="info">
              <a target="_blank" href="https://github.com/mbaroukh/MyNftMinter/">Sources</a>
          </div>

          <div className="info">
            Status : {status}
            {status==="no_account" && <span>
              &nbsp;<button onClick={connect}>Connect</button>
            </span>}
          </div>

          {currentAccount && status!=="error" && (
            <>
              <div className="info">
                Account : {currentAccount}
              </div>
              <button disabled={status!=="ready"} className="waveButton" onClick={mint}>
                Mint !
              </button>
            </>
          )}

          {status==="error" && <button className="waveButton" onClick={retry}>
              RETRY
          </button>}
        </div>
      </div>
      {status!=="ready" && status!=="error" && status!=="no_account" &&
        <div style={{position: "absolute", top: 0, bottom: 0, left: 0, right: 0, backgroundColor: "#00000080", display: "flex", alignItems: "center", justifyContent: "center"}}>
          <div className="lds-facebook"><div></div><div></div><div></div></div>
        </div>
      }
      {lastMintedURL && (<>
        <hr/>
        Last Minted : <a href={lastMintedURL} target="_blank">{lastMintedURL}</a>
      </>)}
    </>
  );
}

