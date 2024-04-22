import type { Web3ReactHooks } from '@web3-react/core'
import type { MetaMask } from '@web3-react/metamask'
import { WalletConnect } from '@web3-react/walletconnect'
import { Flex, Box } from '@chakra-ui/react'

export function ConnectWithSelect({
  connector,
  isActivating,
  icon,
  onConnect,
  title
}: {
  connector: MetaMask | WalletConnect
  isActivating: ReturnType<Web3ReactHooks['useIsActivating']>
  icon: React.ReactNode
  onConnect: () => void
  title: string
}) {
    return (
      <Flex 
        w="100%"
        p="18px 30px"
        cursor="pointer"
        alignItems="center"
        flexGrow="0"
        onClick={
          isActivating ? undefined : () => {
            connector.activate()
            onConnect()
          }
        }
      >
      <Box w={45} h={45} mr="20px">{icon}</Box> 
      <Box fontSize="13px" fontWeight="700">{title}</Box>
    </Flex>
    )
}
