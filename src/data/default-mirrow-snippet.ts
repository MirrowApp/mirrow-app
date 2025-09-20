export const DEFAULT_MIRROW_SNIPPET = String.raw`svg {
  // Internal coordinate space: viewBox x y w h
  box: (0, 0, 200, 200)

  // Rendered size on the page
  size: (200px, 200px)

  // How to map box to size
  preserve: (xMidYMid, meet)

  circle {
    id: "pulse"
    at: (100, 100)
    r: 40
    fill: "hotpink"

    animate {
      prop: "r"
      from: 40
      to: 60
      dur: 2s
      repeat: indefinite
    }
  }

  @hover, @active {
    #pulse {
      cy: 150px
      r: 60px
    }
  }
}
`;
