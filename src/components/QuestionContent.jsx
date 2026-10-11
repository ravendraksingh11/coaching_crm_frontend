const IMAGE_PATTERN = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g;
const INLINE_PATTERN = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;

function inlineParts(line, keyPrefix) {
  const parts = [];
  let cursor = 0;
  let match;
  let index = 0;
  IMAGE_PATTERN.lastIndex = 0;
  while ((match = IMAGE_PATTERN.exec(line))) {
    if (match.index > cursor) parts.push(...textParts(line.slice(cursor, match.index), `${keyPrefix}-${index++}`));
    parts.push(<img className="question-content-image" key={`${keyPrefix}-image-${index++}`} src={match[2]} alt={match[1] || "Question illustration"} loading="lazy" />);
    cursor = IMAGE_PATTERN.lastIndex;
  }
  if (cursor < line.length) parts.push(...textParts(line.slice(cursor), `${keyPrefix}-${index}`));
  return parts;
}

function textParts(text, keyPrefix) {
  return text.split(INLINE_PATTERN).filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={`${keyPrefix}-${index}`}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={`${keyPrefix}-${index}`}>{part.slice(1, -1)}</em>;
    return <span key={`${keyPrefix}-${index}`}>{part}</span>;
  });
}

export default function QuestionContent({ content, as: Tag = "div", className = "" }) {
  const lines = String(content || "").split(/\r?\n/);
  return <Tag className={`question-content ${className}`.trim()}>{lines.map((line, index) => {
    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    const listItem = line.match(/^[-*+]\s+(.*)$/);
    const children = inlineParts(heading?.[2] ?? listItem?.[1] ?? line, `line-${index}`);
    if (heading) {
      const H = `h${heading[1].length}`;
      return <H key={index}>{children}</H>;
    }
    if (listItem) return <div className="question-content-list-item" key={index}>{children}</div>;
    return <p key={index}>{children.length ? children : <br />}</p>;
  })}</Tag>;
}
