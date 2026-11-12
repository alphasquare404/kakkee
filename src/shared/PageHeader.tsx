import type { ReactNode } from 'react';

export interface PageHeaderProps {
  readonly eyebrow?: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly count?: string;
  readonly leading?: ReactNode;
  readonly children?: ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  count,
  leading,
  children,
}: PageHeaderProps) {
  return (
    <header className={`page-header${leading ? ' has-leading' : ''}`}>
      {leading ? <div className="page-header-leading">{leading}</div> : null}
      <div className="page-heading">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <div className="page-title-row">
          <h1>{title}</h1>
          {count ? <span className="page-count">{count}</span> : null}
        </div>
        {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
      </div>
      {children ? <div className="page-header-actions">{children}</div> : null}
    </header>
  );
}
