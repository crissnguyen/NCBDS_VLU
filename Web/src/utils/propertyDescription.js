const SECTION_HEADINGS = new Set(['tổng quan', 'thông tin chi tiết', 'vị trí', 'vị trí và kết nối', 'thiết kế', 'nội thất', 'thiết kế và nội thất', 'tiện ích', 'tiện ích xung quanh', 'pháp lý', 'liên hệ', 'thông tin liên hệ']);

// A small text-only renderer: no imported HTML, links, scripts or inline styles.
export function propertyDescriptionBlocks(value) {
  const blocks = [];
  const lines = String(value || '').replace(/\r\n?/g, '\n').split('\n');
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { blocks.push({ type: 'break' }); continue; }
    const markdownHeading = line.match(/^#{1,6}\s+(.+)$/);
    const uppercaseHeading = line.length <= 100 && /\p{L}/u.test(line) && line === line.toLocaleUpperCase('vi-VN') && line !== line.toLocaleLowerCase('vi-VN');
    const namedHeading = SECTION_HEADINGS.has(line.replace(/:$/, '').toLocaleLowerCase('vi-VN'));
    if (markdownHeading || uppercaseHeading || namedHeading) {
      blocks.push({ type: 'heading', text: markdownHeading?.[1] || line });
      continue;
    }
    const bullet = line.match(/^[-*•]\s+(.+)$/);
    const numbered = line.match(/^(\d+)[.)]\s+(.+)$/);
    if (bullet || numbered) {
      const type = bullet ? 'unordered-list' : 'ordered-list';
      const last = blocks.at(-1);
      const text = bullet?.[1] || numbered[2];
      if (last?.type === type) last.items.push(text);
      else blocks.push({ type, items: [text], start: numbered ? Number(numbered[1]) : undefined });
      continue;
    }
    const last = blocks.at(-1);
    if (last?.type === 'paragraph') last.text += `\n${raw}`;
    else blocks.push({ type: 'paragraph', text: raw });
  }
  return blocks.filter(block => block.type !== 'break');
}
