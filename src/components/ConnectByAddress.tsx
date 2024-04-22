import React, { useCallback, useState } from 'react'
import { 
  Input,
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
  Flex,
} from '@chakra-ui/react'

import useRings from '../hooks/useRings';

const ConnectByAddress: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { connectByAddress, fetchPeers } = useRings()

  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value)
  }, [])

  const handleClose = useCallback(() => { 
    setAddress('')
    setLoading(false) 
    onClose()
  }, [onClose])

  const handleConnectByAddress = useCallback(async () => {
    setLoading(true)

    await connectByAddress(address)
      setLoading(false)
      onClose()
      fetchPeers()
  }, [ address, fetchPeers, onClose, connectByAddress, setLoading])

  return (
    <>
      <Box cursor="pointer" onClick={onOpen}>Connect by address</Box>

      <Modal isOpen={isOpen} onClose={handleClose} isCentered>
        <ModalOverlay />

        <ModalContent>
          <ModalHeader>
            <Text fontSize="14px">Connect by Address</Text>
          </ModalHeader>

          <ModalBody>
            <Box>
              <Box>
                <Input fontSize="10px" type="text" placeholder='Type Address' value={address} onChange={handleInputChange} />
              </Box>
              <Flex justifyContent="flex-end" pt="20px">
                <Button mr="15px" onClick={handleClose}>Cancel</Button>
                <Button disabled={!address || loading} isLoading={loading} onClick={handleConnectByAddress}>Connect</Button>
              </Flex>
            </Box>
          </ModalBody>

          <ModalFooter>
            <ModalCloseButton onClick={handleClose} />
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ConnectByAddress

