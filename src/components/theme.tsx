import {
  Box,
  Flex,
  useColorMode,
  useColorModeValue,
  Text,
  Button,
  Center,
  IconButton,
} from '@chakra-ui/react'
import { FaMoon, FaSun } from 'react-icons/fa'

const ThemeToogle = () => {
  const { toggleColorMode: toggleMode } = useColorMode()
  const text = useColorModeValue('dark', 'light')
  const SwitchIcon = useColorModeValue(FaMoon, FaSun)

  return (
    <Center>
      <Button
       onClick={toggleMode}
       display={{
        base: 'none',
        sm: 'block'
       }}
      >
        <Center>
          <Flex 
            alignItems='center'
          >
            <Box>
              <SwitchIcon fontSize="14px" />
            </Box>
            <Text 
              ml="10px"
            >{text.toUpperCase()} MODE</Text>
          </Flex>
        </Center>
      </Button>

      <Box 
        display={{
          base: 'block',
          sm: 'none',
        }} 
        onClick={toggleMode}
      >
        <SwitchIcon fontSize="14px" />
       </Box>
    </Center>
  )
}

export default ThemeToogle
