"use client"

import { useEffect, useState, useCallback, createContext, useContext, useReducer } from 'react'
import { useWeb3React } from '@web3-react/core'
import web3 from "web3";

import init, {
  Provider,
  BackendBehaviour,
  debug,
  rings_node
} from '@ringsnetwork/rings-node'

/* import init, { Client, Peer, UnsignedInfo, MessageCallbackInstance, debug } from '@ringsnetwork/rings-node'
 *  */
import formatAddress from '../utils/formatAddress';
export interface Chat_props {
  from: string,
  to: string,
  message: string
}

interface RingsContext {
  client: Client | null,
  fetchPeers: () => Promise<void>,
  sendMessage: (to: string, message: string) => Promise<void>,
  connectByAddress: (address: string) => Promise<void>,
  createOffer: () => Promise<void>,
  answerOffer: (offer: any) => Promise<void>,
  acceptAnswer: (answer: any) => Promise<void>,
  turnUrl: string,
  setTurnUrl: (turnUrl: string) => void,
  nodeUrl: string,
  setNodeUrl: (nodeUrl: string) => void,
  status: string,
  setStatus: (status: string) => void,
  disconnect: () => void,
  state: StateProps,
  dispatch: React.Dispatch<any>,
  startChat: (peer: string) => void,
  endChat: (peer: string) => void,
}
interface PeerMapProps {
  [key: string] : {
    address: string,
    state: string | undefined,
    transport_id: string,
    name: string,
    ens: string,
  }
}

export const RingsContext = createContext<RingsContext>({
  client: null,
  fetchPeers: async () => {},
  sendMessage: async () => {},
  connectByAddress: async () => {},
  createOffer: async () => {},
  answerOffer: async () => {},
  acceptAnswer: async () => {},
  turnUrl: '',
  setTurnUrl: () => {},
  nodeUrl: '',
  setNodeUrl: () => {},
  status: 'disconnected',
  setStatus: () => {},
  disconnect: () => {},
  state: {peerMap: {}, chatMap: {}, activePeers: [], activePeer: ''} as StateProps,
  dispatch: () => {},
  startChat: () => {},
  endChat: () => {},
})

export const useRings = () => useContext(RingsContext)

interface ChatMapProps {
  [key: string]: {
    messages: Chat_props[],
    status: string,
  }
}

interface StateProps {
  peerMap: PeerMapProps,
  chatMap: ChatMapProps,
  activePeers: string[],
  activePeer: string,
}

const FETCH_PEERS = 'FETCH_PEERS'
const CHANGE_NAME = 'CHANGE_NAME'
const RECEIVE_MESSAGE = 'RECEIVE_MESSAGE'
const ACTIVE_CHAT = 'ACTIVE_CHAT'
const END_CHAT = 'END_CHAT'

function hexToBytes(hex: number | string) {
  hex = hex.toString(16)
  hex = hex.replace(/^0x/i, '')
  for (var bytes : number[] = [], c = 0; c < hex.length; c += 2) bytes.push(parseInt(hex.slice(c, c + 2), 16))
  return bytes
}

