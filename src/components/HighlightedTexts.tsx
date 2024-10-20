import { MDXRemote } from 'next-mdx-remote/rsc'

import { GridPattern } from '@/components/GridPattern'
import { mdxGridComponents, mdxOptions } from '@/data/mdxConfig'

const TextSection = (props: { text: string }) => {
  return (
    <div className="prose col-span-2 max-w-full p-3 text-center md:col-span-1">
      <MDXRemote
        options={mdxOptions}
        source={props.text}
        components={mdxGridComponents}
      />
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
        <TextSection text={first} />
        <TextSection text={second} />
      </div>
    </div>
  )
}
