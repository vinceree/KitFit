import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <div className="text-xl font-bold tracking-tight">KitFit</div>
          <div className="flex gap-3">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          Virtual try-on for
          <br />
          <span className="text-blue-600">cycling brands</span>
        </h1>
        <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
          Let your customers see themselves wearing your cycling kit on their
          bike. AI-powered virtual try-on widget that embeds on any product
          page with a single script tag.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/auth/signup"
            className="px-8 py-3 text-base font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Start Free Trial
          </Link>
          <Link
            href="#how-it-works"
            className="px-8 py-3 text-base font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
          >
            See How It Works
          </Link>
        </div>

        <section id="how-it-works" className="mt-32 text-left">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Embed the widget",
                desc: "Paste a single <script> tag on your product pages. Works with Shopify, WooCommerce, or any custom site.",
              },
              {
                step: "2",
                title: "Customer uploads a photo",
                desc: "They upload a photo of themselves and their bike, pick a scene, and hit Generate.",
              },
              {
                step: "3",
                title: "AI magic in seconds",
                desc: "Our AI generates a photorealistic image of them wearing your kit, on their bike, in a beautiful setting.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white border rounded-xl p-6"
              >
                <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-32 mb-20">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Simple pricing
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "€199",
                tryons: "500",
                features: [
                  "500 try-ons/month",
                  "1 brand",
                  "All scene presets",
                  "Email support",
                ],
              },
              {
                name: "Growth",
                price: "€499",
                tryons: "2,000",
                features: [
                  "2,000 try-ons/month",
                  "1 brand",
                  "All scene presets",
                  "Priority support",
                  "Custom branding",
                ],
                popular: true,
              },
              {
                name: "Pro",
                price: "€999",
                tryons: "10,000",
                features: [
                  "10,000 try-ons/month",
                  "Multiple brands",
                  "All scene presets",
                  "Dedicated support",
                  "Custom branding",
                  "API access",
                ],
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`bg-white border rounded-xl p-6 ${
                  plan.popular ? "ring-2 ring-blue-600 relative" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="font-semibold text-lg text-slate-900">
                  {plan.name}
                </h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-slate-900">
                    {plan.price}
                  </span>
                  <span className="text-slate-500">/mo</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-slate-600"
                    >
                      <svg
                        className="w-4 h-4 text-green-500 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/signup"
                  className={`mt-8 block text-center py-2.5 rounded-lg text-sm font-semibold transition ${
                    plan.popular
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
