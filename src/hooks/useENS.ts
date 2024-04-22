import { useState, useEffect, useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'

import formatAddress from '../utils/formatAddress'

const useENS = () => {
  const { provider, account } = useWeb3React()

  const [name, setName] = useState('')

  const resolveName = useCallback(async () => {
    if (provider && account) {
      const name = await provider.lookupAddress(account)

      if (name) {
        const address = await provider.resolveName(name)

        if (address && account.toLocaleLowerCase() === address.toLocaleLowerCase()) {
          setName(name)
        }
      }
    }
  }, [provider, account])

  useEffect(() => {
    if (account) {
      setName(formatAddress(account))
      resolveName()
    }
  }, [account, resolveName])

  return name
}

export default useENS
