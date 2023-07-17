import { UISettings } from '.'
import { ConfigField } from '..'
import { FC } from 'react'
import { Box, ChakraProvider, Divider, Flex } from '@chakra-ui/react'

const Category: FC<{
  list: { settings: ConfigField<any>[]; category: string }[]
  configStore: Record<string, any>
}> = (props) => {
  return (
    <>
      {props.list.map((data, i) => {
        return (
          <Box key={i}>
            {/* <Flex p="12px"> */}
            <Box /* width={400} */>{data.category}</Box>
            <Box _hover={{}} flex={1}>
              {data.settings.map((d, i) => {})}
            </Box>
            {/* </Flex> */}
            {i != 0 && i != props.list.length - 1 && <Divider />}
          </Box>
        )
      })}
    </>
  )
}
