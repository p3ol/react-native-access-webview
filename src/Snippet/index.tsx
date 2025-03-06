import { type ComponentPropsWithoutRef, useContext } from 'react';

import { AccessContext } from '../contexts'

export interface SnippetProps extends ComponentPropsWithoutRef<any> {
  /**
   * Optional unique paywall id. When released, the snippet with the
   * corresponding id will be hidden.
   */
  id?: string;
}

const Snippet = ({ id, children }: SnippetProps) => {
  const { released } = useContext(AccessContext);

  if (
    (!id && released?.includes(true)) ||
    released?.includes(id || 'unknown')
  ) {
    return null;
  }

  return children;
}

Snippet.displayName = 'Snippet';

export default Snippet;
