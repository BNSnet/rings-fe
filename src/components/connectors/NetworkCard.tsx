import { useEffect } from 'react'
import { hooks, network } from '../../connectors/network'
import { ConnectWithSelect } from '../ConnectWithSelect'

const {
  useChainId,
  useAccounts,
  useError,
  useIsActivating,
  useIsActive,
  useProvider,
  useENSNames
} = hooks

export default function NetworkCard(){
  const chainId = useChainId()
  const accounts = useAccounts()
  const error = useError()
  const isActivating = useIsActivating()

  const isActive = useIsActive()

  const provider = useProvider()
  const ENSNames = useENSNames(provider)

  // attempt to connect eagerly on mount
  useEffect(() => {
    void network.activate()
  }, [])

  return (
    <div>
      <ConnectWithSelect
        // @ts-ignore
        connector={network}
        chainId={chainId}
        isActivating={isActivating}
        error={error}
        isActive={isActive}
      />
    </div>
  )
}
