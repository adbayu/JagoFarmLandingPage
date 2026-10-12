import { useLanguage } from "../i18n.jsx";
import { localizedHref } from "../routing.js";

export function Link({ to, children, className = "", ...props }) {
  const { language } = useLanguage();
  const { onClick, target, download, ...anchorProps } = props;
  const href = localizedHref(to, language);

  function handleClick(event) {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
      event.currentTarget.hasAttribute("target") || event.currentTarget.hasAttribute("download")
    ) return;

    const destination = new URL(href, window.location.href);
    if (destination.origin !== window.location.origin) return;

    event.preventDefault();
    window.history.pushState(null, "", `${destination.pathname}${destination.search}${destination.hash}`);
    window.dispatchEvent(new Event("jagofarm:navigate"));
  }

  return <a {...anchorProps} className={className} href={href} target={target} download={download} onClick={handleClick}>{children}</a>;
}

export function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export function ButtonLink({ to, children, secondary = false, ...props }) {
  return <Link {...props} className={`button${secondary ? " secondary" : ""}`} to={to}>{children}<Arrow /></Link>;
}
