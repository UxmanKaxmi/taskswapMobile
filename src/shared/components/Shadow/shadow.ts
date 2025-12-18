export const shadow = {
  sm: (color: string) => ({
    boxShadow: `0px 1px 3px ${color}`,
  }),
  md: (color: string) => ({
    boxShadow: `0px 4px 8px ${color}`,
  }),
  lg: (color: string) => ({
    boxShadow: `0px 8px 16px ${color}`,
  }),

  soft: (color: string) => ({
    boxShadow: `
      0px 2px 4px ${color},
      0px 1px 2px ${color}
    `,
  }),

  ambient: (color: string) => ({
    boxShadow: `
      0px 4px 12px ${color},
      0px 12px 24px ${color}
    `,
  }),

  raised: (color: string) => ({
    boxShadow: `
      0px 4px 6px ${color},
      0px 8px 16px ${color}
    `,
  }),

  high: (color: string) => ({
    boxShadow: `
      0px 8px 20px ${color},
      0px 16px 32px ${color}
    `,
  }),

  glow: (color: string) => ({
    boxShadow: `
      0px 0px 12px ${color},
      0px 4px 24px ${color}
    `,
  }),

  tint: (color: string) => ({
    boxShadow: `0px 4px 12px ${color}`,
  }),

  hard: (color: string) => ({
    boxShadow: `
      0px 6px 12px ${color},
      0px 12px 12px ${color}
    `,
  }),

  neo: () => ({
    boxShadow: `
      5px 5px 12px rgba(0,0,0,0.15),
      -5px -5px 12px rgba(255,255,255,0.6)
    `,
  }),
};
