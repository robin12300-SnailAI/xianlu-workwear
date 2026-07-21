import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#f8f9fa] border-t border-gray-200 mt-12 pt-4">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Company */}
        <div>
          <h5 className="font-semibold text-sm mb-3 text-[#212529] uppercase tracking-wider">Company</h5>
          <div className="space-y-2">
            <Link href="/" className="footer-link block">Website: xianluworkwear.com.au</Link>
            <Link href="/about" className="footer-link block">About Us</Link>
          </div>
        </div>

        {/* Customer Service */}
        <div>
          <h5 className="font-semibold text-sm mb-3 text-[#212529] uppercase tracking-wider">Customer Service</h5>
          <div className="space-y-2">
            <Link href="/cart" className="footer-link block">My Cart</Link>
            <Link href="/products" className="footer-link block">Measurements Guide</Link>
            <Link href="/return-policy" className="footer-link block">Return &amp; Refund Policy</Link>
          </div>
        </div>

        {/* Resources */}
        <div>
          <h5 className="font-semibold text-sm mb-3 text-[#212529] uppercase tracking-wider">Resources</h5>
          <div className="space-y-2">
            <Link href="/products" className="footer-link block">Product Range</Link>
            <a href="mailto:info@xianlu.com.au" className="footer-link block">Contact Us</a>
          </div>
        </div>

        {/* Stay Connected */}
        <div>
          <h5 className="font-semibold text-sm mb-3 text-[#212529] uppercase tracking-wider">Stay Connected</h5>
          <p className="text-sm text-gray-500 mb-3">
            Be among the first to get product launches, sales offers &amp; more.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Your Email"
              className="border border-gray-300 rounded px-3 py-1.5 text-sm flex-1 focus:outline-none focus:border-[#0d6efd]"
            />
            <button className="bg-[#0d6efd] text-white px-3 py-1.5 rounded text-sm hover:bg-blue-600 transition">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200 py-3 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Xianlu Workwear. All rights reserved. | Paddy&apos;s Market, Sydney NSW
      </div>
    </footer>
  );
}
