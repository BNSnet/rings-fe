import { useEffect, useState, useCallback, useRef } from 'react'

import type { NextPage } from 'next'
import Head from 'next/head'
import dynamic from "next/dynamic";
import getConfig from 'next/config'

import { format } from 'fecha'

import { 
  Box, 
  Button, 
  Flex, 
  Input, 
  Tabs, 
  TabList, 
  Tab, 
  Center, 
  Tooltip,
  useColorMode,
  Image
} from '@chakra-ui/react';
import { MdOutlineClose } from 'react-icons/md';

import useRings from '../hooks/useRings'
import useWebsocket from '../hooks/useWebsocket'

import formatAddress from '../utils/formatAddress';

import ConnectByAddress from '../components/ConnectByAddress'
import ConnectByManual from '../components/ConnectByManual'

import Card from '../components/Card'
import Setting from '../components/Setting'
import Loading from '../components/Loading';
import useMultiWeb3 from '../hooks/useMultiWeb3';
import { OnlinePeer } from '../contexts/WebsocketProvider';
import { ADDRESS_TYPE } from '../utils/const';
import { Peer } from '../contexts/RingsProvider';
import { getAddressWithType } from '../utils';

const ThemeToogle = dynamic(() => import('../components/theme'), { ssr: false })
const ConnectWallet = dynamic(() => import("../components/ConnectWallet"), { ssr: false })

const { publicRuntimeConfig } = getConfig()

