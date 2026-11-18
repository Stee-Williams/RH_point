import React from 'react';

/**
 * ANYTYPE DESIGN SYSTEM TOKENS (STRICTLY FROM DESIGN.md)
 * 
 * Colors:
 * - ink: #000000
 * - canvas: #ffffff
 * - ink-muted: #5b5b5b
 * - ink-subtle: #808080
 * - ink-faint: #666666
 * - surface-1: #3c3c3c
 * - hairline: #000000
 * - mint-teal: #3cd9b3 (trace accent)
 * - gradient-cream: #ffedbe
 * - gradient-rose: #ffbcc3
 * - gradient-mint: #cdffea
 * - gradient-sky: #b9eeff
 * - gradient-lavender: #e7d4ff
 * - gradient-lime: #f1ffc9
 * 
 * Typography:
 * - display-xl: 96px, 400, 90px lh, -2.4px ls (Playfair Display substitute for Riccionets)
 * - display-md: 88px, 300, 90px lh, -5.2px ls (Inter)
 * - body-lg: 18px, 300, 26px lh, -0.28px ls (Inter)
 * - body-sm: 14px, 400, 20px lh, -0.12px ls (Inter)
 * - label-caps: 14px, 400, 20px lh, 1px ls, uppercase (Inter)
 * - button-md: 16px, 500, 24px lh, -0.2px ls (Inter)
 * 
 * Spacing: xs:4px, sm:14px, md:16px, base:22px, lg:24px, xl:32px, 2xl:44px, 3xl:80px
 * Rounded: none:0px, md:16px, pill:9999px
 */

export interface AnytypeHeroProps {
  onGetStarted?: () => void;
  onSecondaryAction?: () => void;
}

