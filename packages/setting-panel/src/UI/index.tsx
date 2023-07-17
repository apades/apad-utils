import { FC, useMemo, useRef, useState } from 'react'
import { ConfigField, InitOptions } from '..'
import {
  Box,
  Button,
  Center,
  ChakraProvider,
  Divider,
  Flex,
  Input,
  Switch,
  useToast,
} from '@chakra-ui/react'
import { isBoolean } from 'lodash'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'

type ConfigEntries = [string, ConfigField<any>][]
type BaseConfig = UISettings

export type UISettings = {
  [K: string]: ConfigField<any>
}
const UIComponent: FC<{
  settings: UISettings
  configStore: Record<string, any>
  rootEl?: HTMLElement | ShadowRoot
}> = (props) => {
  let [newConfig, setNewConfig] = useState<Partial<BaseConfig>>({})
  let [videoSrc, setVideoSrc] = useState('')
  let containerRef = useRef<HTMLDivElement>()
  let [isAdvShow, setAdvShow] = useState(false)
  const toast = useToast()
  let configEntries = Object.entries(props.settings)

  const baseConfigEntries: ConfigEntries = [],
    advConfigEntries: ConfigEntries = []

  configEntries.forEach(([key, _val]) => {
    const val = { ..._val, defaultValue: (props.configStore as any)[key] }
    if (val.notRecommended) advConfigEntries.push([key, val])
    else baseConfigEntries.push([key, val])
  })

  const cache = useMemo(() => {
    if (!props.rootEl) return null
    return createCache({
      container: props.rootEl,
      key: 'setting',
    })
  }, [props.rootEl])

  if (cache)
    return (
      <CacheProvider value={cache}>
        <ChakraProvider>
          <ConfigEntriesBox
            config={baseConfigEntries}
            newConfig={newConfig}
            setNewConfig={setNewConfig}
          />
        </ChakraProvider>
      </CacheProvider>
    )
  else
    return (
      <ChakraProvider>
        <ConfigEntriesBox
          config={baseConfigEntries}
          newConfig={newConfig}
          setNewConfig={setNewConfig}
        />
      </ChakraProvider>
    )
}

const ConfigEntriesBox: FC<{
  config: ConfigEntries
  newConfig: Partial<UISettings>
  setNewConfig: React.Dispatch<React.SetStateAction<Partial<UISettings>>>
}> = (props) => {
  return (
    <Box>
      {props.config.map(([key, val]: [string, ConfigField<any>], i) => (
        <Box
          padding={'6px 8px'}
          backgroundColor={i % 2 == 0 ? 'blackAlpha.50' : 'white'}
          className="row"
          role="group"
          key={i}
        >
          <Flex gap={'12px'}>
            <Center textAlign={'center'} width={140} whiteSpace={'pre-wrap'}>
              {val.label ?? key}:
            </Center>
            <Box flex={1}>
              <Flex gap={'12px'}>
                <Center flex={1}>
                  <ConfigRowAction
                    config={val}
                    onChange={(v) => {
                      props.setNewConfig((c) => ({ ...c, [key]: v }))
                    }}
                    newVal={(props.newConfig as any)[key]}
                  />
                </Center>
                <Center
                  opacity={0}
                  transition={'ease-in-out'}
                  _groupHover={{ opacity: 1 }}
                >
                  <Button
                    isDisabled={!(props.newConfig as any)[key]}
                    colorScheme="red"
                    size={'sm'}
                    onClick={() => {
                      delete (props.newConfig as any)[key]
                      props.setNewConfig((c) => ({ ...c }))
                    }}
                  >
                    重置
                  </Button>
                </Center>
              </Flex>
              {val.desc && (
                <Box mt={'4px'} flex={1} fontSize={'12px'} color={'blue.500'}>
                  {val.desc}
                </Box>
              )}
            </Box>
          </Flex>
        </Box>
      ))}
    </Box>
  )
}

const ConfigRowAction = (props: {
  config: ConfigField<any>
  onChange: (v: any) => void
  newVal: any
}) => {
  let val = props.config.defaultValue
  console.log('val', props.newVal, val)
  if (isBoolean(val))
    return (
      <Switch
        isChecked={props.newVal ?? val}
        marginRight={'auto'}
        onChange={(e) => {
          props.onChange(e.target.checked)
        }}
      />
    )
  return (
    <Input
      value={props.newVal ?? val}
      onChange={(e) => {
        props.onChange(e.target.value)
      }}
    />
  )
}

export default UIComponent
