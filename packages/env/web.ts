import { createElement } from '@pkgs/utils/src/utils'
import { isBoolean, isNumber, isString } from 'lodash-es'
import { getEnv } from './env'

export function getEnvConfigurePanel() {
  let handleOnChange = (key: string, val: any, isClear?: boolean) => {
    let cover_env = JSON.parse(localStorage['cover_env'] || `{}`)
    if (isClear) delete cover_env[key]
    else cover_env[key] = val
    localStorage['cover_env'] = JSON.stringify(cover_env)
  }

  const rootEl = createElement('div', {
    className: 'env-configure-panel',
  })

  Object.entries(getEnv()).map(([key, val]) => {
    let renderInput = (): HTMLElement => {
      if (isBoolean(val))
        return createElement<HTMLInputElement>('input', {
          type: 'checkbox',
          onchange(e: any) {
            handleOnChange(key, e.target.checked)
          },
          defaultChecked: val,
        })
      if (isString(val) || isNumber(val)) {
        // const isnumber = isNumber(val)
        return createElement<HTMLInputElement>('input', {
          onkeyup(e: any) {
            const val = e.target.value
            handleOnChange(key, val)
          },
          defaultValue: val + '',
        })
      }
      return createElement('div', { innerText: 'not support' }) as HTMLElement
    }

    const leftEl = createElement('div', {
        style: 'flex: 0 0 16%',
        innerText: `${key}:`,
      }),
      centerEl = createElement('div', {
        style: 'flex:1',
      }),
      resetEl = createElement('button', {
        innerText: 'reset',
        onclick() {
          handleOnChange(key, null, true)
          location.reload()
        },
      })

    centerEl.appendChild(renderInput())

    const rowEl = createElement('div', {
      className: 'configure-row',
      style: 'display:flex',
    })
    rowEl.appendChild(leftEl)
    rowEl.appendChild(centerEl)
    rowEl.appendChild(resetEl)

    rootEl.appendChild(rowEl)
  })

  return rootEl
}

let modalEl: HTMLElement
export function showEnvConfigureModal() {
  if (!modalEl) {
    const panel = getEnvConfigurePanel()
    modalEl = createElement('div', {
      className: 'env-configure-modal',
      style:
        'position: fixed;top: 50%;left: 50%;z-index: 9999;padding: 24px 12px;background-color: #fff;border-radius: 4px;box-shadow: rgb(0 0 0 / 47%) 0px 2px 4px;transform: translate(-50%,-50%);',
    })
    const closeBtn = createElement('div', {
      className: 'env-configure-modal',
      style:
        'position: absolute;top: 4px;right: 4px;width: 20px;line-height: 20px;text-align: center;',
      innerText: 'x',
      onclick: () => (modalEl.style.visibility = 'hidden'),
    })

    ;(panel as any).style =
      'display: flex; flex-direction: column; gap: 4px;width: 300px;'
    modalEl.appendChild(panel)
    modalEl.appendChild(closeBtn)
    document.body.appendChild(modalEl)
  } else {
    modalEl.style.visibility = 'visible'
  }
}
