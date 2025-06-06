import remarkGfm from 'remark-gfm'

export const mdxOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [],
  },
}

export const mdxGridComponents = {
  p: (props: React.PropsWithChildren) => {
    return <p className="mb-0">{props.children}</p>
  },
  table: (props: React.PropsWithChildren) => {
    return <table className="table-auto">{props.children}</table>
  },
  th: (props: React.PropsWithChildren) => {
    return (
      <th className="text-center font-semibold text-nowrap text-slate-900">
        {props.children}
      </th>
    )
  },
  td: (props: React.PropsWithChildren) => {
    return <td className="text-center text-slate-800">{props.children}</td>
  },
  img: (props: React.PropsWithChildren) => {
    return <img className="mx-auto" alt="" {...props} />
  },
}