export const AnytypeHero: React.FC<AnytypeHeroProps> = ({
  onGetStarted,
  onSecondaryAction,
}) => {
  return (
    <div
      style={{
        backgroundColor: '#ffffff', // {colors.canvas}
        color: '#000000', // {colors.ink}
        fontFamily: 'Inter, Helvetica, sans-serif',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 
        ========================================================================
        TOP NAVIGATION ({components.top-nav})
        backgroundColor: {colors.canvas} (#ffffff)
        textColor: {colors.ink} (#000000)
        typography: {typography.body-sm} (14px, 400, 20px, -0.12px)
        padding: 0px 16px
        height: 44px
        ========================================================================
      */}
      <header
        style={{
          backgroundColor: '#ffffff', // {colors.canvas}
          color: '#000000', // {colors.ink}
          height: '44px',
          padding: '0px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #000000', // {colors.hairline}
          position: 'sticky',
          top: 0,
          zIndex: 50,
          fontFamily: 'Inter, Helvetica, sans-serif',
          fontSize: '14px',
          fontWeight: 400,
          lineHeight: '20px',
          letterSpacing: '-0.12px',
        }}
      >
        {/* Flush left wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontFamily: 'Inter, Helvetica, sans-serif',
              fontWeight: 500,
              fontSize: '16px',
              letterSpacing: '-0.2px',
              color: '#000000', // {colors.ink}
            }}
          >
            anytype
          </span>
          <span
            style={{
              display: 'inline-block',
              width: '4px',
              height: '4px',
              borderRadius: '9999px',
              backgroundColor: '#000000',
            }}
          />
          <span
            style={{
              fontFamily: 'Inter, Helvetica, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              color: '#5b5b5b', // {colors.ink-muted}
              letterSpacing: '-0.12px',
            }}
          >
            RH-Point
          </span>
        </div>

        {/* Center Section: nav-pill row (WHAT / WHY / WHO) */}
        <nav
          aria-label="Section navigation"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {['WHAT', 'WHY', 'WHO'].map((item, index) => (
            <div
              key={item}
              style={{
                backgroundColor: index === 0 ? '#3c3c3c' : 'transparent', // {colors.surface-1}
                color: index === 0 ? '#ffffff' : '#000000', // {colors.canvas} / {colors.ink}
                fontFamily: 'Inter, Helvetica, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '20px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                borderRadius: '9999px', // {rounded.pill}
                padding: '6px 16px',
                height: '32px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: index === 0 ? 'none' : '1px solid #000000',
                transition: 'background-color 0.15s ease',
              }}
            >
              {item}
            </div>
          ))}
        </nav>

        {/* Flush right nav links & CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a
            href="#download"
            onClick={(e) => {
              e.preventDefault();
              onSecondaryAction?.();
            }}
            style={{
              backgroundColor: 'transparent',
              color: '#000000', // {colors.ink}
              fontFamily: 'Inter, Helvetica, sans-serif',
              fontSize: '14px', // {typography.body-sm}
              fontWeight: 400,
              lineHeight: '20px',
              letterSpacing: '-0.12px',
              textDecoration: 'none',
              padding: '10px 0px', // {components.nav-link}
              cursor: 'pointer',
            }}
          >
            Download
          </a>

          {/* Hamburger icon flush right (as noted in spec) */}
          <button
            aria-label="Menu"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '4px',
              width: '24px',
              height: '24px',
            }}
          >
            <span style={{ display: 'block', width: '16px', height: '1px', backgroundColor: '#000000' }} />
            <span style={{ display: 'block', width: '16px', height: '1px', backgroundColor: '#000000' }} />
          </button>
        </div>
      </header>

      {/* 
        ========================================================================
        HERO SECTION ({components.hero-heading}, {components.hero-heading-serif})
        Pastel gradient canvas bleeding across the lower half:
        stops: gradient-cream (#ffedbe), gradient-rose (#ffbcc3), gradient-mint (#cdffea),
               gradient-sky (#b9eeff), gradient-lavender (#e7d4ff), gradient-lime (#f1ffc9).
        ========================================================================
      */}
      <main
        style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: '#ffffff', // {colors.canvas}
          overflow: 'hidden',
        }}
      >
        {/* Pastel gradient wash bleeding across lower half exclusively */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '65%',
            pointerEvents: 'none',
            background: `
              radial-gradient(ellipse 40% 60% at 85% 95%, #e7d4ff 0%, transparent 60%),
              radial-gradient(ellipse 45% 55% at 65% 90%, #cdffea 0%, transparent 60%),
              radial-gradient(ellipse 35% 50% at 45% 95%, #b9eeff 0%, transparent 60%),
              radial-gradient(ellipse 35% 50% at 20% 90%, #ffedbe 0%, transparent 60%),
              radial-gradient(ellipse 30% 45% at 5% 95%, #ffbcc3 0%, transparent 60%),
              radial-gradient(ellipse 30% 45% at 95% 95%, #f1ffc9 0%, transparent 60%)
            `,
            opacity: 0.85,
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 40%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 40%)',
            zIndex: 1,
          }}
        />

        {/* Hero content grid (Max width ~1200px, 2-column split) */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '1200px',
            width: '100%',
            margin: '0 auto',
            padding: '80px 24px', // 80px = {spacing.3xl}, 24px = {spacing.lg}
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            columnGap: '44px', // {spacing.2xl}
            rowGap: '44px',
            alignItems: 'center',
          }}
        >
          {/* LEFT COLUMN: Serif-Sans Split Headline & CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Trace accent label: exactly 1 occurrence of {colors.mint-teal} (#3cd9b3) */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px', // {spacing.md}
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#3cd9b3', // {colors.mint-teal} trace accent
                  borderRadius: '9999px',
                }}
              />
              <span
                style={{
                  color: '#3cd9b3', // {colors.mint-teal} trace accent
                  fontFamily: 'Inter, Helvetica, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '20px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase', // {typography.label-caps}
                }}
              >
                Local-first architecture
              </span>
            </div>

            {/* 
              SERIF-SANS HEADLINE SPLIT:
              Line 1: "A safe haven" in Inter weight 300 (88px, -5.2px tracking)
              Line 2: "for digital collaboration" in Playfair Display (Riccionets substitute) weight 400 (96px, -2.4px tracking)
            */}
            <h1
              style={{
                margin: 0,
                padding: '0px',
                color: '#000000', // {colors.ink}
              }}
            >
              {/* Line 1: Inter at weight 300 ({typography.display-md}) */}
              <span
                style={{
                  display: 'block',
                  fontFamily: 'Inter, Helvetica, sans-serif',
                  fontSize: 'clamp(44px, 7vw, 88px)',
                  fontWeight: 300,
                  lineHeight: '1.02',
                  letterSpacing: '-5.2px',
                  color: '#000000', // {colors.ink}
                }}
              >
                A safe haven
              </span>

              {/* Line 2: Playfair Display weight 400 ({typography.display-xl}) */}
              <span
                style={{
                  display: 'block',
                  fontFamily: '"Playfair Display", "riccionets", serif',
                  fontSize: 'clamp(48px, 7.8vw, 96px)',
                  fontWeight: 400,
                  lineHeight: '1.0',
                  letterSpacing: '-2.4px',
                  color: '#000000', // {colors.ink}
                  marginTop: '4px', // {spacing.xs}
                }}
              >
                for digital collaboration
              </span>
            </h1>

            {/* 
              BODY PARAGRAPH ({components.body-paragraph-dark} / {typography.body-lg})
              fontSize: 18px
              fontWeight: 300
              lineHeight: 26px
              letterSpacing: -0.28px
              textColor: {colors.ink} (#000000)
            */}
            <p
              style={{
                fontFamily: 'Inter, Helvetica, sans-serif',
                fontSize: '18px',
                fontWeight: 300,
                lineHeight: '26px',
                letterSpacing: '-0.28px',
                color: '#000000', // {colors.ink}
                maxWidth: '520px',
                marginTop: '24px', // {spacing.lg}
                marginBottom: '32px', // {spacing.xl}
              }}
            >
              Your data stays on your device. Built on an encrypted local-first
              architecture where privacy isn&apos;t a promise — it&apos;s the default.
            </p>

            {/* ACTION BUTTONS ROW */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '16px', // {spacing.md}
              }}
            >
              {/* 
                BUTTON PRIMARY ({components.button-primary})
                backgroundColor: {colors.ink} (#000000)
                textColor: {colors.canvas} (#ffffff)
                typography: {typography.button-md} (16px, 500, 24px, -0.2px)
                rounded: {rounded.pill} (9999px)
                padding: 10px 16px
                height: 44px
              */}
              <button
                type="button"
                onClick={onGetStarted}
                style={{
                  backgroundColor: '#000000', // {colors.ink}
                  color: '#ffffff', // {colors.canvas}
                  fontFamily: 'Inter, Helvetica, sans-serif',
                  fontSize: '16px', // {typography.button-md}
                  fontWeight: 500,
                  lineHeight: '24px',
                  letterSpacing: '-0.2px',
                  borderRadius: '9999px', // {rounded.pill}
                  padding: '10px 16px',
                  height: '44px',
                  border: '1px solid #000000', // {colors.hairline}
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                }}
              >
                Get Anytype for Desktop
              </button>

              {/* 
                BUTTON SECONDARY ({components.button-secondary})
                backgroundColor: transparent
                textColor: {colors.ink} (#000000)
                typography: {typography.button-md} (16px, 500, 24px, -0.2px)
                rounded: {rounded.pill} (9999px)
                padding: 10px 16px
                height: 44px
                borderColor: {colors.hairline} (#000000)
              */}
              <button
                type="button"
                onClick={onSecondaryAction}
                style={{
                  backgroundColor: 'transparent',
                  color: '#000000', // {colors.ink}
                  fontFamily: 'Inter, Helvetica, sans-serif',
                  fontSize: '16px', // {typography.button-md}
                  fontWeight: 500,
                  lineHeight: '24px',
                  letterSpacing: '-0.2px',
                  borderRadius: '9999px', // {rounded.pill}
                  padding: '10px 16px',
                  height: '44px',
                  border: '1px solid #000000', // {colors.hairline}
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                }}
              >
                Open Web Experience
              </button>
            </div>
          </div>

          {/* 
            RIGHT COLUMN: 1-BIT PIXEL-ART ILLUSTRATION
            Macintosh 1984 aesthetic:
            Desktop monitor, calendar "31", folder stack, smiley terminal, document cards.
            Strictly 1-bit black (#000000) and white (#ffffff).
          */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '16px',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '480px',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <svg
                viewBox="0 0 460 380"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                shapeRendering="crispEdges"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              >
                {/* Background Shadow Dither for early Mac monitor */}
                <rect x="148" y="278" width="168" height="4" fill="#000000" />
                <rect x="156" y="282" width="152" height="4" fill="#000000" />

                {/* --- 1984 MACINTOSH MONITOR CHASSIS --- */}
                {/* Main computer housing */}
                <rect x="130" y="40" width="200" height="236" fill="#ffffff" stroke="#000000" strokeWidth="2" />
                {/* Horizontal grooved ventilation bar on top */}
                <rect x="146" y="46" width="168" height="2" fill="#000000" />
                <rect x="146" y="50" width="168" height="2" fill="#000000" />

                {/* Bevelled screen frame */}
                <rect x="146" y="60" width="168" height="136" fill="#ffffff" stroke="#000000" strokeWidth="2" />
                {/* Screen inner CRT area */}
                <rect x="154" y="68" width="152" height="120" fill="#ffffff" stroke="#000000" strokeWidth="2" />

                {/* --- SMILEY-FACE TERMINAL ON CRT DISPLAY --- */}
                {/* Terminal window bar */}
                <rect x="162" y="76" width="136" height="16" fill="#000000" />
                {/* Window close square */}
                <rect x="166" y="80" width="8" height="8" fill="#ffffff" stroke="#000000" strokeWidth="1" />
                {/* Terminal title: pixel dots */}
                <rect x="180" y="83" width="40" height="2" fill="#ffffff" />
                {/* Terminal body */}
                <rect x="162" y="92" width="136" height="86" fill="#ffffff" stroke="#000000" strokeWidth="2" />

                {/* Classic Happy Mac / Smiley face */}
                {/* Eyes */}
                <rect x="218" y="112" width="6" height="8" fill="#000000" />
                <rect x="236" y="112" width="6" height="8" fill="#000000" />
                {/* Nose */}
                <rect x="228" y="124" width="4" height="6" fill="#000000" />
                {/* Smile */}
                <rect x="216" y="136" width="6" height="4" fill="#000000" />
                <rect x="222" y="140" width="16" height="4" fill="#000000" />
                <rect x="238" y="136" width="6" height="4" fill="#000000" />

                {/* Lower chassis details: 3.5" Floppy Disk Drive slot */}
                <rect x="146" y="220" width="88" height="6" fill="#000000" />
                <rect x="150" y="230" width="4" height="4" fill="#000000" />

                {/* Rainbow Apple pixel logo placeholder (1-bit strictly: black silhouette) */}
                <rect x="294" y="218" width="12" height="14" fill="#000000" />
                <rect x="298" y="214" width="4" height="4" fill="#000000" />

                {/* Monitor pedestal base */}
                <polygon points="170,276 160,296 300,296 290,276" fill="#ffffff" stroke="#000000" strokeWidth="2" />

                {/* --- CALENDAR SHOWING "31" (Top Left Floating) --- */}
                <g transform="translate(30, 80)">
                  {/* Calendar drop shadow */}
                  <rect x="6" y="6" width="96" height="96" fill="#000000" />
                  {/* Calendar sheet */}
                  <rect x="0" y="0" width="96" height="96" fill="#ffffff" stroke="#000000" strokeWidth="2" />
                  {/* Top binder rings */}
                  <rect x="16" y="-6" width="8" height="10" fill="#ffffff" stroke="#000000" strokeWidth="2" />
                  <rect x="44" y="-6" width="8" height="10" fill="#ffffff" stroke="#000000" strokeWidth="2" />
                  <rect x="72" y="-6" width="8" height="10" fill="#ffffff" stroke="#000000" strokeWidth="2" />
                  {/* Calendar header bar */}
                  <rect x="0" y="0" width="96" height="24" fill="#000000" />
                  {/* Header text simulation */}
                  <rect x="30" y="10" width="36" height="4" fill="#ffffff" />
                  {/* Number "3" in 1-bit pixel blocks */}
                  <rect x="24" y="40" width="20" height="6" fill="#000000" />
                  <rect x="38" y="46" width="6" height="12" fill="#000000" />
                  <rect x="24" y="56" width="20" height="6" fill="#000000" />
                  <rect x="38" y="62" width="6" height="14" fill="#000000" />
                  <rect x="24" y="74" width="20" height="6" fill="#000000" />
                  {/* Number "1" in 1-bit pixel blocks */}
                  <rect x="56" y="44" width="6" height="6" fill="#000000" />
                  <rect x="62" y="40" width="6" height="40" fill="#000000" />
                  <rect x="52" y="74" width="26" height="6" fill="#000000" />
                </g>

                {/* --- FOLDER STACK (Bottom Left) --- */}
                <g transform="translate(40, 220)">
                  {/* Bottom folder */}
                  <rect x="6" y="6" width="100" height="74" fill="#000000" />
                  <rect x="0" y="0" width="100" height="74" fill="#ffffff" stroke="#000000" strokeWidth="2" />
                  {/* Tab */}
                  <rect x="0" y="-12" width="36" height="14" fill="#ffffff" stroke="#000000" strokeWidth="2" />
                  <rect x="1" y="0" width="34" height="2" fill="#ffffff" />
                  {/* Top folder rotated slightly / overlapping */}
                  <g transform="translate(14, 16)">
                    <rect x="4" y="4" width="86" height="60" fill="#000000" />
                    <rect x="0" y="0" width="86" height="60" fill="#ffffff" stroke="#000000" strokeWidth="2" />
                    {/* Tab */}
                    <rect x="0" y="-10" width="30" height="12" fill="#ffffff" stroke="#000000" strokeWidth="2" />
                    <rect x="1" y="0" width="28" height="2" fill="#ffffff" />
                    {/* Folder pixel lines */}
                    <rect x="14" y="16" width="58" height="2" fill="#000000" />
                    <rect x="14" y="24" width="46" height="2" fill="#000000" />
                    <rect x="14" y="32" width="52" height="2" fill="#000000" />
                  </g>
                </g>

                {/* --- DOCUMENT CARDS (Right Floating) --- */}
                <g transform="translate(320, 100)">
                  {/* Back document card */}
                  <rect x="20" y="20" width="100" height="130" fill="#ffffff" stroke="#000000" strokeWidth="2" />
                  <rect x="24" y="24" width="92" height="122" fill="#000000" />
                  <rect x="28" y="28" width="84" height="114" fill="#ffffff" />
                  {/* Document lines */}
                  <rect x="36" y="40" width="60" height="2" fill="#000000" />
                  <rect x="36" y="48" width="50" height="2" fill="#000000" />
                  <rect x="36" y="56" width="68" height="2" fill="#000000" />

                  {/* Front document card with folded corner */}
                  <g transform="translate(0, 40)">
                    {/* Shadow */}
                    <rect x="6" y="6" width="104" height="134" fill="#000000" />
                    {/* Body */}
                    <rect x="0" y="0" width="104" height="134" fill="#ffffff" stroke="#000000" strokeWidth="2" />
                    {/* Folded top-right corner */}
                    <polygon points="84,0 104,20 84,20" fill="#000000" />
                    <polygon points="84,0 84,20 104,20" fill="#ffffff" stroke="#000000" strokeWidth="2" />

                    {/* Checkbox item 1 */}
                    <rect x="14" y="30" width="10" height="10" fill="#ffffff" stroke="#000000" strokeWidth="2" />
                    <rect x="17" y="33" width="4" height="4" fill="#000000" />
                    <rect x="30" y="34" width="56" height="3" fill="#000000" />

                    {/* Checkbox item 2 */}
                    <rect x="14" y="50" width="10" height="10" fill="#ffffff" stroke="#000000" strokeWidth="2" />
                    <rect x="17" y="53" width="4" height="4" fill="#000000" />
                    <rect x="30" y="54" width="48" height="3" fill="#000000" />

                    {/* Checkbox item 3 */}
                    <rect x="14" y="70" width="10" height="10" fill="#ffffff" stroke="#000000" strokeWidth="2" />
                    <rect x="30" y="74" width="52" height="3" fill="#000000" />

                    {/* 1-bit Dither Bar at card bottom */}
                    <g transform="translate(14, 100)">
                      <rect x="0" y="0" width="76" height="1" fill="#000000" />
                      <rect x="0" y="4" width="76" height="1" fill="#000000" />
                      <rect x="0" y="8" width="76" height="1" fill="#000000" />
                      <rect x="0" y="12" width="76" height="1" fill="#000000" />
                    </g>
                  </g>
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* 
          ========================================================================
          HAIRLINE BORDER AT BOTTOM OF HERO SECTION
          "The hero area ends abruptly at the hairline border above the feature grid."
          1px solid #000000 ({colors.hairline})
          ========================================================================
        */}
        <div
          style={{
            borderBottom: '1px solid #000000', // {colors.hairline}
            width: '100%',
            position: 'relative',
            zIndex: 10,
          }}
        />
      </main>
    </div>
  );
};