const reducer = (state: StateProps, { type, payload }: { type: string, payload: any } ) => {
  console.log('reducer', type, payload)
  switch (type) {
    case FETCH_PEERS:
      const peerMap = state.peerMap
      const chatMap = state.chatMap

      const keys = Object.keys(state.peerMap)
      const disconnectedPeers = keys.filter(key => !payload.peers.includes(key))

      disconnectedPeers.forEach((address: string) => {
        peerMap[address] = {
          ...peerMap[address],
          state: 'disconnected',
        }
      })
      console.log(payload)
      payload.peers.forEach(({ did, ...rest }: Peer) => {
        const _address = did.startsWith(`0x`) ? did.toLowerCase() : `0x${did}`.toLowerCase()

        if (!state.peerMap[_address]) {
            peerMap[_address] = {
              ...rest,
              address: _address,
              name: formatAddress(_address),
              ens: '',
            }

            chatMap[_address] = {
              messages: [],
              status: ''
            }
        } else {
          peerMap[_address] = {
            ...state.peerMap[_address],
            ...rest,
          }
        }
      })

      return {
        ...state,
        peerMap,
        chatMap
      }
    case CHANGE_NAME:
      return {
        ...state,
        peerMap: {
          ...state.peerMap,
          [payload.peer]: {
            ...state.peerMap[payload.peer],
            [payload.key]: payload.name,
          }
        }
      }
    case ACTIVE_CHAT:
      return {
        ...state,
        chatMap: {
          ...state.chatMap,
          [payload.peer]: {
            ...state.chatMap[payload.peer],
            status: 'read',
          }
        },
        activePeer: payload.peer,
        activePeers: !state.activePeers.includes(payload.peer) ? [...state.activePeers, payload.peer] : state.activePeers
      }
    case END_CHAT:
      const activePeers = state.activePeers.filter(peer => peer !== payload.peer)

      return {
        ...state,
        chatMap: {
          ...state.chatMap,
          [payload.peer]: {
            ...state.chatMap[payload.peer],
            status: 'read',
          }
        },
        activePeer: activePeers.length ? activePeers[activePeers.length - 1] : '',
        activePeers
      }
    case RECEIVE_MESSAGE:
      return {
        ...state,
        chatMap: {
          ...state.chatMap,
          [payload.peer]: {
            messages: state.chatMap[payload.peer] ? [...state.chatMap[payload.peer].messages, payload.message] : [payload.message],
            status: state.activePeer === payload.peer ? 'read' : 'unread',
          }
        },
      }
    default:
      return state
  }
}

const RingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { account, provider } = useWeb3React()

  const [turnUrl, setTurnUrl] = useState('')
  const [nodeUrl, setNodeUrl] = useState('')
  const [nodeInfo, setNodeInfo] = useState<rings_node.INodeInfoResponse|null>(null)

  const [status, setStatus] = useState<string>('disconnected')

  const [client, setClient] = useState<Client | null>(null)
  const [wasm, setWasm] = useState<any>(null)

  const [state, dispatch] = useReducer(reducer, { peerMap: {}, chatMap: {}, activePeers: [], activePeer: '' })

  const fetchPeers = useCallback(async () => {
    if (client && status === 'connected') {
      const info:rings_node.INodeInfoResponse = await client.request("nodeInfo", [])
      const peers = info?.swarm?.peers
      dispatch({ type: FETCH_PEERS, payload: { peers } })
    }
  }, [client, status])

  const resolveENS = useCallback(async (peers: string[]) => {
    if (provider) {
      peers.forEach(async (peer) => {
        const ens = await provider.lookupAddress(peer)

        if (ens) {
          const address = await provider.resolveName(ens)

          if (address && peer === address.toLowerCase()) {
            dispatch({ type: CHANGE_NAME, payload: { peer, key: 'ens', name: ens } })
          }
        }
      })
    }
  }, [provider])

  useEffect(() => {
    resolveENS(Object.keys(state).filter((address) => state.peerMap[address] && !state.peerMap[address].ens))
  }, [state, resolveENS])

  const startChat = useCallback((address: string) => {
    if (address) {
      dispatch({ type: ACTIVE_CHAT, payload: { peer: address } })
    }
  }, [])

  const endChat = useCallback((address: string) => {
    if (address) {
      dispatch({ type: END_CHAT, payload: { peer: address } })
    }
  }, [])

  const sendMessage = useCallback(async (to: string, message: string) => {
    if (client) {
      await client.send_message(to, new TextEncoder().encode(message))

      dispatch({ type: RECEIVE_MESSAGE, payload: { peer: to, message: { from: account!, to, message } } })
    }
  }, [client, account])

  const connectByAddress = useCallback(async (address: string) => {
    if (client && address) {
      console.log(`connect by address: ${address}`)
      await client.connect_with_address(address)
      console.log(`connected`)
    }
  }, [client])

  const createOffer = useCallback(async (address: string) => {
    if (client) {
      const cor = new rings_node.CreateOfferRequest({ did: address })
      const res: rings_node.CreateOfferResponse = await client.request("createOffer", cor)
      return res.offer
    }
  }, [client])

  const answerOffer = useCallback(async (offer: any) => {
    if (client && offer) {
      const aor = new rings_node.AnswerOfferRequest({ offer: offer })
      const res: rings_node.AnswerOfferResponse = await client.request("answerOffer", aor)
      return res.answer
    }
  }, [client])

  const acceptAnswer = useCallback(async (answer: any) => {
    if (client) {
      const aar = new rings_node.AcceptAnswerRequest({ answer: answer })
      const res = await client.request("acceptAnswer", aar)
      return res
    }
  }, [client])

  const disconnect = useCallback(async () => {
    const peers = Object.keys(state.peerMap)

    if (client && peers.length) {
      try {
        console.log(`disconnect start`)
        const promises = peers.map(async (address) => await client.disconnect(address))

        await Promise.all(promises)
        console.log(`disconnect done`)
      } catch (e) {
        console.log(`disconnect error`, e)
      }
    }
  }, [client, state])

  useEffect(() => {
    const turnUrl = localStorage.getItem('turnUrl') || process.env.NEXT_PUBLIC_TURN_URL!
    const nodeUrl = localStorage.getItem('nodeUrl') || process.env.NEXT_PUBLIC_NODE_URL!

    setTurnUrl(turnUrl)
    setNodeUrl(nodeUrl)

    localStorage.setItem('turnUrl', turnUrl)
    localStorage.setItem('nodeUrl', nodeUrl)
  }, [])

  useEffect(() => {
    fetchPeers()

    const timer = setInterval(() => {
      fetchPeers()
    }, 5000)

    return () => {
      clearInterval(timer)
    }
  }, [fetchPeers])

  useEffect(() => {
    if (!wasm) {
      const initWasm = async () => {
        const w = await init()

        setWasm(w)
      }

      initWasm()
    }
  }, [wasm])

  const initClient = useCallback(async() => {
    if (account && provider && wasm && turnUrl && nodeUrl) {
      debug(process.env.NODE_ENV !== 'development')
      setStatus('connecting')

      const callback = async (ctxRef:any, providerRef: any, msgCtx: any, response: any, message: any) => {
          // console.group('on custom message')
          const { relay } = response
          // console.log(`relay`, relay)
          // console.log(`destination`, relay.destination)
          // console.log(message)
          // console.log(new TextDecoder().decode(message))
          const to = relay.destination
          const from = relay.path[0]
          // console.log(`from`, from)
          // console.log(`to`, to)

          dispatch({ type: RECEIVE_MESSAGE, payload: { peer: from, message: { from, to, message: new TextDecoder().decode(message) } } })
          // console.log(chats.get(from))
          // console.groupEnd()
      }

      // signer
      const signer = async (proof: string): Promise<Uint8Array> => {
	const providerSigner = provider.getSigner(account);
        const signed = await providerSigner.signMessage(proof)
        return new Uint8Array(hexToBytes(signed!));
      }
      // default behaviour
      const behaviour = new BackendBehaviour()
      behaviour.on("PlainText", callback)
      const client: Provider = await new Provider(
	// ice servers
	turnUrl,
	// stable timeout
        BigInt(1),
	// account
	account,
	// account type
	"eip191",
	// signer
	signer,
	// callback
	behaviour
      )
      setClient(client)
      await client.listen()

      const promises = nodeUrl.split(';').map(async (url: string) =>
	// only connect first
        client.request("connectPeerViaHttp", new rings_node.ConnectPeerViaHttpRequest({url:url}))
      )

      try {
        await Promise.any(promises)
      } catch (e) {
        console.error(e)
      }

      setStatus('connected')

      return () => {
        setStatus('disconnected')
      }
    }
  }, [account, wasm, provider, turnUrl, nodeUrl])

  useEffect(() => {
    if (account && provider && wasm && turnUrl && nodeUrl) {
      try {
        initClient()
      } catch (e) {
        console.log(`error`, e)
        setStatus('failed')
      }
    }
  }, [account, wasm, provider, turnUrl, nodeUrl, initClient])

  return (
    <RingsContext.Provider
      value={{
        client,
        fetchPeers,
        sendMessage,
        connectByAddress,
        createOffer,
        answerOffer,
        acceptAnswer,
        turnUrl,
        setTurnUrl,
        nodeUrl,
        setNodeUrl,
        status,
        setStatus,
        disconnect,
        state,
        dispatch,
        startChat,
        endChat,
      }}
    >
      {children}
    </RingsContext.Provider>
  )
}

export default RingsProvider