const Home: NextPage = () => {
  const [time, setTime] = useState('--:--:--')
  const { account, accountName } = useMultiWeb3()
  const { sendMessage, connectByAddress, state: ringsState, startChat, endChat } = useRings()
  const { sendMessage: sendJoinOrLeaveMessage, changeStatus, state: onlinerMap} = useWebsocket()
  // const accountName = useENS()

  const { colorMode } = useColorMode() 

  const [message, setMessage] = useState<string>('')

  const [sending, setSending] = useState<boolean>(false)

  const inputRef = useRef<HTMLInputElement | null>(null)
  const [inputing, setInputing] = useState(false)

  const messagesRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(format(new Date(), 'HH:mm:ss'))
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  const handleComposition = useCallback(({ type, target: { value }}: React.ChangeEvent<HTMLInputElement>) => {
    if (type === "compositionstart") {
      setInputing(true)
    } else if (type === "compositionend") {
      setInputing(false)
      setMessage(value)
    }  
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!inputing) {
      setMessage(e.target.value)
    }
  }, [inputing])
  
  const handleSendMessage = useCallback(async () => {
    if (sending || !message || !ringsState.activePeer) {
      return false
    }

    try {
      setSending(true)
      await sendMessage(ringsState.activePeer, message)

      setMessage('')
      setSending(false)

      if (inputRef.current) {
        inputRef.current.value = ''
      }

      messagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
      setSending(false)
    }
  }, [message, ringsState, sending, sendMessage])

  const handleJoinPublicRoom = useCallback((status: 'join' | 'leave') => {
    if (account) {
      sendJoinOrLeaveMessage(status)
    }
  }, [account, sendJoinOrLeaveMessage])

  const handleConnectByAddress = useCallback(async (peer: OnlinePeer) => {
    if (
      !peer.address || 
      peer.status === 'connecting' ||
      peer.address === account
    ) {
      return
    }

    if (peer.status === 'connected') {
      startChat(peer.address)
      setSending(false)
      setMessage('')

      return
    }

    try {
      changeStatus(peer.address, 'connecting')

      await connectByAddress(peer.address)
     
      changeStatus(peer.address, 'connected')
    } catch (e) {
      console.error(e)

      changeStatus(peer.address, '')
    }
  }, [connectByAddress, account, changeStatus, startChat])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }, [handleSendMessage])

  const isCurrentUserInPublicRoom = useCallback(() => {
    if (!account || !Object.keys(onlinerMap).length) {
      return false
    }

    const { address } = getAddressWithType(account)

    return onlinerMap[address]
  } , [account, onlinerMap])

  const getPeerName = useCallback((peer: string) => {
    const { address } = getAddressWithType(peer)

    return onlinerMap[address]?.bns || 
      ringsState.peerMap[address]?.bns || 
      onlinerMap[address]?.ens || 
      ringsState.peerMap[address]?.ens || 
      onlinerMap[address]?.name || 
      ringsState.peerMap[address]?.name ||
      formatAddress(address)
  }, [onlinerMap, ringsState.peerMap])

  const renderLeft = () => {
    return (
      <Card 
        width={{
          base: '100%',
          sm: '260px'
        }} 
        p="15px" 
        height={{
          base: "auto",
          sm: "100%",
        }}
      >
        <Flex height="100%" flexDirection="column" justifyContent="space-between">
          <Box>
            <Box>
              {
                account ? (
                  <>
                    <Flex mb="40px" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Box fontSize="14px">{accountName}</Box>
                      </Box>
                      <Flex
                        alignItems="center"
                      >
                        <Box
                          display={{
                            base: 'block',
                            sm: 'none'
                          }} 
                          mr="10px"
                        >
                          <ThemeToogle />
                        </Box>
                        <Setting />
                      </Flex>
                    </Flex>

                    <Box>
                      <Box mb="40px">
                        <Box mb="15px">
                          <ConnectByManual />
                        </Box>
                        {/* <Box mb="15px">
                          <ConnectByAddress />
                        </Box>
                        <Box mb="15px" cursor="pointer" onClick={fetchPeers}>
                          update peers
                        </Box> */}
                      </Box>
                    </Box>
                  </>
                ) : 
                <Flex justifyContent={{
                  base: 'space-between',
                  sm: 'space-around',
                }}>
                  {/* <AccountButton /> */}
                  <ConnectWallet />
                  <Center
                    alignItems="center"
                    display={{
                      base: 'flex',
                      sm: 'none'
                    }} 
                  >
                    <ThemeToogle />
                  </Center>
                </Flex>
              }
            </Box>

            <Box>
              { account ?
                <Box mb="40px">
                  <Flex mb="15px" color="#757D8A" justifyContent="space-between" alignItems="center">
                    <Box fontSize={10}>Public</Box>
                    {
                      !account?
                      null:
                      <Box cursor="pointer" onClick={() => handleJoinPublicRoom(isCurrentUserInPublicRoom() ? 'leave' : 'join')}>
                        { isCurrentUserInPublicRoom() ? 'Leave' : 'Join'}
                      </Box>
                    }
                  </Flex> 

                  <Box>
                    {
                      Object.keys(onlinerMap).map((peer) => 
                        <Flex 
                          mb="20px" 
                          cursor={ peer !== account ? 'pointer' : 'default' } 
                          justifyContent="space-between" 
                          alignItems="center" 
                          key={peer} 
                          onClick={() => handleConnectByAddress(onlinerMap[peer])}
                        >
                          {
                            peer === account ?
                            <>
                              <Box>{getPeerName(peer)}</Box>
                              <Box>You</Box> 
                            </> :
                            <>
                              <Tooltip label={onlinerMap[peer]?.status ? '': 'add to contacts'}>
                                <Box>{getPeerName(peer)}</Box>
                              </Tooltip>
                              {
                                onlinerMap[peer]?.status ? <Box>{onlinerMap[peer]?.status}</Box> : null
                              }
                            </>
                          }
                        </Flex>)
                    }
                  </Box>
                </Box>
                : null
              }

              {
                Object.keys(ringsState.peerMap).length ?
                <Box>
                  <Box fontSize={10} mb="15px" color="#757D8A">Contact</Box>
                  <Box>
                      {
                        Object.keys(ringsState.peerMap).map((peer) => (
                          <Flex 
                            mb="20px" 
                            cursor="pointer"
                            justifyContent="space-between" 
                            alignItems="center" 
                            key={peer} 
                            onClick={() => {
                              startChat(peer)
                              setSending(false)
                              setMessage('')
                          }}>
                            <Box>
                              { getPeerName(peer) }
                            </Box>
                            <Flex justifyContent="flex-end" alignItems="center">
                              <Box m="0 5px 0 10px">{ringsState.peerMap[peer].state}</Box>
                              {
                                ringsState.chatMap[peer]?.status === 'unread' ?
                                <Box w="6px" h="6px" borderRadius="50%" bg="red"></Box> : 
                                <Box w="6px" h="6px" borderRadius="50%" bg="transparent"></Box> 
                              }
                            </Flex>
                          </Flex>
                        ))
                      }
                  </Box>
                </Box>: 
                null
              }
            </Box>
          </Box>

          <Box className='ft' display={{
            base: 'none',
            sm: 'block',
          }}>
            <ThemeToogle />
            <Box fontSize="8px" color="#757D8A" mt="10px" textAlign="center">Rings Node: {publicRuntimeConfig?.ringsNodeVersion}</Box>
            <Box fontSize="8px" color="#757D8A" mt="10px" textAlign="center">Rings Chat: {publicRuntimeConfig?.ringsChatVersion}</Box>
            <Box fontSize="8px" color="#757D8A" mt="10px" textAlign="center">
              Powered by <a href="https://ringsnetwork.io/">Ringsnetwork</a>
            </Box>
          </Box>

        </Flex>
      </Card>
    )
  }

  const renderCenter = () => {
    const renderHd = () => {
      let hds: Array<React.ReactNode> = []

      ringsState.activePeers.forEach((peer, i) => {
        hds.push(<Tab key={peer}>
          <Flex justifyContent="space-between" alignItems="center" fontSize="10px">
            <Box>{ringsState.peerMap[peer]?.bns || ringsState.peerMap[peer]?.ens || ringsState.peerMap[peer]?.name || formatAddress(peer)}</Box>
            <Box
              ml="20px"
              onClick={() => {
                setSending(false)
                endChat(peer)
                setMessage('')
              }}
            >
              <MdOutlineClose size="12px" />
            </Box>
          </Flex>
        </Tab>)
      })

      return (
        <TabList>{hds}</TabList>
      )
    } 

    const renderMessages = () => {
      let messages: Array<React.ReactNode> = []

      if (ringsState.activePeer && ringsState.chatMap[ringsState.activePeer]) {
        messages = ringsState.chatMap[ringsState.activePeer].messages.map(({ message, from }, i) => {
          return (
            <Box 
              key={`${message}-${i}`}
              mb="20px"
            >
              <Flex alignItems="center">
                <Box color={ from === account ? "#15CD96" : '#757d8a'} mr="10px">
                  { 
                    from === account ?
                    accountName:
                    ringsState.peerMap[from]?.bns || ringsState.peerMap[from]?.ens || ringsState.peerMap[from]?.name || formatAddress(from) 
                  } &gt; 
                </Box>
                <Box fontSize="12px">{message}</Box>
              </Flex>
            </Box>
          )
        })
      }

      return (
        <>{messages}</>
      )
    }

    return (
      <Card p="10px" height="100%" flexGrow="1" m={{
        base: '10px 0',
        sm: "0 10px", 
      }}>
        <Flex height="100%" justifyContent="space-between" flexDirection="column">
          <Box>
            <Tabs 
              variant='enclosed' 
              index={ ringsState.activePeers.findIndex(key => key === ringsState.activePeer) } 
              onChange={(index) => {
                startChat(ringsState.activePeers[index])
              }}
            >
              {renderHd()}
            </Tabs>
          </Box>
          <Card flexGrow="1" mb="10px" borderTop="none" p="15px" overflowY="auto">
            <Box pb="50px">{renderMessages()}</Box>
            <Box w="100%" h="50px" ref={messagesRef} />
          </Card>
          <Flex>
            <Input 
              ref={inputRef}
              disabled={
                !account || 
                !ringsState.activePeer ||
                ringsState.peerMap[ringsState.activePeer]?.state !== 'connected' 
              }
              fontSize={10} 
              mr="15px" 
              type="text" 
              placeholder='Type message' 
              // value={message} 
              onChange={handleInputChange} 
              onKeyDown={handleKeyDown} 
              // @ts-ignore
              onCompositionStart={handleComposition}
              // @ts-ignore
              onCompositionEnd={handleComposition}
            />
            <Button 
              disabled={
                !account || 
                !ringsState.activePeer || 
                ringsState.peerMap[ringsState.activePeer]?.state !== 'connected' || 
                !message
              } 
              isLoading={sending} 
              onClick={handleSendMessage}
            >
              Send
            </Button>
          </Flex>
        </Flex>
      </Card>
    )
  }
  const renderRight = () => {
    return (
      <Box 
        width={{
          base: '100%',
          sm: "240px",
        }} 
        height={{
          base: 'auto',
          sm: "100%",
        }}
      >
        <Flex height="100%" flexDirection="column">
          <Center mb="10px">
            <Center>
              <Image width="32px" height="32px" src={`/logo-${colorMode}.png`} alt="rings chat logo" />
              <Box color="#757D8A" ml="10px">Rings Chat</Box>
            </Center>
          </Center>

          <Card>
            <Flex p="15px" fontSize="26px" justifyContent="space-around" alignItems="center">
              {time}
            </Flex>
          </Card>

          <Box display={{
            base: 'block',
            sm: 'none',
          }}>
            <Box fontSize="8px" color="#757D8A" mt="10px" textAlign="center">Rings Node: {publicRuntimeConfig?.ringsNodeVersion}</Box>
            <Box fontSize="8px" color="#757D8A" mt="10px" textAlign="center">Rings Chat: {publicRuntimeConfig?.ringsChatVersion}</Box>
            <Box fontSize="8px" color="#757D8A" mt="10px" textAlign="center">
              Powered by <a href="https://ringsnetwork.io/">Ringsnetwork</a>
            </Box>
          </Box>

          {/* <Box>
            <div className={styles['mod-network']}>
              <div className="hd">
                <div>PING</div>
                <div className='value'>24ms</div>
              </div>
              <div className="bd">
                <div>NETWORK STATUS</div>
                <div className='label'>STATE IPv4</div>
                <div>ONLINE</div>
              </div>
            </div>

            <Box className={styles['mod-member']}></Box>
          </Box> */}
        </Flex>
      </Box>
    )
  }

  return (
    <Box p="10px" height="100vh">
      <Head>
        <title>Rings Chat</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.png" />
      </Head>

      <Flex 
        justifyContent={{
          base: "space-between"
        }} 
        flexDir={{
          base: 'column',
          sm: 'row'
        }}
        height="100%"
      >
        {renderLeft()}
        {renderCenter()}
        {renderRight()}
      </Flex>

      <Loading />
    </Box>
  )
}

export default Home
