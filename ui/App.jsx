import * as React from "react";
import { ethers } from "ethers";
import './App.css';
import abi from '../artifacts/contracts/MyEpicNFT.sol/MyEpicNFT.json'

const contractAddress = "0x00AB871DcB34090322ef0EAEBF64450c8b713C6a"
const contractABI = abi.abi
export default function App() {

  
  const [status, setStatus] = React.useState("loading");
  const [errorMsg, setErrorMsg] = React.useState();
  const [currentAccount, setCurrentAccount] = React.useState()
  const [lastMintedURL, setLastMintedURL] = React.useState()
  const [lastTransactionURL, setLastTransactionURL] = React.useState()

  const setError = msg => {
    setErrorMsg(msg);
    setStatus("error")
  }
  
  React.useEffect(()=>{
    const { ethereum } = window;

    if (!ethereum) {
      setError("No wallet detected")
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
          setError(err.message)
        })
      } else {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(contractAddress, contractABI, signer);

        if (status==="mint") {
          setLastTransactionURL(undefined)
          setLastMintedURL(undefined)
          nftContract.makeAnEpicNFT()
          .then(tx => {
            setLastTransactionURL(`https://rinkeby.etherscan.io/tx/${tx.hash}`)
            setStatus("ready")
          }).catch(err=>{
            setStatus(err.message)
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
              RETRY {errorMsg && (<>
              : {errorMsg}
              </>)}
          </button>}
        </div>
      </div>
      {status!=="ready" && status!=="error" && status!=="no_account" &&
        <div style={{position: "absolute", top: 0, bottom: 0, left: 0, right: 0, backgroundColor: "#00000080", display: "flex", alignItems: "center", justifyContent: "center"}}>
          <div className="lds-facebook"><div></div><div></div><div></div></div>
        </div>
      }
      {lastTransactionURL && (<>
        <hr/>
        Last Transaction : <a href={lastTransactionURL} target="_blank">{lastTransactionURL}</a><br/>
        Last Minted : {lastMintedURL ? <a href={lastMintedURL} target="_blank">{lastMintedURL}</a>:"waiting event ..."}<br/>
      </>)}
    </>
  );
}

