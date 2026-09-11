// The header every section wears, and the reason they read as one document rather than
// as seven pages: the same two elements, in the same order, in the same place.
//
//   EYEBROW      the brochure's own line for this chapter
//   HEADLINE     the title, in display type
//
// There is no deck counter and no rule under the headline. A visitor moving through a
// sales presentation is not counting pages, and neither the tally nor the hairline told
// anyone anything the eyebrow and the headline were not already saying.
//
// Each element carries the marker the director animates it by, so a section that uses
// this component needs no animation code of its own.

export function SectionHead({
  eyebrow,
  headline,
  lede,
  className = '',
  align = 'left',
  compact = false,
  compactBelow = null,
}) {
  return (
    <header className={`flex flex-col ${align === 'center' ? 'items-center text-center' : ''} ${className}`}>
      {eyebrow ? (
        <span className="eyebrow mb-[0.7em] text-w-gold">{eyebrow}</span>
      ) : null}

      {/* `compact` is for a head inside a panel rather than on the open screen — the
          Location map's list, where a full display headline would take half the panel.
          `compactBelow` is the same idea per viewport: a screen that has the room for a
          display headline on a desktop and does not on a phone. */}
      <h1
        data-headline
        className={`font-extralight leading-[1.1] tracking-[0.05em] text-w-cream ${
          compact ? 'text-title' : 'text-headline'
        } ${compactBelow === 'lg' ? 'max-lg:text-title' : ''}`}
      >
        {headline.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h1>

      {lede ? (
        <p
          data-stagger
          className="mt-[1.4em] max-w-[46ch] text-body leading-[1.6] text-w-cream/65"
        >
          {lede}
        </p>
      ) : null}
    </header>
  );
}
