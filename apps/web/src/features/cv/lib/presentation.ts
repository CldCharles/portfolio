export function splitIntroduction(description: string): { lead: string; rest: string } {
  const sentences = description.trim().match(/.*?[.!?](?:\s+|$)|.+$/gs) ?? [];
  return { lead: sentences.slice(0, 2).join('').trim(), rest: sentences.slice(2).join('').trim() };
}
export function descriptionBlocks(description: string): { kind: 'paragraph' | 'list'; texts: string[] }[] {
  const blocks: { kind: 'paragraph' | 'list'; texts: string[] }[] = [];
  for (const line of description.split('\n').map(value => value.trim()).filter(Boolean)) {
    if (line.startsWith('• ')) {
      const previous = blocks.at(-1);
      if (previous?.kind === 'list') previous.texts.push(line.slice(2));
      else blocks.push({ kind: 'list', texts: [line.slice(2)] });
    } else blocks.push({ kind: 'paragraph', texts: [line] });
  }
  return blocks;
}
