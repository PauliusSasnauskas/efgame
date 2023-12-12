import { ReactNode } from "react";

export default function KeyIcon({ name }: { name?: string | string[] }): JSX.Element {
  let renderKey = name

  if (typeof renderKey === 'string' && renderKey.startsWith('Key')) {
    renderKey = renderKey.substring(3)
  }
  if (typeof renderKey === 'object' && renderKey[0].startsWith('Numpad')) {
    renderKey = renderKey[0].substring(6)
  }
  if (typeof renderKey === 'object' && renderKey[0].startsWith('Digit')) {
    renderKey = renderKey[0].substring(5)
  }

  return <div className="m-key inline">{renderKey}</div>
}