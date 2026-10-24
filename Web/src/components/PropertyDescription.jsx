import { propertyDescriptionBlocks } from '../utils/propertyDescription';

const inlineText = text => text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
  part.startsWith('**') && part.endsWith('**') ? <strong key={index}>{part.slice(2, -2)}</strong> : part);

export default function PropertyDescription({ value }) {
  return <div className="property-description">
    {propertyDescriptionBlocks(value).map((block, index) => {
      if (block.type === 'heading') return <h4 key={index}>{inlineText(block.text)}</h4>;
      if (block.type === 'unordered-list' || block.type === 'ordered-list') {
        const List = block.type === 'ordered-list' ? 'ol' : 'ul';
        return <List key={index} start={block.start}>{block.items.map((item, i) => <li key={i}>{inlineText(item)}</li>)}</List>;
      }
      return <p key={index}>{inlineText(block.text)}</p>;
    })}
  </div>;
}
