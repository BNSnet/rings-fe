"use client"
import { ChakraProvider } from '@chakra-ui/react'

import Web3Provider from '../contexts/Web3Provider'
import RingsProvider from '../contexts/RingsProvider'

import theme from '../theme'

import '../styles/globals.css'

import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Web3Provider>
        <RingsProvider>
          <Component {...pageProps} />
        </RingsProvider>
      </Web3Provider>
    </ChakraProvider>
  )
}

export default MyApp
