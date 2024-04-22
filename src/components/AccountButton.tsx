import React, { useCallback } from 'react'
import { 
  Box, 
  Button, 
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Center,
} from '@chakra-ui/react'

import WalletConnectCard from './connectors/WalletConnectCard'
import MetaMaskCard from './connectors/MetaMaskCard'

const AccountButton: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleConnect = useCallback(
    () => {
      onClose()
    },
    [onClose]
  )

  return (
    <Center>
      <Box>
        <Button cursor="pointer" onClick={onOpen}>Connect Wallet</Button>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />

        <ModalContent>
          <ModalHeader>
            <Text fontSize="14px">Select a wallet provider</Text>
          </ModalHeader>

          <ModalBody>
            <MetaMaskCard onConnect={handleConnect} />
            <WalletConnectCard onConnect={handleConnect} />
          </ModalBody>

          <ModalFooter>
            <ModalCloseButton onClick={onClose} />
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Center>
  )
}

export default AccountButton
