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
  Spinner,
  Center,
} from '@chakra-ui/react'

import useRings from '../hooks/useRings';

const Loading: React.FC = () => {
  const { onClose } = useDisclosure()
  const { status, setStatus } = useRings()

  const handleClose = useCallback(() => {
    setStatus('disconnected')
    onClose()
  }, [onClose, setStatus])

  return (
    <Modal 
      isOpen={ ['connecting'].includes(status) } 
      onClose={handleClose} 
      isCentered
      closeOnOverlayClick={false}
      closeOnEsc={false}
      size="xs"
    >
      <ModalOverlay />

      <ModalContent>
        <ModalBody>
          <Box p="20px">
            <Center>
              <Flex flexDirection="column" justifyContent="center" alignItems="center">
                <Box>
                  <Spinner size="xl" />
                </Box>
                <Box mt="20px"><Text>Connecting...</Text></Box>
              </Flex>
            </Center>
          </Box>
        </ModalBody>

        <ModalFooter>
          <ModalCloseButton onClick={handleClose} />
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default Loading