import remarkGfm from 'remark-gfm'

export const mdxOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [],
  },
}

export const mdxComponents = {
  table: (props: React.PropsWithChildren) => {
    return (
      <table className="table-auto border-collapse border-spacing-4 border border-slate-400">
        {props.children}
      </table>
    )
  },
  th: (props: React.PropsWithChildren) => {
    return (
      <th className="text-nowrap border border-slate-300 p-4 font-semibold text-slate-900">
        {props.children}
      </th>
    )
  },
  td: (props: React.PropsWithChildren) => {
    return (
      <td className="border border-slate-300 p-4 text-slate-800">
        {props.children}
      </td>
    )
  },
}
