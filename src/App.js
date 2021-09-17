import './App.css';
import Web3 from 'web3'
import { useCallback, useEffect, useMemo, useState } from 'react';
import logo from './assets/images/logo.png'
import moon from './assets/images/moon.png'
import stars1 from './assets/images/stars-1.png'
import stars2 from './assets/images/stars-2.png'
import previewGIF from './assets/images/preview.gif'
import packingGIF from './assets/images/packing.gif'
import packingSingleGIF from './assets/images/packing-single.gif'


const CONTRACT_ADDRESS = "0x1f8bd381d0df1c6244cf36020775b89a121ae911"
// const CONTRACT_ADDRESS = "0xafd4e6ce929e1358b65bdb217f818c2052f237a5"
const CONTRACT_ABI = [{"inputs":[{"internalType":"string","name":"_baseURI","type":"string"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"indexed":false,"internalType":"uint256[]","name":"values","type":"uint256[]"}],"name":"TransferBatch","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"id","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"TransferSingle","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"value","type":"string"},{"indexed":true,"internalType":"uint256","name":"id","type":"uint256"}],"name":"URI","type":"event"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"accounts","type":"address[]"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"}],"name":"balanceOfBatch","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"mint","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"number","type":"uint256"}],"name":"mintMultiple","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ownerClaim","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"presaleMint","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"number","type":"uint256"}],"name":"presaleMintMultiple","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"presalePrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"price","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeBatchTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"uri","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}]
const CHAIN_ID = 137
// const CHAIN_ID = 4
const web3 = new Web3(window.ethereum)
const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS)

const CONNECTION_ERRORS = {
  NO_PROVIDER: 'NO_PROVIDER',
  WRONG_NETWORK: 'WRONG_NETWORK',
}

const LOADING_STATUS = {
  IDLE: 'IDLE',
  MINTING_1: 'MINTING_1',
  MINTING_10: 'MINTING_10',
  MINTING_DONE: 'MINTING_DONE'
}

