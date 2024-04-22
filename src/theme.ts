import { extendTheme, type ThemeConfig } from '@chakra-ui/react'
import { StyleFunctionProps } from '@chakra-ui/theme-tools'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

// const breakpoints = {
//   sm: '320px',
//   md: '768px',
//   lg: '960px',
//   xl: '1200px',
//   '2xl': '1536px',
// }

const colors = {
  dark: {
    border: 'rgba(255, 255, 255, 0.2)',
    bg: '#15232d',
    overlay: 'rgba(46, 46, 58, 0.05)',
    modal: 'rgba(255, 255, 255, 0.05)',
  },
  light: {
    border: 'rgba(46, 46, 58, 0.2)',
    bg: '#fff',
    overlay: 'rgba(46, 46, 58, 0.05)',
    modal: '#fff'
  }
}

const Button = {
  baseStyle: {
    textTransform: 'uppercase',
    borderRadius: 0,
  },
  variants: {
    solid: ({ colorMode }: StyleFunctionProps) => ({
      fontSize: '10px',
      border: `1px solid ${colors[colorMode].border}`,
      background: 'transparent'
    })
  }
}

const Card = {
  // The styles all Cards have in common
  baseStyle: ({ colorMode }: StyleFunctionProps) => ({
    border: `1px solid ${colors[colorMode].border}`,
  }),
}

const Modal = {
  baseStyle: ({ colorMode }: StyleFunctionProps) => ({
    overlay: {
      // bg: colors[colorMode].overlay,
      backdropFilter: 'blur(3px)',
    },
    dialog: {
      bg: colors[colorMode].modal,
    }
  })
}

const Input = {
  sizes: {
    md: {
      field: {
        borderRadius: 0
      }
    }
  }
}

const customTheme = extendTheme({
  config,
  fonts: {
    body: 'Dogica Pixel, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
  },
  styles: {
    global: {
      body: {
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        fontSize: '10px',
        transition: 'background 0.25s ease-in-out',
      },
      ul: {
        listStyle: 'none'
      },
      li: {
        listStyle: 'none'
      }
    },
  },
  components: {
    Card,
    Button,
    Modal,
    Input
  },
  // breakpoints
})

export default customTheme