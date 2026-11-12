import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./code-block";

/** GFM markdown renderer styled for the NetLab dark theme. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="min-w-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: (props) => (
            <h2
              {...props}
              className="mt-10 border-b border-line pb-2 font-display text-2xl font-semibold tracking-tight text-ink first:mt-0"
            />
          ),
          h3: (props) => (
            <h3
              {...props}
              className="mt-8 font-display text-xl font-semibold tracking-tight text-ink"
            />
          ),
          p: (props) => (
            <p {...props} className="mt-4 leading-relaxed text-static first:mt-0" />
          ),
          a: (props) => (
            <a
              {...props}
              className="text-signal underline decoration-signal/40 underline-offset-2 transition-colors hover:decoration-signal"
            />
          ),
          strong: (props) => (
            <strong {...props} className="font-semibold text-ink" />
          ),
          ul: (props) => (
            <ul
              {...props}
              className="mt-4 list-disc space-y-1.5 pl-5 text-static marker:text-signal/60"
            />
          ),
          ol: (props) => (
            <ol
              {...props}
              className="mt-4 list-decimal space-y-1.5 pl-5 text-static marker:font-mono marker:text-signal/70"
            />
          ),
          blockquote: (props) => (
            <blockquote
              {...props}
              className="mt-5 rounded-r-md border-l-2 border-signal/60 bg-signal/5 py-2.5 pl-4 pr-3 text-static italic"
            />
          ),
          hr: (props) => <hr {...props} className="my-8 border-line" />,
          table: (props) => (
            <div className="my-6 overflow-x-auto rounded-card border border-line">
              <table
                {...props}
                className="w-full border-collapse text-sm [&_td]:border-line [&_td]:border-t [&_th]:border-line [&_th]:border-b"
              />
            </div>
          ),
          th: (props) => (
            <th
              {...props}
              className="bg-rack px-3.5 py-2.5 text-left font-mono text-[11px] uppercase tracking-wider text-static"
            />
          ),
          td: (props) => (
            <td {...props} className="px-3.5 py-2.5 align-top text-static" />
          ),
          code: ({ className, children, ...rest }) => {
            // Block code is styled by the CodeBlock wrapper (pre).
            if (/language-/.test(className ?? "")) {
              return (
                <code {...rest} className="font-mono text-[13px]">
                  {children}
                </code>
              );
            }
            return (
              <code
                {...rest}
                className="rounded-md bg-panel px-1.5 py-0.5 font-mono text-[13px] text-signal"
              >
                {children}
              </code>
            );
          },
          pre: CodeBlock,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
