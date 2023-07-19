import {
  Box,
  Button,
  Center,
  ChakraProvider,
  Flex,
  Input,
  Switch,
  useToast,
} from '@chakra-ui/react'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import LoadingContainer from '@pkgs/react-utils/components/LoadingContainer'
import { useOnce } from '@pkgs/react-utils/hooks'
// import { useMemoizedFn } from 'ahooks'
import { debounce, isBoolean, isEqual, isUndefined } from 'lodash'
import { runInAction } from 'mobx'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { ConfigField, InitOptions } from '..'
import useMemoizedFn from '@pkgs/react-utils/hooks/useMemoizedFn'
import { observer } from 'mobx-react'

type ConfigEntries = [string, ConfigField<any>][]
type BaseConfig = UISettings

export type UISettings = {
  [K: string]: ConfigField<any>
}
type Props = {
  settings: UISettings
  configStore: Record<string, any>
  savedConfig?: UISettings
  rootEl?: HTMLElement | ShadowRoot
} & InitOptions<Record<string, any>>

const SettingPanel: FC<Props> = observer((props) => {
  let [newConfig, _setNewConfig] = useState<Partial<BaseConfig>>({})
  useEffect(() => {
    if (props.savedConfig) _setNewConfig(props.savedConfig)
  }, [props.savedConfig])
  window.newConfig = newConfig
  let configEntries = Object.entries(props.settings)
  const toast = useToast()

  const setNewConfig = useMemoizedFn((key: string, val: any) => {
    if (props.changeConfigStoreWithSettingPanelChange)
      runInAction(() => {
        props.configStore[key] = val
      })

    _setNewConfig({ ...newConfig, [key]: val })

    saveConfig()
  })
  const resetConfig = useMemoizedFn((key: string) => {
    delete newConfig[key]
    _setNewConfig({ ...newConfig })
    saveConfig()
  })

  // 保存相关
  const _saveConfig = useMemoizedFn(async () => {
    if (!props.autoSave) return
    console.log('saveConfig')
    if (props.saveInLocal) {
      switch (props.savePosition) {
        case 'localStorage': {
          localStorage[saveKey] = JSON.stringify(newConfig)
          break
        }
      }
    }
    if (props.onSave) await props.onSave(newConfig)
    toast({ title: '保存成功', status: 'success' })
  })
  const saveConfig = useCallback(
    debounce(_saveConfig, props.autoSaveTriggerMs),
    []
  )

  const baseConfigEntries: ConfigEntries = [],
    advConfigEntries: ConfigEntries = []

  configEntries.forEach(([key, _val]) => {
    const val = { ..._val, defaultValue: props.settings[key].defaultValue }
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
            resetConfig={resetConfig}
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
          resetConfig={resetConfig}
        />
      </ChakraProvider>
    )
})

const ConfigEntriesBox: FC<{
  config: ConfigEntries
  newConfig: Partial<UISettings>
  setNewConfig: (key: string, val: any) => void
  resetConfig: (key: string) => void
}> = (props) => {
  return (
    <Box>
      {props.config.map(([key, val]: [string, ConfigField<any>], i) => {
        const hasChange =
          !isUndefined(props.newConfig[key]) &&
          !isEqual(props.newConfig[key], val.defaultValue)
        console.log(
          `key ${key} hasChange`,
          hasChange,
          props.newConfig[key],
          val.defaultValue
        )
        return (
          <Box
            padding={'6px 8px'}
            backgroundColor={i % 2 == 0 ? 'blackAlpha.50' : 'white'}
            className="row"
            role="group"
            key={i}
          >
            <Flex gap={'12px'}>
              <Center
                textAlign={'center'}
                width={140}
                whiteSpace={'pre-wrap'}
                color={hasChange && 'blue'}
              >
                {val.label ?? key}:
              </Center>
              <Box flex={1}>
                <Flex gap={'12px'}>
                  <Center flex={1}>
                    <ConfigRowAction
                      config={val}
                      onChange={(v) => {
                        props.setNewConfig(key, v)
                      }}
                      newVal={(props.newConfig as any)[key]}
                    />
                  </Center>
                  <Center
                    opacity={0}
                    transition={'ease-in-out'}
                    _groupHover={hasChange && { opacity: 1 }}
                  >
                    <Button
                      isDisabled={!(props.newConfig as any)[key]}
                      colorScheme="red"
                      height={'24px'}
                      size={'sm'}
                      onClick={() => {
                        props.resetConfig(key)
                      }}
                    >
                      重置
                    </Button>
                  </Center>
                </Flex>
                {val.desc && (
                  <Box mt={'2px'} flex={1} fontSize={'12px'} color={'blue.500'}>
                    {val.desc}
                  </Box>
                )}
              </Box>
            </Flex>
          </Box>
        )
      })}
    </Box>
  )
}

const ConfigRowAction = (props: {
  config: ConfigField<any>
  onChange: (v: any) => void
  newVal: any
}) => {
  let val = props.config.defaultValue
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
      height={'24px'}
      fontSize={'14px'}
      px={'8px'}
      value={props.newVal ?? val}
      onChange={(e) => {
        props.onChange(e.target.value)
      }}
    />
  )
}

const saveKey = '__settingPanel_config_save'
const UIComponent: FC<Props> = (props) => {
  let [isLoading, setLoading] = useState(!!props.onInitLoadConfig)
  let [savedConfig, setSavedConfig] = useState<Partial<BaseConfig>>()
  useOnce(async () => {
    let savedConfig: Props['configStore'] = {}
    if (props.saveInLocal) {
      switch (props.savePosition) {
        case 'localStorage': {
          savedConfig = JSON.parse(localStorage[saveKey] || '{}')
          break
        }
      }
    }
    if (props.onInitLoadConfig)
      savedConfig = await props.onInitLoadConfig(savedConfig)

    runInAction(() => {
      Object.entries(savedConfig).forEach(([key, val]) => {
        props.configStore[key] = val
      })
    })
    setSavedConfig(savedConfig)
    setLoading(false)
  })

  return (
    <LoadingContainer isLoading={isLoading}>
      <SettingPanel {...props} savedConfig={savedConfig} />
    </LoadingContainer>
  )
}
export default UIComponent
