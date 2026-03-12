// Decorative inline SVG backgrounds for each app page.
// These are hand-crafted SVG food/nature doodles rendered at low opacity so
// they never compete with content. No external dependencies.

type PageBg = 'today' | 'menu' | 'calendar' | 'profile';

// ── Today: scattered ingredients ────────────────────────────────────────────
const TodaySVG = () => (
    <svg viewBox="0 0 1200 700" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>

        {/* Apple top-right */}
        <g transform="translate(1050,55) rotate(-15)">
            <ellipse cx="0" cy="8" rx="32" ry="36" fill="#E8504A" />
            <path d="M0,-36 Q6,-46 10,-40" stroke="#4CAF7D" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <path d="M-6,-20 Q-18,-22 -20,-12" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4"/>
        </g>

        {/* Carrot bottom-left */}
        <g transform="translate(60,580) rotate(25)">
            <path d="M0,0 L-10,60 L10,60 Z" fill="#F5874A" />
            <path d="M-4,0 Q-12,-8 -8,-18" stroke="#4CAF7D" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <path d="M0,0  Q8,-10 4,-20"   stroke="#4CAF7D" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <path d="M4,0  Q14,-6 12,-16"  stroke="#4CAF7D" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </g>

        {/* Leaf cluster top-left */}
        <g transform="translate(80,80)">
            <ellipse cx="0"  cy="0"  rx="22" ry="11" fill="#4CAF7D" transform="rotate(-30)"/>
            <ellipse cx="25" cy="-5" rx="20" ry="10" fill="#4CAF7D" transform="rotate(10)" opacity="0.7"/>
            <ellipse cx="12" cy="12" rx="18" ry="9"  fill="#4CAF7D" transform="rotate(-50)" opacity="0.6"/>
        </g>

        {/* Tomato mid-right */}
        <g transform="translate(1100,380)">
            <circle cx="0" cy="0" r="30" fill="#E8504A" />
            <path d="M0,-30 Q4,-40 8,-34" stroke="#4CAF7D" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <path d="M-8,-28 Q-6,-38 0,-36" stroke="#4CAF7D" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <line x1="-15" y1="0" x2="15" y2="0" stroke="#fff" strokeWidth="1.5" opacity="0.3"/>
            <line x1="0" y1="-15" x2="0"  y2="15"  stroke="#fff" strokeWidth="1.5" opacity="0.3"/>
        </g>

        {/* Wheat stalks bottom-right */}
        <g transform="translate(1050,580)">
            {[0,14,28].map((dx) => (
                <g key={dx} transform={`translate(${dx},0)`}>
                    <line x1="0" y1="0" x2="0" y2="-80" stroke="#F5C842" strokeWidth="2"/>
                    {[-18,-10,-2,6,14].map((dy) => (
                        <ellipse key={dy} cx="6" cy={dy} rx="5" ry="8" fill="#F5C842"
                            transform={`rotate(${dy < -8 ? -40 : 40} 0 ${dy})`} opacity="0.85"/>
                    ))}
                </g>
            ))}
        </g>

        {/* Dal / lentil dots */}
        {[
            [220,160],[340,600],[700,120],[890,560],[500,640],
        ].map(([cx,cy],i) => (
            <ellipse key={i} cx={cx} cy={cy} rx="10" ry="7" fill="#F5C842"
                transform={`rotate(${i*37} ${cx} ${cy})`} />
        ))}

        {/* Small spinach leaves */}
        {[
            [380,80,20],[650,640,-30],[900,100,10],[200,440,-15],
        ].map(([x,y,r],i) => (
            <g key={i} transform={`translate(${x},${y}) rotate(${r})`}>
                <ellipse cx="0" cy="0" rx="14" ry="24" fill="#4CAF7D" opacity="0.7"/>
                <line x1="0" y1="-24" x2="0" y2="24" stroke="#fff" strokeWidth="1" opacity="0.35"/>
            </g>
        ))}
    </svg>
);

