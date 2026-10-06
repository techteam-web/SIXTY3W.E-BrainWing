// Every icon in the application, drawn on the same 24-unit grid with the same hairline
// weight. They are inline SVG rather than a font or a library so they inherit
// currentColor and scale in `em` with whatever type they sit beside.

function Icon({ size = '1em', children, className = '', ...rest }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`shrink-0 ${className}`}
      {...rest}
    >
      {children}
    </svg>
  );
}

export const ArrowIcon = (p) => (
  <Icon {...p}>
    <path d="M4 12h15" />
    <path d="M13 6l6 6-6 6" />
  </Icon>
);

export const BackIcon = (p) => (
  <Icon {...p}>
    <path d="M20 12H5" />
    <path d="M11 6l-6 6 6 6" />
  </Icon>
);

export const MenuIcon = (p) => (
  <Icon {...p}>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h10" />
  </Icon>
);

// The house is the mark: one arch. Nothing in this app draws a generic home glyph.
export const HomeIcon = (p) => (
  <Icon {...p}>
    <path d="M5 20V10a7 7 0 0 1 14 0v10" />
    <path d="M3 20h18" />
  </Icon>
);

export const CloseIcon = (p) => (
  <Icon {...p}>
    <path d="M6 6l12 12" />
    <path d="M18 6L6 18" />
  </Icon>
);
