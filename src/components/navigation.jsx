export function Link({ to, children, className = "", ...props }) {
  return <a {...props} className={className} href={`#${to}`}>{children}</a>;
}

export function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export function ButtonLink({ to, children, secondary = false }) {
  return <Link className={`button${secondary ? " secondary" : ""}`} to={to}>{children}<Arrow /></Link>;
}
