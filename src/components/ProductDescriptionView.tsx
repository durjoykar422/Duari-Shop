import React from 'react';
import {
  CheckCircle2,
  Sparkles,
  Package,
  ShieldCheck,
  Truck,
  Info,
  ChevronDown,
  ChevronUp,
  Flame,
  Star,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface ProductDescriptionViewProps {
  content: string;
  lang?: 'en' | 'bn';
  mode?: 'full' | 'compact' | 'landing';
  maxCompactLines?: number;
}

export const ProductDescriptionView: React.FC<ProductDescriptionViewProps> = ({
  content,
  lang = 'bn',
  mode = 'full',
  maxCompactLines = 4,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(mode !== 'compact');

  if (!content || !content.trim()) {
    return (
      <div className="py-4 text-xs sm:text-sm text-slate-400 italic">
        {lang === 'bn'
          ? 'এই পণ্যের কোন বিস্তারিত বিবরণ এখনও যোগ করা হয়নি।'
          : 'No detailed description available for this product yet.'}
      </div>
    );
  }

  // Helper to parse inline markdown (bold, italic, code, links, strikethrough, html tags)
  const renderInlineFormatted = (text: string): React.ReactNode => {
    // Regex matches bold (** or __ or <b> or <strong>), italic (* or _ or <i> or <em>), strike (~~ or <s> or <del>), code (`...`), and markdown links [text](url)
    const regex = /(\*\*[^\n*]+?\*\*|__[^\n_]+?__|<b>[\s\S]*?<\/b>|<strong>[\s\S]*?<\/strong>|\*[^\n*]+?\*|_[^\n_]+?_|<i>[\s\S]*?<\/i>|<em>[\s\S]*?<\/em>|~~[^\n~]+?~~|<s>[\s\S]*?<\/s>|<del>[\s\S]*?<\/del>|`[^`]+?`|\[[^\n\]]+?\]\([^\n)]+?\))/gi;

    const parts = text.split(regex);

    return parts.map((part, i) => {
      if (!part) return null;

      // Bold: **text** or __text__ or <b>...</b> or <strong>...</strong>
      if ((part.startsWith('**') && part.endsWith('**') && part.length >= 4) || (part.startsWith('__') && part.endsWith('__') && part.length >= 4)) {
        return (
          <strong key={i} className="font-extrabold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (/^<b>[\s\S]*<\/b>$/i.test(part)) {
        return (
          <strong key={i} className="font-extrabold text-slate-900">
            {part.slice(3, -4)}
          </strong>
        );
      }
      if (/^<strong>[\s\S]*<\/strong>$/i.test(part)) {
        return (
          <strong key={i} className="font-extrabold text-slate-900">
            {part.slice(8, -9)}
          </strong>
        );
      }

      // Italic: *text* or _text_ or <i>...</i> or <em>...</em>
      if ((part.startsWith('*') && part.endsWith('*') && part.length >= 2) || (part.startsWith('_') && part.endsWith('_') && part.length >= 2)) {
        return (
          <em key={i} className="italic text-slate-800 font-medium">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (/^<i>[\s\S]*<\/i>$/i.test(part)) {
        return (
          <em key={i} className="italic text-slate-800 font-medium">
            {part.slice(3, -4)}
          </em>
        );
      }
      if (/^<em>[\s\S]*<\/em>$/i.test(part)) {
        return (
          <em key={i} className="italic text-slate-800 font-medium">
            {part.slice(4, -5)}
          </em>
        );
      }

      // Strike: ~~text~~ or <s>...</s> or <del>...</del>
      if (part.startsWith('~~') && part.endsWith('~~') && part.length >= 4) {
        return (
          <del key={i} className="line-through text-slate-400">
            {part.slice(2, -2)}
          </del>
        );
      }
      if (/^<s>[\s\S]*<\/s>$/i.test(part)) {
        return (
          <del key={i} className="line-through text-slate-400">
            {part.slice(3, -4)}
          </del>
        );
      }
      if (/^<del>[\s\S]*<\/del>$/i.test(part)) {
        return (
          <del key={i} className="line-through text-slate-400">
            {part.slice(5, -6)}
          </del>
        );
      }

      // Code: `code`
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-slate-100 text-[#5b32a3] font-mono text-xs font-semibold"
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      // Links: [title](url)
      const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (linkMatch) {
        return (
          <a
            key={i}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline font-semibold hover:text-blue-800"
          >
            {linkMatch[1]}
          </a>
        );
      }

      return part;
    });
  };

  // Check if line is a table row
  const isTableRow = (line: string) => {
    const trimmed = line.trim();
    return trimmed.startsWith('|') && trimmed.endsWith('|');
  };

  const isTableDivider = (line: string) => {
    const trimmed = line.trim();
    return (
      trimmed.startsWith('|') &&
      trimmed.includes('---') &&
      trimmed.endsWith('|')
    );
  };

  // Parse text into structured blocks
  const lines = content.split('\n');
  const blocks: Array<
    | { type: 'h1'; text: string }
    | { type: 'h2'; text: string }
    | { type: 'h3'; text: string }
    | { type: 'h4'; text: string }
    | { type: 'quote'; text: string }
    | { type: 'callout'; text: string; icon?: string }
    | { type: 'hr' }
    | { type: 'bulletList'; items: string[] }
    | { type: 'checkList'; items: string[] }
    | { type: 'numList'; items: string[] }
    | { type: 'table'; headers: string[]; rows: string[][] }
    | { type: 'paragraph'; text: string }
  > = [];

  let currentBullets: string[] = [];
  let currentChecks: string[] = [];
  let currentNums: string[] = [];
  let currentTableRows: string[] = [];

  const flushLists = () => {
    if (currentBullets.length > 0) {
      blocks.push({ type: 'bulletList', items: [...currentBullets] });
      currentBullets = [];
    }
    if (currentChecks.length > 0) {
      blocks.push({ type: 'checkList', items: [...currentChecks] });
      currentChecks = [];
    }
    if (currentNums.length > 0) {
      blocks.push({ type: 'numList', items: [...currentNums] });
      currentNums = [];
    }
    if (currentTableRows.length > 0) {
      // Process table
      const parsedRows = currentTableRows
        .filter((r) => !isTableDivider(r))
        .map((r) =>
          r
            .split('|')
            .slice(1, -1)
            .map((cell) => cell.trim())
        );

      if (parsedRows.length > 0) {
        const headers = parsedRows[0];
        const rows = parsedRows.slice(1);
        blocks.push({ type: 'table', headers, rows });
      }
      currentTableRows = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushLists();
      continue;
    }

    // Markdown Tables
    if (isTableRow(trimmed)) {
      currentTableRows.push(trimmed);
      continue;
    } else if (currentTableRows.length > 0) {
      flushLists();
    }

    // Headings (Markdown # or HTML tags)
    const h1Html = trimmed.match(/^<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Html) {
      flushLists();
      blocks.push({ type: 'h1', text: h1Html[1].trim() });
      continue;
    }
    const h2Html = trimmed.match(/^<h2[^>]*>([\s\S]*?)<\/h2>/i);
    if (h2Html) {
      flushLists();
      blocks.push({ type: 'h2', text: h2Html[1].trim() });
      continue;
    }
    const h3Html = trimmed.match(/^<h3[^>]*>([\s\S]*?)<\/h3>/i);
    if (h3Html) {
      flushLists();
      blocks.push({ type: 'h3', text: h3Html[1].trim() });
      continue;
    }

    if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
      flushLists();
      blocks.push({ type: 'h1', text: trimmed.slice(2).trim() });
      continue;
    }
    if (trimmed.startsWith('## ') && !trimmed.startsWith('### ')) {
      flushLists();
      blocks.push({ type: 'h2', text: trimmed.slice(3).trim() });
      continue;
    }
    if (trimmed.startsWith('### ') && !trimmed.startsWith('#### ')) {
      flushLists();
      blocks.push({ type: 'h3', text: trimmed.slice(4).trim() });
      continue;
    }
    if (trimmed.startsWith('#### ')) {
      flushLists();
      blocks.push({ type: 'h4', text: trimmed.slice(5).trim() });
      continue;
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      flushLists();
      blocks.push({ type: 'hr' });
      continue;
    }

    // Callout / Quotes
    if (trimmed.startsWith('>')) {
      flushLists();
      blocks.push({ type: 'quote', text: trimmed.replace(/^>\s*/, '').trim() });
      continue;
    }

    // Checklist (✓ or [x] or ✅)
    if (
      trimmed.startsWith('✓') ||
      trimmed.startsWith('✅') ||
      trimmed.startsWith('- [x]') ||
      trimmed.startsWith('- [ ]')
    ) {
      const clean = trimmed
        .replace(/^✓\s*/, '')
        .replace(/^✅\s*/, '')
        .replace(/^- \[[x ]\]\s*/, '');
      currentChecks.push(clean);
      continue;
    }

    // Bullet Lists (- or * or •)
    if (
      trimmed.startsWith('- ') ||
      trimmed.startsWith('* ') ||
      trimmed.startsWith('• ')
    ) {
      const itemText = trimmed.slice(2).trim();
      currentBullets.push(itemText);
      continue;
    }

    // Numbered lists (1. or 2.)
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      currentNums.push(numMatch[2]);
      continue;
    }

    // Callout with special emoji start
    if (
      trimmed.startsWith('📌') ||
      trimmed.startsWith('💡') ||
      trimmed.startsWith('⚠️') ||
      trimmed.startsWith('🔥') ||
      trimmed.startsWith('⚡')
    ) {
      flushLists();
      blocks.push({ type: 'callout', text: trimmed });
      continue;
    }

    // Standard Paragraph
    flushLists();
    blocks.push({ type: 'paragraph', text: trimmed });
  }

  flushLists();

  // If in compact mode and not expanded, render truncated summary
  if (mode === 'compact') {
    return (
      <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
        <div
          className={
            !isExpanded ? `line-clamp-${maxCompactLines} overflow-hidden` : ''
          }
        >
          {blocks.slice(0, 5).map((block, idx) => {
            if (block.type === 'paragraph') {
              return (
                <p key={idx} className="mb-1.5 text-slate-600">
                  {renderInlineFormatted(block.text)}
                </p>
              );
            }
            if (block.type === 'bulletList' || block.type === 'checkList') {
              return (
                <ul key={idx} className="space-y-1 mb-2">
                  {block.items.slice(0, 3).map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                      <span>{renderInlineFormatted(item)}</span>
                    </li>
                  ))}
                </ul>
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="product-rich-description space-y-5 text-slate-800 font-sans">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'h1':
            return (
              <div
                key={idx}
                className="pt-5 first:pt-0 border-b border-indigo-100/90 pb-3 flex items-center gap-2.5 sm:gap-3"
              >
                <div className="w-2 h-6 sm:h-7 rounded-full bg-gradient-to-b from-[#5b32a3] via-indigo-600 to-purple-600 shrink-0 shadow-xs" />
                <h1 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  {renderInlineFormatted(block.text)}
                </h1>
              </div>
            );

          case 'h2':
            return (
              <div
                key={idx}
                className="pt-4 first:pt-0 border-b border-slate-100 pb-2.5 flex items-center gap-2.5"
              >
                <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-[#5b32a3] to-indigo-600 shrink-0" />
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  {renderInlineFormatted(block.text)}
                </h2>
              </div>
            );

          case 'h3':
            return (
              <div key={idx} className="pt-3 first:pt-0 flex items-center gap-2">
                <span className="w-2 h-2 rounded-sm bg-blue-600 shrink-0" />
                <h3 className="text-sm sm:text-base font-extrabold text-slate-800">
                  {renderInlineFormatted(block.text)}
                </h3>
              </div>
            );

          case 'h4':
            return (
              <h4
                key={idx}
                className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 pt-2"
              >
                {renderInlineFormatted(block.text)}
              </h4>
            );

          case 'hr':
            return (
              <hr
                key={idx}
                className="my-4 border-t border-slate-200/80 dashed"
              />
            );

          case 'quote':
            return (
              <blockquote
                key={idx}
                className="relative pl-4 pr-3 py-2.5 my-2 border-l-4 border-indigo-500 bg-indigo-50/60 rounded-r-xl text-xs sm:text-sm text-slate-700 italic shadow-xs"
              >
                <div className="font-medium">
                  {renderInlineFormatted(block.text)}
                </div>
              </blockquote>
            );

          case 'callout':
            return (
              <div
                key={idx}
                className="p-3 sm:p-3.5 my-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-950 text-xs sm:text-sm flex items-start gap-2.5 shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="font-semibold leading-relaxed">
                  {renderInlineFormatted(block.text)}
                </div>
              </div>
            );

          case 'checkList':
            return (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-3"
              >
                {block.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all text-xs sm:text-sm text-slate-800 group"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium leading-relaxed">
                      {renderInlineFormatted(item)}
                    </span>
                  </div>
                ))}
              </div>
            );

          case 'bulletList':
            return (
              <ul key={idx} className="space-y-2 my-3 pl-1">
                {block.items.map((item, itemIdx) => (
                  <li
                    key={itemIdx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                    <span className="flex-1">
                      {renderInlineFormatted(item)}
                    </span>
                  </li>
                ))}
              </ul>
            );

          case 'numList':
            return (
              <ol key={idx} className="space-y-2 my-3 pl-1">
                {block.items.map((item, itemIdx) => (
                  <li
                    key={itemIdx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed"
                  >
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      {itemIdx + 1}
                    </span>
                    <span className="flex-1">
                      {renderInlineFormatted(item)}
                    </span>
                  </li>
                ))}
              </ol>
            );

          case 'table':
            return (
              <div
                key={idx}
                className="my-4 overflow-hidden rounded-2xl border border-slate-200 shadow-xs bg-white"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    {block.headers.length > 0 && (
                      <thead>
                        <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-800 font-bold">
                          {block.headers.map((h, hIdx) => (
                            <th key={hIdx} className="px-4 py-3 font-extrabold">
                              {renderInlineFormatted(h)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                    )}
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {block.rows.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className="hover:bg-slate-50/70 transition-colors odd:bg-white even:bg-slate-50/40"
                        >
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className={`px-4 py-2.5 text-slate-700 ${
                                cIdx === 0
                                  ? 'font-bold text-slate-900 bg-slate-50/30'
                                  : ''
                              }`}
                            >
                              {renderInlineFormatted(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );

          case 'paragraph':
          default:
            return (
              <p
                key={idx}
                className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal"
              >
                {renderInlineFormatted(block.text)}
              </p>
            );
        }
      })}
    </div>
  );
};