// ── Menu: cookbook & spices ──────────────────────────────────────────────────
const MenuSVG = () => (
    <svg viewBox="0 0 1200 700" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>

        {/* Open book — centre top */}
        <g transform="translate(480,60)">
            <rect x="-120" y="0" width="120" height="155" rx="4" fill="#F5EFE6" stroke="#E2D5C8" strokeWidth="2"/>
            <rect x="0"    y="0" width="120" height="155" rx="4" fill="#FDF9F4" stroke="#E2D5C8" strokeWidth="2"/>
            <line x1="0" y1="0" x2="0" y2="155" stroke="#D6C9BB" strokeWidth="2.5"/>
            {[20,38,56,74,92,110].map((y) => (
                <g key={y}>
                    <line x1="-110" y1={y} x2="-14" y2={y} stroke="#D6C9BB" strokeWidth="1.2"/>
                    <line x1="14"   y1={y} x2="110"  y2={y} stroke="#D6C9BB" strokeWidth="1.2"/>
                </g>
            ))}
        </g>

        {/* Fork — left */}
        <g transform="translate(90,200) rotate(-20)">
            <rect x="-3" y="0" width="6" height="110" rx="3" fill="#C4A882"/>
            {[-8,-2,4,10].map((dx) => (
                <rect key={dx} x={dx} y="-40" width="4" height="50" rx="2" fill="#C4A882"/>
            ))}
        </g>

        {/* Spoon — right */}
        <g transform="translate(1100,200) rotate(15)">
            <rect x="-3" y="0" width="6" height="100" rx="3" fill="#C4A882"/>
            <ellipse cx="0" cy="-28" rx="18" ry="28" fill="#C4A882"/>
        </g>

        {/* Turmeric dust dots */}
        {[[200,120],[350,500],[700,600],[950,400],[1050,550],[150,350]].map(([cx,cy],i) => (
            <circle key={i} cx={cx} cy={cy} r={4+i%3*2} fill="#F5C842" />
        ))}

        {/* Coriander leaves */}
        {[[300,180,-20],[900,130,30],[650,580,0],[1000,620,-25]].map(([x,y,r],i) => (
            <g key={i} transform={`translate(${x},${y}) rotate(${r})`}>
                <circle cx="0"  cy="-18" r="12" fill="#4CAF7D" opacity="0.8"/>
                <circle cx="-14" cy="5" r="11" fill="#4CAF7D" opacity="0.7"/>
                <circle cx="14" cy="5"  r="11" fill="#4CAF7D" opacity="0.7"/>
                <line x1="0" y1="20" x2="0" y2="-6" stroke="#4CAF7D" strokeWidth="1.5"/>
            </g>
        ))}

        {/* Clay pot bottom-right */}
        <g transform="translate(1060,500)">
            <ellipse cx="0" cy="-10" rx="55" ry="65" fill="#C4A882" opacity="0.6"/>
            <ellipse cx="0" cy="-66" rx="30" ry="10" fill="#B89070" opacity="0.7"/>
            <ellipse cx="0" cy="-76" rx="22" ry="6"  fill="#A07858" opacity="0.7"/>
            <path d="M-26,-30 Q-46,-20 -44,-5" stroke="#A07858" strokeWidth="3" fill="none" strokeLinecap="round"/>
            <path d="M26,-30  Q46,-20  44,-5"  stroke="#A07858" strokeWidth="3" fill="none" strokeLinecap="round"/>
        </g>
    </svg>
);

// ── Calendar: garden growth ──────────────────────────────────────────────────
const CalendarSVG = () => (
    <svg viewBox="0 0 1200 700" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>

        {/* Ground stripe */}
        <rect x="0" y="580" width="1200" height="120" rx="8" fill="#8B6914" opacity="0.15"/>

        {/* Seedlings row */}
        {[120,260,420,600,780,950,1100].map((x,i) => {
            const h = 60 + (i%3)*30;
            return (
                <g key={x} transform={`translate(${x},580)`}>
                    <line x1="0" y1="0" x2="0" y2={-h} stroke="#4CAF7D" strokeWidth={2.5}/>
                    <ellipse cx="-12" cy={-h*0.6} rx="16" ry="10" fill="#4CAF7D"
                        transform={`rotate(-35 ${x} 0)`} opacity="0.9"/>
                    <ellipse cx="12"  cy={-h*0.5} rx="16" ry="10" fill="#4CAF7D"
                        transform={`rotate(35 ${x} 0)`}  opacity="0.9"/>
                    {h > 70 && (
                        <ellipse cx="0" cy={-h} rx="14" ry="9" fill="#4CAF7D"/>
                    )}
                </g>
            );
        })}

        {/* Sun top-right */}
        <g transform="translate(1080,90)">
            <circle cx="0" cy="0" r="50" fill="#F5C842" />
            {Array.from({length: 12}, (_,i) => {
                const a = i * 30 * Math.PI / 180;
                return <line key={i} x1={Math.cos(a)*56} y1={Math.sin(a)*56}
                    x2={Math.cos(a)*72} y2={Math.sin(a)*72}
                    stroke="#F5C842" strokeWidth="3" strokeLinecap="round"/>;
            })}
        </g>

        {/* Small stars / sparkles */}
        {[[200,120],[500,80],[750,150],[300,300],[900,250]].map(([x,y],i) => (
            <g key={i} transform={`translate(${x},${y})`}>
                <line x1="0" y1="-10" x2="0"  y2="10"  stroke="#F5C842" strokeWidth="2" strokeLinecap="round"/>
                <line x1="-10" y1="0" x2="10" y2="0"   stroke="#F5C842" strokeWidth="2" strokeLinecap="round"/>
                <line x1="-7"  y1="-7" x2="7" y2="7"   stroke="#F5C842" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="7"   y1="-7" x2="-7" y2="7"  stroke="#F5C842" strokeWidth="1.5" strokeLinecap="round"/>
            </g>
        ))}

        {/* Watering can top-left */}
        <g transform="translate(80,120) rotate(-10)">
            <rect x="-30" y="-20" width="70" height="50" rx="10" fill="#6BB8F5" opacity="0.7"/>
            <rect x="40"  y="-10" width="40" height="8"   rx="4"  fill="#6BB8F5" opacity="0.7"/>
            <rect x="78"  y="0"   width="3"  height="16"  rx="1"  fill="#6BB8F5" opacity="0.6"/>
            <rect x="85"  y="0"   width="3"  height="16"  rx="1"  fill="#6BB8F5" opacity="0.6"/>
            <rect x="92"  y="0"   width="3"  height="16"  rx="1"  fill="#6BB8F5" opacity="0.6"/>
            <path d="M-30,-20 Q-30,-50 10,-50 L10,-20" stroke="#6BB8F5" strokeWidth="3" fill="none"/>
        </g>

        {/* Butterflies */}
        {[[400,200],[820,160]].map(([x,y],i) => (
            <g key={i} transform={`translate(${x},${y}) rotate(${i*15-8})`}>
                <ellipse cx="-12" cy="-5" rx="16" ry="10" fill="#F5874A" opacity="0.6" transform="rotate(-20)"/>
                <ellipse cx="12"  cy="-5" rx="16" ry="10" fill="#F5874A" opacity="0.6" transform="rotate(20)"/>
                <ellipse cx="-8"  cy="8"  rx="10" ry="7"  fill="#F5874A" opacity="0.5" transform="rotate(-30)"/>
                <ellipse cx="8"   cy="8"  rx="10" ry="7"  fill="#F5874A" opacity="0.5" transform="rotate(30)"/>
                <line x1="0" y1="-18" x2="0" y2="18" stroke="#8B6914" strokeWidth="1.5" opacity="0.5"/>
            </g>
        ))}
    </svg>
);

