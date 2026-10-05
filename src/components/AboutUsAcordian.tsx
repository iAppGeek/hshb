import { MDXRemote } from 'next-mdx-remote/rsc'

import { AccordionGroup } from '@/clientComponents/AccordionGroup'
import { AccordionItem } from '@/clientComponents/AccordionItem'
import { AccordianData } from '@/data/contentful'
import { mdxGridComponents, mdxOptions } from '@/data/mdxConfig'

type Props = { data: AccordianData }
export const AboutUsAcordian = (props: Props): React.JSX.Element => {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-4 sm:py-8 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-4xl divide-y divide-gray-900/10">
          <h2 className="text-2xl leading-10 font-bold tracking-tight text-gray-900">
            Want to know more?
          </h2>
          <AccordionGroup
            ids={props.data.map((d): string => d.id)}
            className="mt-6 space-y-3 divide-y divide-gray-900/10"
          >
            {props.data.map(
              (d): React.JSX.Element => (
                <AccordionItem key={d.id} id={d.id} title={d.title}>
                  <MDXRemote
                    options={mdxOptions}
                    source={d.body}
                    components={mdxGridComponents}
                  />
                </AccordionItem>
              ),
            )}
          </AccordionGroup>
        </div>
      </div>
    </div>
  )
}
