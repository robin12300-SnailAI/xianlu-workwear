'use client';

import { useState } from 'react';

export default function ReadMore({
  children,
  previewText,
  maxLength = 200,
}: {
  children: string;
  previewText?: string;
  maxLength?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const displayText = expanded ? children : (previewText || children.slice(0, maxLength));

  return (
    <div>
      <p className="section-lead mt-4">
        {displayText}
        {!expanded && children.length > (previewText?.length || maxLength) && '\u2026'}
      </p>
      <button
        onClick={() => setExpanded(!expanded)}
        className="btn-primary mt-6 inline-flex items-center gap-1"
      >
        {expanded ? 'Show less' : 'Read more'} &raquo;
      </button>
    </div>
  );
}
