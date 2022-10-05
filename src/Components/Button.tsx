// import Link from "next/link";
import { clsx, ClassValue } from "clsx";

export function Button({
  href,
  className,
  ...props
}: {
  href: string;
  className?: ClassValue;
  // the rest of the props
  children: React.ReactNode;
}) {
  const classNameNew = clsx(
    "inline-flex justify-center rounded-2xl bg-blue-600 p-4 text-base font-semibold text-white hover:bg-blue-500 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:text-white/70",
    className
  );

  return <button className={classNameNew} {...props} />;
}
