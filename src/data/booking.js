/* The two things a visitor can book.
 *
 * Used by the navbar dropdown (components/Navbar.jsx) and the closing CTA
 * band (components/CTASection.jsx). It lives here so the two menus cannot
 * drift apart: a visitor who opens one and then the other must see the same
 * choices going to the same places.
 *
 * The dropdown exists because "Book a discovery call" is ambiguous on the
 * neutral shell — it makes the visitor name their track up front, so they
 * land on the right contact flow.
 */
export const BOOK_OPTIONS = [
  { to: '/data/contact', label: 'Data Services', track: 'data' },
  { to: '/career/contact', label: 'Career Services', track: 'career' },
];
