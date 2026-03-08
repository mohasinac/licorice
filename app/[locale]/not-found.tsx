import { Leaf, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";

export default function LocaleNotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="max-w-lg space-y-8 text-center">
        {/* Decorative 404 */}
        <div className="relative inline-flex items-center justify-center">
          <span className="font-heading text-primary/10 text-[120px] leading-none font-bold select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-primary/10 rounded-full p-5">
              <Leaf className="text-primary h-12 w-12" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="font-heading text-foreground text-3xl font-semibold">Page not found</h1>
          <p className="text-foreground/60 mx-auto max-w-sm text-sm leading-relaxed">
            The page you're looking for has moved, been removed, or may never have existed. Let's
            get you back on track.
          </p>
        </div>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/">
            <Button variant="primary" size="md" className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Button>
          </Link>
          <Link href="/shop">
            <Button variant="outline" size="md" className="w-full sm:w-auto">
              Browse products
            </Button>
          </Link>
        </div>

        {/* Quick links */}
        <div className="border-border/50 space-y-2 border-t pt-6">
          <p className="text-foreground/40 text-xs font-medium tracking-wider uppercase">
            Popular pages
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm">
            {[
              { href: "/concern", label: "Skin Concerns" },
              { href: "/ingredients", label: "Ingredients" },
              { href: "/blog", label: "Blog" },
              { href: "/contact", label: "Contact" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-primary underline-offset-2 hover:underline"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
