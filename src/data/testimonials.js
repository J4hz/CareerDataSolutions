// `track` lets a service page show the testimonials that speak to its own
// visitors: a CV success story proves nothing to someone costing a dashboard.
// See components/ServiceLanding.jsx, which falls back to the full set when a
// track has too few of its own. The home page marquee ignores it and shows
// everything, which is the point of the home page.
export const testimonials = [
  {
    id: 1,
    track: 'data',
    stars: 5,
    quote:
      "The Power BI dashboard Kabiru built for our operations team transformed how our managers make decisions. For the first time, we had real-time visibility across the department.",
    name: "Amina Ochieng",
    role: "Operations Director · Nairobi NGO",
    initials: "AO",
    avatarColor: "teal",
  },
  {
    id: 2,
    track: 'career',
    stars: 5,
    quote:
      "I had been applying to UK healthcare roles for 6 months with zero responses. After my CV and LinkedIn were optimized, I had 3 interview invitations within 2 weeks.",
    name: "James Mwangi",
    role: "Healthcare Professional · Targeting UK",
    initials: "JM",
    avatarColor: "gold",
  },
  {
    id: 3,
    track: 'data',
    stars: 5,
    quote:
      "The Excel automation work alone saved our finance team roughly 15 hours a week in manual reporting. The claims processing system Kabiru built now runs itself.",
    name: "Fatuma Kiptoo",
    role: "Finance Manager · Insurance Firm, Kenya",
    initials: "FK",
    avatarColor: "navy",
  },
];
