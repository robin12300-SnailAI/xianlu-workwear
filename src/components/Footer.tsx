import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-10">
      <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-gray-500 flex flex-col md:flex-row gap-6 md:justify-between">
        <div>
          <div className="font-bold text-gray-800">Xianlu Workwear</div>
          <div>Paddy&apos;s Market, Sydney NSW, Australia</div>
          <div>Australia Wide Delivery</div>
        </div>
        <div className="flex gap-6">
          <Link href="/products" className="hover:text-brand">
            Products
          </Link>
          <Link href="/cart" className="hover:text-brand">
            Cart
          </Link>
          <a href="mailto:info@xianlu.com.au" className="hover:text-brand">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
