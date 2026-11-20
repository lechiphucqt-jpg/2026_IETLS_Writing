import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownReportProps {
  content: string;
}

export function MarkdownReport({ content }: MarkdownReportProps) {
  return (
    <div className="space-y-4 text-[15px] leading-relaxed text-slate-800">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h3: ({ children }) => (
            <h3 className="mt-6 first:mt-0 border-b border-slate-200 pb-2 font-serif text-lg font-semibold text-slate-900">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="mt-4 text-sm font-semibold text-slate-900">{children}</h4>
          ),
          p: ({ children }) => <p className="my-2.5 text-slate-700">{children}</p>,
          ul: ({ children }) => (
            <ul className="my-2.5 list-disc space-y-1.5 pl-5 text-slate-700">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2.5 list-decimal space-y-1.5 pl-5 text-slate-700">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900">{children}</strong>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-5 border-slate-200" />,
          code: ({ children }) => (
            <code className="rounded bg-amber-50 px-1.5 py-0.5 font-mono text-xs font-medium text-amber-900 border border-amber-200">
              {children}
            </code>
          ),
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="w-full min-w-[620px] border-collapse text-left text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-200">{children}</tbody>
          ),
          tr: ({ children }) => <tr className="align-top hover:bg-slate-50/60">{children}</tr>,
          th: ({ children }) => <th className="px-3.5 py-2.5 font-semibold">{children}</th>,
          td: ({ children }) => (
            <td className="px-3.5 py-3 text-slate-700 leading-relaxed">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
