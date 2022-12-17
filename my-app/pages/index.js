import { Contract, providers, utils } from 'ethers'
import Head from 'next/head'
import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Web3Modal from 'web3modal'
import { abi, NFT_CONTRACT_ADDRESS } from '../constants'
import styles from '../styles/Home.module.css'
import { ImLink, ImTwitter, ImLinkedin2 } from 'react-icons/im'
import { BsArrowDown } from 'react-icons/bs'
import { GiFist } from 'react-icons/gi'

import BeatLoader from 'react-spinners/BeatLoader'

export default function Home() {
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false)
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false)
  // tokenIdsMinted keeps track of the number of tokenIds that have been minted
  const [tokenIdsMinted, setTokenIdsMinted] = useState('0')
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef()

  /**
   * publicMint: Mint an NFT
   */
  const publicMint = async () => {
    try {
      console.log('==============Public mint')
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true)
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer)
      // call the mint from the contract to mint the LW3Punks
      const tx = await nftContract.mint({
        // value signifies the cost of one ObiDatti which is "0.01" eth.
        // We are parsing `0.01` string to ether using the utils library from ethers.js
        value: utils.parseEther('113.015'),
      })

      setLoading(true)
      // wait for the transaction to get mined
      await tx.wait()

      setLoading(false)

      window.alert("You successfully minted a ObiDatti's NFT!")
    } catch (err) {
      console.error(err)
    }
  }

  /*
        connectWallet: Connects the MetaMask wallet
      */
  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner()
      setWalletConnected(true)
    } catch (err) {
      console.error(err)
    }
  }

  /**
   * getTokenIdsMinted: gets the number of tokenIds that have been minted
   */
  const getTokenIdsMinted = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner()
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider)
      // call the tokenIds from the contract
      const _tokenIds = await nftContract.tokenIds()
      console.log('tokenIds ==>', _tokenIds)
      //_tokenIds is a `Big Number`. We need to convert the Big Number to a string
      setTokenIdsMinted(_tokenIds.toString())
    } catch (err) {
      console.error(err)
    }
  }

  /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */
  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect()
    const web3Provider = new providers.Web3Provider(provider)

    // If user is not connected to the Polygon network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork()
    if (chainId !== 137) {
      window.alert('change network to polygon Mainnet')
      throw new Error('change network to polygon Mainnet')
    }

    if (needSigner) {
      const signer = web3Provider.getSigner()
      return signer
    }
    return web3Provider
  }

  // useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called
  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: 'polygon',
        providerOptions: {},
        disableInjectedProvider: false,
      })

      connectWallet()

      getTokenIdsMinted()

      // set an interval to get the number of token Ids minted every 86,400 (24hrs) seconds
      setInterval(async function () {
        await getTokenIdsMinted()
      }, 86400 * 1000)
    }
  }, [walletConnected])

  /*
        renderButton: Returns a button based on the state of the dapp
      */
  const renderButton = () => {
    // If wallet is not connected, return a button which allows them to connect their wallet
    if (!walletConnected) {
      return (
        <section className={styles.button}>
          <div className={styles.searchBox}>
            <button
              onClick={connectWallet}
              className={`${styles.searchButton} ${styles.connectButton}`}
            >
              Connect wallet
            </button>
          </div>
        </section>
      )
    }

    // If we are currently waiting for something, return a loading button
    if (loading) {
      return (
        <section className={styles.button}>
          <div className={styles.searchBox}>
            Minting{'  '}
            <BeatLoader
              color='#ffffff'
              loading={true}
              cssOverride=''
              size={15}
              aria-label='Loading Spinner'
              data-testid='loader'
            />
          </div>
        </section>
      )
    }

    return (
      <section className={styles.button}>
        <div className={styles.searchBox}>
          <button
            className={`${styles.searchButton} ${styles.mintButton}`}
            onClick={publicMint}
          >
            Mint NFT
          </button>
        </div>
      </section>
    )
  }

  return (
    <div>
      <Head>
        <title>ObiDatti NFTs</title>
        <meta name='description' content='ObiDatti NFTs for Obidients' />
        <link rel='icon' href='/favicon.png' />
      </Head>
      <div className={styles.main}>
        <div className={styles.content}>
          <img className={styles.logo} src='./assets/logo.png' />
          <h1 className={styles.title}>
            <span style={{ color: '#2ae267' }}>#OB</span>IDA
            <span style={{ color: '#2ae267' }}>TTI</span> <br /> NFT collection.
          </h1>
          <h2>By an Obidient, For Obidients!</h2>
          <h4>
            Dedicated to all{' '}
            <span style={{ color: 'tomato', fontWeight: '900' }}>ENDSARS</span>
            <span style={{ color: '#2ae267', fontSize: '30px' }}>
              {<GiFist />}
            </span>
            Victims <br /> and those fighting against BAD Governance.
          </h4>
          <div className={`${styles.arrow} ${styles.bounce}`}>
            <a className={styles.fa} href='#'>
              {<BsArrowDown />}
            </a>
          </div>
          <div className={styles.description}>
            70% of proceeds goes to{' '}
            <span style={{ color: '#2ae267' }}>#OB</span>IDA
            <span style={{ color: '#2ae267', lineHeight: '2' }}>TTI</span>{' '}
            Campaign.
            <br />
            {tokenIdsMinted} NFTs have been minted.
          </div>
          {renderButton()}
          <section className={styles.social_icons}>
            <a
              href='https://chidozietech.netlify.app/'
              target='_blank'
              title='My-Website'
            >
              <i className={styles.fa}>{<ImLink />}</i>
            </a>
            <a
              href='https://twitter.com/zenodavids'
              title='Twitter'
              target='_blank'
            >
              <i className={styles.fa}>{<ImTwitter />}</i>
            </a>
            <a
              href='https://www.linkedin.com/in/chidozieezeanekwe/'
              title='Linkedin'
              target='_blank'
            >
              <i className={styles.fa}>{<ImLinkedin2 />}</i>
            </a>
          </section>
        </div>
      </div>
    </div>
  )
}
