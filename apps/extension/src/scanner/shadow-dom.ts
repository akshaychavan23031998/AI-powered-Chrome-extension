export const collectRoots = (
  root: Document | ShadowRoot = document,
): Array<Document | ShadowRoot> => {
  const roots: Array<Document | ShadowRoot> = [
    root,
  ];

  const visitRoot = (
    currentRoot: Document | ShadowRoot,
  ): void => {
    const elements =
      currentRoot.querySelectorAll("*");

    for (const element of elements) {
      if (element.shadowRoot) {
        roots.push(element.shadowRoot);

        visitRoot(element.shadowRoot);
      }
    }
  };

  visitRoot(root);

  return roots;
};

export const querySelectorAllDeep = (
  selector: string,
): Element[] => {
  const roots = collectRoots();

  const result: Element[] = [];

  for (const root of roots) {
    result.push(
      ...Array.from(
        root.querySelectorAll(selector),
      ),
    );
  }

  return result;
};