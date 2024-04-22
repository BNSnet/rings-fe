import React, { useCallback, useState } from 'react'

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
  Flex,
  Input,
  Icon,
} from '@chakra-ui/react'
import { MdSettings } from 'react-icons/md'

import useRings from '../hooks/useRings'

const Setting: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { turnUrl, nodeUrl, setTurnUrl, setNodeUrl, disconnect } = useRings()

  const [turnUrlInput, setTurnUrlInput] = useState(turnUrl)
  const [nodeUrlInput, setNodeUrlInput] = useState(nodeUrl)

  const handleClose = useCallback(() => { 
    setTurnUrlInput(turnUrl)
    setNodeUrlInput(nodeUrl)
    onClose()
  }, [onClose, turnUrl, nodeUrl])

  const handleTurnUrlChange = useCallback(({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    setTurnUrlInput(value)
  }, [setTurnUrlInput])

  const handleNodeUrlChange = useCallback(({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    setNodeUrlInput(value)
  }, [setNodeUrlInput])

  const handleSubmit = () => {
    setTurnUrl(turnUrlInput)
    setNodeUrl(nodeUrlInput)
    onClose()
    disconnect()

    if (typeof window !== 'undefined') {
      localStorage.setItem('turnUrl', turnUrlInput)
      localStorage.setItem('nodeUrl', nodeUrlInput)
    }
  }

  return (
    <>
      <Center cursor="pointer" onClick={onOpen}>
        <Icon as={MdSettings} boxSize="14px" />
      </Center>

      <Modal isOpen={isOpen} onClose={handleClose} isCentered>
        <ModalOverlay />

        <ModalContent>
          <ModalHeader>
            <Text fontSize="14px">Setting</Text>
          </ModalHeader>

          <ModalBody>
            <Box pt="20px">
              <Flex justifyItems="center" mb="15px">
                <Center flexShrink="0" mr="10px">TURN Url</Center>
                <Input fontSize="10px" type="text" placeholder='Type TURN Url' value={turnUrlInput} onChange={handleTurnUrlChange} />
              </Flex>
              <Flex justifyItems="center" mb="15px">
                <Center flexShrink="0" mr="10px">NODE Url</Center>
                <Input fontSize="10px" type="text" placeholder='Type NODE Url' value={nodeUrlInput} onChange={handleNodeUrlChange} />
              </Flex>
              <Flex justifyContent="flex-end" pt="20px">
                <Button mr="15px" onClick={handleClose}>Cancel</Button>
                <Button disabled={!turnUrlInput || !nodeUrlInput} onClick={handleSubmit}>Save</Button>
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

export default Setting