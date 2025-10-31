import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="bg-black text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        {/* Brand Column */}
        <div className="space-y-4">
          <h4 className="font-bold text-white text-lg tracking-wider">HAYB</h4>
          <p className="text-gray-400">
            Barber-grade tools and care products.
          </p>
          <div className="flex space-x-4">
            <SocialIcon href="#" icon="twitter" />
            <SocialIcon href="#" icon="instagram" />
            <SocialIcon href="#" icon="facebook" />
          </div>
        </div>

        {/* Shop Column */}
        <div>
          <h4 className="font-semibold text-white uppercase tracking-wider text-sm mb-4">Shop</h4>
          <ul className="space-y-3">
            <FooterLink href="/browse" text="All products" />
            <FooterLink href="/deals" text="Deals" />
            <FooterLink href="/new" text="New arrivals" />
            <FooterLink href="/bundles" text="Bundles" />
          </ul>
        </div>

        {/* Support Column */}
        <div>
          <h4 className="font-semibold text-white uppercase tracking-wider text-sm mb-4">Support</h4>
          <ul className="space-y-3">
            <FooterLink href="/support" text="Help center" />
            <FooterLink href="/shipping" text="Shipping" />
            <FooterLink href="/returns" text="Returns" />
            <FooterLink href="/faq" text="FAQs" />
          </ul>
        </div>

        {/* Company Column */}
        <div>
          <h4 className="font-semibold text-white uppercase tracking-wider text-sm mb-4">Company</h4>
          <ul className="space-y-3">
            <FooterLink href="/about" text="About" />
            <FooterLink href="/contact" text="Contact" />
            <FooterLink href="/privacy" text="Privacy" />
            <FooterLink href="/terms" text="Terms" />
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
          <span>© {new Date().getFullYear()} HAYB. All rights reserved.</span>
          <div className="mt-2 md:mt-0 flex space-x-4">
            <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-white transition">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Reusable Footer Link Component
function FooterLink({ href, text }) {
  return (
    <li>
      <Link 
        href={href} 
        className="hover:text-white transition-colors duration-200"
      >
        {text}
      </Link>
    </li>
  );
}

// Social Icon Component (you would replace with actual icons)
function SocialIcon({ href, icon }) {
  return (
    <Link 
      href={href} 
      className="text-gray-400 hover:text-white transition-colors duration-200"
      aria-label={icon}
    >
      {/* Replace with your actual icon component or SVG */}
      <span className="text-lg">{icon === 'twitter' ? '🐦' : icon === 'instagram' ? '📷' : '👍'}</span>
    </Link>
  );
}