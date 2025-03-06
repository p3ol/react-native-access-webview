import { type ComponentPropsWithoutRef, useContext } from 'react';

import { AccessContext } from '../contexts'

export interface RestrictedContentProps extends ComponentPropsWithoutRef<any> {
  /**
   * Optional unique paywall id. When released, the restricted content with the
   * corresponding id will be displayed.
   */
  id?: string;
}

const RestrictedContent = ({ id, children }: RestrictedContentProps) => {
  const { released } = useContext(AccessContext);

  if (
    (!id && released?.includes(true)) ||
    released?.includes(id || 'unknown')
  ) {
    return children;
  }
}

RestrictedContent.displayName = 'RestrictedContent';

export default RestrictedContent;
