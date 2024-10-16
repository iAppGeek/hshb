import { ReactElement } from 'react'

import { GridPattern } from '@/components/GridPattern'

const TextSection = (props: { children: string | ReactElement }) => {
  return (
    <div className="col-span-2 p-3 md:col-span-1">
      <pre className="text-center">{props.children}</pre>
    </div>
  )
}

export const HighlightedTexts = async ({
  id,
  first,
  second,
}: {
  id: string
  first: string
  second: string
}) => {
  return (
    <div id={id} className="relative bg-slate-100 py-2 sm:py-6">
      <div className="text-slate-900/10">
        <GridPattern x="50%" patternTransform="translate(0 80)" />
      </div>

      <div className="m-4 grid grid-flow-row grid-cols-2">
        <TextSection>{first}</TextSection>
        <TextSection>{second}</TextSection>
      </div>
    </div>
  )
}