const App = () => {
  const [account, setAccount] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(LOADING_STATUS.IDLE);
  const [minted, setMinted] = useState(null);

  const initialize = useCallback(async () => {
    if(account) return;

    if(!window.ethereum) {
      setConnectionError(CONNECTION_ERRORS.NO_PROVIDER)
      return
    }
    const accounts = await window.ethereum.enable()
    setAccount(accounts[0]);

    const chainId = await web3.eth.getChainId()
    if(chainId !== CHAIN_ID) {
      setConnectionError(CONNECTION_ERRORS.WRONG_NETWORK)
    }
  }, [account])

  useEffect(() => {
    initialize();
  }, [initialize])

  const confirmAndReload = useCallback(() => {
    setLoadingStatus(LOADING_STATUS.IDLE);
    setMinted(null);
  }, [])

  const mint = useCallback(async () => {
    setLoadingStatus(LOADING_STATUS.MINTING_1);
    try {
      const result = await contract.methods.presaleMint().send({
        from: account,
        value: 1190000000000000000,
      })

      const newlyMinted = result.events.TransferSingle.returnValues.id
      const tokenURI = await contract.methods.uri(+newlyMinted).call()
      console.log(tokenURI)
      const image = await fetch(tokenURI)
        .then(response => response.json())
        .then(json => json.image)
      setMinted([image]);
      setLoadingStatus(LOADING_STATUS.MINTING_DONE);
      setTimeout(() => confirmAndReload(), 15000)
    } catch(e) {
      setLoadingStatus(LOADING_STATUS.IDLE);
    }
  }, [account, confirmAndReload])

  const mint10 = useCallback(async () => {
    setLoadingStatus(LOADING_STATUS.MINTING_10);
    try {
      const result = await contract.methods.presaleMintMultiple(10).send({
        from: account,
        value: 11900000000000000000,
      })
      const newlyMinted = result.events.TransferSingle.map(item => +item.returnValues.id)
      const tokenURIs = await Promise.all(newlyMinted.map(id => contract.methods.uri(id).call()))

      const images = await Promise.all(
        tokenURIs.map(tokenURI => fetch(tokenURI)
          .then(response => response.json())
          .then(json => json.image)
        ))
      setMinted(images);
      setLoadingStatus(LOADING_STATUS.MINTING_DONE);
      setTimeout(() => confirmAndReload(), 30000)
    } catch(e) {
      setLoadingStatus(LOADING_STATUS.IDLE);
    }
  }, [account, confirmAndReload])

  

  const connectionText = useMemo(() => {
    if(account && !connectionError){
      return account.slice(0, 6) + "......" + account.slice(-6)
    } else if(!account) {
      return "連接錢包"
    } else {
      switch(connectionError) {
        case CONNECTION_ERRORS.NO_PROVIDER:
          return "請使用 Metamask"
        case CONNECTION_ERRORS.WRONG_NETWORK:
          return "請使用 Matic 網路"
        default:
          return "啊喔！有東西出錯了"
      }
    }
  }, [account, connectionError])

  return (
    <div className="fluid-container main">
      <div className="overlay">
        <img className="stars stars-1 d-none d-lg-block" src={stars1} alt="stars" />
        <img className="stars stars-2 d-none d-lg-block" src={stars2} alt="stars" />
        <img className="moon d-none d-lg-block" src={moon} alt="moon" />
      </div>
      <div className="foreground">
        <div className="header d-flex flex-row justify-content-between align-items-center px-1 px-md-5">
          <img className="logo" src={logo} alt="logo" />
          <button className="btn btn-secondary account me-4" onClick={initialize}>
            {connectionText}
          </button>
        </div>
        <div className="row g-0">
            <div className="offset-1 col-10 offset-md-5 col-md-7 d-flex flex-column align-items-center">
              { loadingStatus === LOADING_STATUS.MINTING_DONE 
                ? <>
                    <div className="row g-2">
                      {minted.map((token, index) => (
                        <div key={index} className="col">
                          <img src={token} className="preview-token img-fluid" alt="" />
                        </div>
                      ))}
                    </div>
                    <button
                      className="btn buy-button buy-1 mt-5 mx-3" 
                      type="button"
                      onClick={confirmAndReload}
                      disabled={loadingStatus === LOADING_STATUS.MINTING_1}
                    >
                      確認
                    </button>
                  </>
                : (
                  <>
                    <div className="d-flex p-4 justify-content-center">
                      {(() => {
                        switch(loadingStatus) {
                          case LOADING_STATUS.IDLE:
                            return <img className="img-fluid preview" src={previewGIF} alt="" />
                          case LOADING_STATUS.MINTING_1:
                            return <img className="img-fluid preview" src={packingSingleGIF} alt="" />
                          case LOADING_STATUS.MINTING_10:
                            return <img className="img-fluid preview" src={packingGIF} alt="" />
                          default: 
                            return <img className="img-fluid preview" src={previewGIF} alt="" />
                        }
                      })()}
                    </div>
                    <div className="d-flex justify-content-center flex-column flex-md-row mt-5">
                      <button
                        className="btn buy-button buy-1 my-2 mx-3 d-block d-md-inline-block" 
                        type="button"
                        onClick={mint}
                        disabled={loadingStatus === LOADING_STATUS.MINTING_1}
                      >
                        { loadingStatus === LOADING_STATUS.MINTING_1 ? <i className="fas fa-circle-notch fa-spin" /> : "買 1 個月餅！" }
                      </button>
                      <button
                        className="btn buy-button buy-10 my-2 mx-3 d-block d-md-inline-block"
                        type="button"
                        onClick={mint10}
                        disabled={loadingStatus === LOADING_STATUS.MINTING_10}
                      >
                        {loadingStatus === LOADING_STATUS.MINTING_10 ? <i className="fas fa-circle-notch fa-spin" /> : "我要買 10 個！"}
                        
                      </button>
                    </div>
                  </>
              )
            }
          </div>
        </div>
        <footer className="px-5 py-2">
          <div className="d-flex justify-content-center justify-content-md-end align-items-center">
            <a className="plain-link" href="https://discord.gg/uTcUK36EfB" target="_blank" rel="noopener noreferrer">
              <span className="mx-2">Follow us on Discord</span>
              <i className="fab fa-discord"></i>
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
