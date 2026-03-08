// components/blog/BlogContent.tsx — Renders Tiptap HTML body with prose typography

import { sanitizeHtml } from "@/lib/utils";

interface BlogContentProps {
  html: string;
}

export function BlogContent({ html }: BlogContentProps) {
  return (
    <div
      className="prose prose-lg max-w-none
        prose-headings:font-heading prose-headings:text-foreground prose-headings:font-bold
        prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-2xl
        prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-xl
        prose-p:text-foreground/80 prose-p:leading-relaxed
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-strong:text-foreground
        prose-blockquote:border-primary/30 prose-blockquote:text-muted-foreground prose-blockquote:not-italic
        prose-img:rounded-xl prose-img:shadow-md
        prose-ul:text-foreground/80 prose-ol:text-foreground/80
        prose-li:marker:text-primary
        prose-pre:bg-foreground/5 prose-pre:rounded-xl prose-pre:text-sm
        prose-code:text-primary prose-code:font-normal prose-code:before:content-none prose-code:after:content-none"
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}