// ── Profile: child with giant fruits ────────────────────────────────────────
const ProfileSVG = () => (
    <svg viewBox="0 0 1200 700" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>

        {/* Giant apple left */}
        <g transform="translate(80,180)">
            <ellipse cx="0" cy="20" rx="90" ry="100" fill="#E8504A" opacity="0.5"/>
            <path d="M0,-80 Q10,-105 20,-90" stroke="#4CAF7D" strokeWidth="4" fill="none" strokeLinecap="round"/>
            <ellipse cx="-30" cy="-50" rx="18" ry="28" fill="#4CAF7D" opacity="0.6" transform="rotate(-20)"/>
        </g>

        {/* Giant banana right */}
        <g transform="translate(1100,160) rotate(-20)">
            <path d="M0,0 Q60,20 80,80 Q60,100 20,90 Q-20,80 -10,20 Z" fill="#F5C842" opacity="0.5"/>
        </g>

        {/* Giant broccoli bottom-left */}
        <g transform="translate(200,480)">
            <rect x="-10" y="0" width="20" height="80" rx="6" fill="#4CAF7D" opacity="0.5"/>
            <circle cx="0"   cy="-10" r="45" fill="#4CAF7D" opacity="0.5"/>
            <circle cx="-34" cy="10"  r="30" fill="#4CAF7D" opacity="0.45"/>
            <circle cx="34"  cy="10"  r="30" fill="#4CAF7D" opacity="0.45"/>
        </g>

        {/* Stars & hearts */}
        {[
            [350,80,'★'],[700,60,'★'],[900,100,'★'],[500,600,'★'],
            [300,400,'♥'],[850,350,'♥'],[1050,500,'♥'],
        ].map(([x,y,s],i) => (
            <text key={i} x={x} y={y} fontSize={20+i%3*8}
                fill={s === '♥' ? '#E8504A' : '#F5C842'}
                textAnchor="middle" dominantBaseline="middle" opacity="0.5">
                {s as string}
            </text>
        ))}

        {/* Child silhouette — simple rounded shapes */}
        <g transform="translate(600,280)">
            {/* head */}
            <circle cx="0" cy="-60" r="32" fill="#F5874A" opacity="0.25"/>
            {/* body */}
            <rect x="-22" y="-28" width="44" height="60" rx="16" fill="#F5874A" opacity="0.22"/>
            {/* arms */}
            <rect x="-55" y="-20" width="35" height="14" rx="7" fill="#F5874A" opacity="0.2" transform="rotate(20)"/>
            <rect x="22"  y="-20" width="35" height="14" rx="7" fill="#F5874A" opacity="0.2" transform="rotate(-20)"/>
            {/* legs */}
            <rect x="-18" y="32" width="14" height="48" rx="7" fill="#F5874A" opacity="0.2" transform="rotate(8)"/>
            <rect x="6"   y="32" width="14" height="48" rx="7" fill="#F5874A" opacity="0.2" transform="rotate(-8)"/>
        </g>
    </svg>
);

const BG_MAP: Record<PageBg, React.ComponentType> = {
    today:    TodaySVG,
    menu:     MenuSVG,
    calendar: CalendarSVG,
    profile:  ProfileSVG,
};

export default function PageBackground({ page }: { page: PageBg }) {
    const Bg = BG_MAP[page];
    return (
        <div aria-hidden="true" style={{
            position: 'fixed',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
            opacity: 0.09,
        }}>
            <Bg />
        </div>
    );
}
