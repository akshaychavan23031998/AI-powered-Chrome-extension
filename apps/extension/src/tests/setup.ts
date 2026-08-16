import {
  vi,
} from "vitest";

Object.defineProperty(
  HTMLElement.prototype,
  "scrollIntoView",
  {
    configurable:
      true,

    value:
      vi.fn(),
  },
);

Object.defineProperty(
  HTMLElement.prototype,
  "getBoundingClientRect",
  {
    configurable:
      true,

    value:
      function () {
        return {
          width:
            100,

          height:
            30,

          top:
            0,

          right:
            100,

          bottom:
            30,

          left:
            0,

          x:
            0,

          y:
            0,

          toJSON:
            () => ({}),
        };
      },
  },
);