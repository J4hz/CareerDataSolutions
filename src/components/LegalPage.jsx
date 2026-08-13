import '../styles/legal.css';

/**
 * Shared shell for /privacy and /terms while both are scaffolds.
 *
 * Every one of these pages carries the same unmissable banner. That is the
 * point of the component: the banner cannot be forgotten on one page and
 * kept on the other, and removing it is a single deliberate edit at the
 * moment the real text arrives — not something that quietly rots.
 */
export default function LegalPage({ eyebrow, title, sections }) {
  return (
    <main className="legal">
      <div className="container legal__inner">
        <p className="legal__eyebrow">{eyebrow}</p>
        <h1 className="legal__title">{title}</h1>

        {/* Delete this banner in the same commit that pastes the reviewed
            text in. Until then it is load-bearing: it is the only thing
            stopping a placeholder from reading as a real policy. */}
        <div className="legal__placeholder" role="note">
          <p className="legal__placeholder-flag">
            [[ AWAITING ADVOCATE-REVIEWED TEXT — DO NOT PUBLISH LIVE ]]
          </p>
          <p>
            This page is a scaffold. It carries no legal effect and is not a
            statement of CareerDataSolutions&rsquo; terms or privacy practices.
            The reviewed wording replaces everything below.
          </p>
        </div>

        {sections.map((section) => (
          <section className="legal__section" key={section.heading}>
            <h2 className="legal__heading">{section.heading}</h2>
            <p className="legal__body">{section.body}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
