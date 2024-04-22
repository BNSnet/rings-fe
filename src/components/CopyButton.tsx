import React from 'react'
import { Box, ButtonProps, Flex, useClipboard } from '@chakra-ui/react'
import { FaClipboard } from 'react-icons/fa'

interface CopyButtonProps extends ButtonProps {
  code: string
}

function CopyButton({ code, ...props }: CopyButtonProps) {
  const { hasCopied, onCopy } = useClipboard(code)

  return (
    // @ts-ignore
    <Flex
      alignItems="center"
      cursor="pointer"
      fontSize='xs'
      height='24px'
      {...props}
      onClick={onCopy}
    >
      <Box mr="5px">
        <FaClipboard />
      </Box>
      <Box fontSize="10px">
        {
          hasCopied
          ? 'Copied'
          : 'Copy'
        }
      </Box>
    </Flex>
  )
}

export default CopyButton