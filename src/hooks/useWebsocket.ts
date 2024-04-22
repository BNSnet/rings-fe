import { useEffect, useState, useRef, useCallback, useReducer } from 'react'
import { useWeb3React } from '@web3-react/core'
import useWebSocket, { ReadyState } from 'react-use-websocket'

import formatAddress from '../utils/formatAddress'
interface OnlinerMapProps {
  [key: string]: {
    address: string,
    name: string,
    ens: string,
    status: string
  },
}

const reducer = (state: OnlinerMapProps, { type, payload }: { type: string, payload: any }) => {
  switch (type) {
    case 'join':
      const { peer } = payload

      return {
        ...state,
        [peer]: {
          peer,
          name: formatAddress(peer),
          ens: '',
          status: '',
        }
      }
      break
    case 'leave':
      delete state[payload.peer]

      return state
    case 'connected':
      const { peers } = payload

      return peers.reduce((prev: OnlinerMapProps, peer: string) => {
        const address = peer.toLowerCase()

        return {
          ...prev,
          [address]: {
            address,
            name: formatAddress(address),
            ens: '',
            status: '',
          }
        }
      }, {})
    case 'changeStatus':
      return {
        ...state,
        [payload.peer]: {
          ...state[payload.peer],
          status: payload.status,
        }
      }
    case 'changeName':
      return {
        ...state,
        [payload.peer]: {
          ...state[payload.peer],
          [payload.key]: payload.name,
        }
      }
    default:
      return state
  }
}

const useWebsocket = () => {
  const didUnmount = useRef(false)

  const { account, provider } = useWeb3React()
  const [socketUrl, setSocketUrl] = useState('wss://api-did-dev.ringsnetwork.io/ws');

  const [onliners, setOnliners] = useState<string[]>([])

  const [state, dispatch] = useReducer(reducer, {})

  const { sendJsonMessage, readyState, lastJsonMessage } = useWebSocket(
    socketUrl,
    {
      shouldReconnect: (closeEvent) => didUnmount.current === false,
      retryOnError: true,
      reconnectAttempts: 10,
      reconnectInterval: 3000,
    }
  );


  const resolveENS = useCallback(async (peers: string[]) => {
    if (provider) {
      peers.forEach(async (address) => {
        const ens = await provider.lookupAddress(address)

        if (ens) {
          const _address = await provider.resolveName(ens)

          if (_address && address === _address.toLowerCase()) {
            dispatch({ type: 'changeName', payload: { peer: address, key: 'ens', name: ens } })
          }
        }
      })
    }
  }, [provider])

  useEffect(() => {
    resolveENS(Object.keys(state).filter((address) => state[address] && !state[address].ens))
  }, [resolveENS, state])

  const sendMessage = useCallback((status: 'join' | 'leave') => {
    console.group(`change status`)
    console.log(`time`, new Date().toLocaleTimeString())
    console.log(`status: ${status}`)
    console.log(`account: ${account}`)
    console.log(`readyState`, readyState)
    console.groupEnd()
    if (readyState === ReadyState.OPEN && account) {
      sendJsonMessage({
        did: account,
        timestamp: Date.now(),
        data: status
      })
    }
  }, [
    readyState,
    account,
    sendJsonMessage
  ])

  useEffect(() => {
    return () => {
      didUnmount.current = true;
    };
  }, [])

  useEffect(() => {
    if (lastJsonMessage) {
      // @ts-ignore
      const { did, data } = lastJsonMessage
      const address = `${did}`.toLowerCase()

      if (data === 'join') {
        setOnliners((prev) => [...prev.filter(peer => peer.toLowerCase() !== address), address])

        dispatch({ type: 'join', payload: { peer: address } })
      } else if (data === 'leave') {
        setOnliners((prev) => prev.filter(o => o.toLowerCase() !== address))

        dispatch({ type: 'leave', payload: { peer: address } })
      } else if (data.list) {
        // on connect or reconnect
        setOnliners(data.list)

        dispatch({ type: 'connected', payload: { peers: data.list } })
      }
    }
  }, [lastJsonMessage])

  return {
    state,
    dispatch,
    sendMessage,
  }
}

export default useWebsocket
