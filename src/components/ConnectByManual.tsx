import React, { useCallback, useState } from 'react'
import { TransportAndIce } from '@ringsnetwork/rings-node';

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
  Tabs, TabList, TabPanels, Tab, TabPanel,
  Textarea,
} from '@chakra-ui/react'

import useRings from '../hooks/useRings';

import CopyButton from './CopyButton';

const ConnectByManual: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { createOffer, answerOffer, acceptAnswer: acceptOfferAnswer, fetchPeers } = useRings()

  const [offer, setOffer] = useState<TransportAndIce | null>(null)

  const [ice, setIce] = useState('')
  const [answer, setAnswer] = useState<TransportAndIce | null>(null)
  const [acceptAnswer, setAcceptAnswer] = useState('')

  const [offerLoading, setOfferLoading] = useState(false)
  const [acceptLoading, setAcceptLoading] = useState(false)
  const [answerLoading, setAnswerLoading] = useState(false)

  const handleCreateOffer = useCallback(async () => {
    try {
      setOfferLoading(true)
      const offer = await createOffer()
      //@ts-ignore
      setOffer(offer)
      setOfferLoading(false)
    } catch (e) {
      console.error(e)
      setOfferLoading(false)
    }
  }, [createOffer])

  const handleAnswerOffer = useCallback(async () => {
    if (ice) {
      try {
        setAnswerLoading(true)
        const answer = await answerOffer(ice)

        //@ts-ignore
        setAnswer(answer)
        setAnswerLoading(false)
        fetchPeers() 
      } catch (e) {
        console.error(e)
        setAnswerLoading(false)
      }
    }
  }, [ice, fetchPeers, answerOffer])

  const handleAcceptAnswer = useCallback(async () => {
    if (offer && offer.transport_id) {
      try {
        setAcceptLoading(true)
        await acceptOfferAnswer(offer.transport_id, acceptAnswer)

        setAcceptLoading(false)
        onClose()
        fetchPeers()
      } catch (e) {
        console.error(e)
        setAcceptLoading(false)
      }
    }
  }, [offer, acceptAnswer, fetchPeers, onClose, acceptOfferAnswer])

  const handleClose = useCallback(() => {
    setOffer(null)
    setAcceptAnswer('')
    setAnswer(null)
    setIce('')
    setOfferLoading(false)
    setAcceptLoading(false)
    setAnswerLoading(false)

    onClose()
  }, [onClose])

  return (
    <>
      <Box cursor="pointer" onClick={onOpen}>Manually Connect</Box>

      <Modal isOpen={isOpen} onClose={handleClose} isCentered> 
        <ModalOverlay />

        <ModalContent>
          <ModalHeader>
            <Text fontSize="14px">Manually Connect</Text>
          </ModalHeader>

          <ModalBody>
            <Tabs isFitted>
              <TabList>
                <Tab fontSize="12px">Offer</Tab>
                <Tab fontSize="12px">Answer</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <Box minH="340px">
                    <Box>
                      <Textarea fontSize={10} isReadOnly size="lg" value={offer && offer.ice ? offer.ice : ''} />
                      <Box mt="15px">
                        <Center>
                          <Button isLoading={offerLoading} onClick={handleCreateOffer}>Create Offer</Button>
                          <CopyButton ml="15px" code={offer && offer.ice ? offer.ice : ''} />
                        </Center>
                      </Box>
                    </Box>

                    <Box mt="40px">
                      <Textarea fontSize={10} onChange={({target: {value}}) => setAcceptAnswer(value)} value={acceptAnswer} />
                      <Box mt="15px">
                        <Center>
                          <Button isLoading={acceptLoading} onClick={handleAcceptAnswer}>Accept Answer</Button>
                        </Center>
                      </Box>
                    </Box>
                  </Box>
                </TabPanel>

                <TabPanel>
                  <Box minH="340px">
                    <Box>
                      <Textarea fontSize={10} onChange={({target: {value}}) => setIce(value)} value={ice} />
                      <Box mt="15px">
                        <Center>
                          <Button isLoading={answerLoading} onClick={handleAnswerOffer}>Answer Offer</Button>
                        </Center>
                      </Box>
                    </Box>

                    {
                      answer && answer.ice ?
                      <Box mt="40px">
                        <Textarea fontSize={10} isReadOnly value={answer && answer.ice ? answer.ice : ''} />
                        <Box mt="15px">
                          <Center>
                            <CopyButton code={answer.ice} />
                          </Center>
                        </Box>
                      </Box> :
                      null
                    }
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>

          <ModalFooter>
            <ModalCloseButton onClick={handleClose} />
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ConnectByManual

