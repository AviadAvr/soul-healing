// Reiki and Soul Healing tab panels, as they were in pages/index.js.

        {/* ===================== REIKI (Tina-editable) ===================== */}
        <section {...panelProps("reiki", "section service-page")}>
          <div className="container">
            <div className="section__head">
              {reiki.eyebrow && (
                <p className="section__eyebrow" data-tina-field={tinaField(reiki, "eyebrow")}>{reiki.eyebrow}</p>
              )}
              <ReikiTitleTag className="section__title" data-tina-field={tinaField(reiki, "title")}>{reiki.title}</ReikiTitleTag>
              <p className="section__lead" data-tina-field={tinaField(reiki, "lead")}>
                {reiki.lead}
              </p>
            </div>

            <div className="service-page__body">
              {reiki.sections?.map((s, i) => (
                <Fragment key={i}>
                  <h3 data-tina-field={tinaField(s, "heading")}>{s.heading}</h3>
                  {s.gloss && (
                    <p className="service-page__gloss" data-tina-field={tinaField(s, "gloss")}>
                      {renderInline(s.gloss, { selectTab })}
                    </p>
                  )}
                  <p data-tina-field={tinaField(s, "body")}>{renderInline(s.body, { selectTab })}</p>
                </Fragment>
              ))}
              <a href={pathFor("contact")} className="btn btn--primary" onClick={(e) => { e.preventDefault(); selectTab("home", "contact"); }} data-tina-field={tinaField(reiki, "cta")}>
                {reiki.cta}
              </a>
            </div>
          </div>
        </section>

        {/* ===================== SOUL HEALING (Tina-editable) ===================== */}
        <section {...panelProps("soul-healing", "section service-page")}>
          <div className="container">
            <div className="section__head">
              {soulHealing.eyebrow && (
                <p className="section__eyebrow" data-tina-field={tinaField(soulHealing, "eyebrow")}>{soulHealing.eyebrow}</p>
              )}
              <SoulTitleTag className="section__title" data-tina-field={tinaField(soulHealing, "title")}>{soulHealing.title}</SoulTitleTag>
              {soulHealing.lead && (
                <p className="section__lead" data-tina-field={tinaField(soulHealing, "lead")}>
                  {soulHealing.lead}
                </p>
              )}
            </div>

            <div className="service-page__body">
              {soulHealing.intro?.map((para, i) => (
                <p key={`intro-${i}`} data-tina-field={tinaField(soulHealing, "intro")}>
                  <em>{renderInline(para, { selectTab })}</em>
                </p>
              ))}
              {soulHealing.sections?.map((s, i) => (
                <Fragment key={i}>
                  <h3 data-tina-field={tinaField(s, "heading")}>{s.heading}</h3>
                  {s.gloss && (
                    <p className="service-page__gloss" data-tina-field={tinaField(s, "gloss")}>
                      {renderInline(s.gloss, { selectTab })}
                    </p>
                  )}
                  <p data-tina-field={tinaField(s, "body")}>{renderInline(s.body, { selectTab })}</p>
                </Fragment>
              ))}
              <a href={pathFor("contact")} className="btn btn--primary" onClick={(e) => { e.preventDefault(); selectTab("home", "contact"); }} data-tina-field={tinaField(soulHealing, "cta")}>
                {soulHealing.cta}
              </a>
            </div>
          </div>
        </section>

