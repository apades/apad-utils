import { createElement } from '../dom'

export function inputFile(accept = '*') {
  return new Promise<File>((resolve) => {
    const input = createElement('input', {
      type: 'file',
      accept,
      onchange: () => {
        if (input.files) {
          resolve(input.files[0])
        }
      },
    })

    input.click()
  })
}

export async function readTextFromFile(file: File) {
  const fileReader = new FileReader()
  fileReader.readAsText(file)
  const text = await new Promise<string>((resolve) => {
    fileReader.onload = () => {
      resolve(fileReader.result as string)
    }
  })
  return text
}
