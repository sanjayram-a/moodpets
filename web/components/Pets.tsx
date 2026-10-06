// SVG animals ported from "Emotion Dog.html" / "Emotion Sheep.html".
// The face is driven purely by the data-e attribute (see globals.css).

const HEART = "M0 -4C-2 -10 -12 -10 -12 -2C-12 5 -3 9 0 13C3 9 12 5 12 -2C12 -10 2 -10 0 -4Z";
const DROP = "M0 0C-5 8 -6 12 0 14C6 12 5 8 0 0Z";

function Face() {
  return (
    <>
      <path className="nose" d="M186 216Q200 208 214 216Q214 230 200 236Q186 230 186 216Z" />
      <ellipse cx="193" cy="215" rx="6" ry="2.8" fill="#fff" opacity=".45" />

      <path className="v m-smile ln" d="M200 236V242M200 242Q190 254 178 246M200 242Q210 254 222 246" />
      <g className="v m-open">
        <path className="mouthfill" d="M176 244Q200 256 224 244Q220 286 200 288Q180 286 176 244Z" />
        <path className="tongue" d="M188 272Q200 262 212 272Q209 287 200 288Q191 287 188 272Z" />
        <path className="ln" d="M200 236V250" />
      </g>
      <path className="v m-sad ln" d="M200 236V242M200 242Q190 240 178 254M200 242Q210 240 222 254" />
      <g className="v m-angry">
        <path className="mouthfill" d="M174 252Q200 238 226 252Q200 262 174 252Z" />
        <path className="fang" d="M184 247L189 258L194 246Z" />
        <path className="fang" d="M206 246L211 258L216 247Z" />
        <path className="ln" d="M200 236V244" />
      </g>
      <path className="v m-scared ln" d="M200 236V244M176 256Q184 248 192 256T208 256T224 256" />
      <g className="v m-wow">
        <ellipse className="mouthfill" cx="200" cy="262" rx="13" ry="17" />
        <ellipse className="tongue" cx="200" cy="272" rx="7" ry="5" />
        <path className="ln" d="M200 236V245" />
      </g>
      <path className="v m-curious ln" d="M200 236V242M200 242Q188 250 180 244M200 242Q212 254 224 248" />
      <path className="v m-puppy ln" d="M200 236V242M200 242Q194 252 186 246M200 242Q206 252 214 246" />

      <ellipse className="v blush blushc" cx="138" cy="238" rx="14" ry="8" />
      <ellipse className="v blush blushc" cx="262" cy="238" rx="14" ry="8" />

      <g className="e-open">
        <g className="eye"><g className="bl">
          <circle className="pup" cx="158" cy="190" r="14" />
          <circle cx="163" cy="184" r="5" fill="#fff" />
          <circle cx="153" cy="196" r="2.4" fill="#fff" opacity=".9" />
          <circle className="v spk" cx="165" cy="195" r="2.6" fill="#fff" />
        </g></g>
        <g className="eye"><g className="bl">
          <circle className="pup" cx="242" cy="190" r="14" />
          <circle cx="247" cy="184" r="5" fill="#fff" />
          <circle cx="237" cy="196" r="2.4" fill="#fff" opacity=".9" />
          <circle className="v spk" cx="249" cy="195" r="2.6" fill="#fff" />
        </g></g>
      </g>
      <g className="v e-happy ln">
        <path d="M147 192Q160 174 173 192" />
        <path d="M227 192Q240 174 253 192" />
      </g>
      <g className="v e-heart">
        <g transform="translate(160 188)"><use className="pulse hrt" href="#hp" /></g>
        <g transform="translate(240 188)"><use className="pulse hrt" href="#hp" /></g>
      </g>

      <g className="v l-half furfill">
        <polygon points="142,168 178,168 178,188 142,188" />
        <polygon points="222,168 258,168 258,188 222,188" />
      </g>
      <g className="v l-angry furfill">
        <polygon points="142,166 178,166 178,192 142,178" />
        <polygon points="258,166 222,166 222,192 258,178" />
      </g>
      <g className="v l-sad furfill">
        <polygon points="142,166 178,166 178,178 142,192" />
        <polygon points="258,166 222,166 222,178 258,192" />
      </g>

      <path className="brow brow-l" d="M147 162H173" />
      <path className="brow brow-r" d="M227 162H253" />
    </>
  );
}

function Extras({ hearts }: { hearts: [number, number][] }) {
  return (
    <>
      <g className="v d-tear"><g transform="translate(168 204)"><path className="drip" d={DROP} /></g></g>
      <g className="v d-sweat"><g transform="translate(305 110) scale(1.3)"><path className="drip" d={DROP} /></g></g>
      <g className="v d-anger"><path className="mark" d="M312 92L332 92M312 108L332 108M319 84L319 116M325 84L325 116" /></g>
      <text className="v d-bang sym" x="326" y="112">!</text>
      <text className="v d-ques sym" x="326" y="112">?</text>
      <g className="v d-hearts">
        {hearts.map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <use className="rise hrt" style={{ animationDelay: `${i * 0.8}s` }} href="#hp" />
          </g>
        ))}
      </g>
    </>
  );
}

type Props = { emotion: string; label: string };

export function Dog({ emotion, label }: Props) {
  return (
    <svg className="pet dog" data-e={emotion} viewBox="0 30 400 372" role="img" aria-label={label}>
      <defs><path id="hp" d={HEART} /></defs>
      <ellipse className="ground" cx="200" cy="392" rx="130" ry="14" />
      <path className="tail furd" d="M280 362C330 352 354 302 342 272C338 262 324 264 326 277C332 306 314 334 280 338Z" />
      <ellipse className="fur" cx="200" cy="385" rx="100" ry="78" />
      <ellipse className="furl" cx="200" cy="378" rx="46" ry="44" />
      <ellipse className="fur" cx="200" cy="305" rx="72" ry="32" />
      <path className="collar" d="M118 312Q200 342 282 312L286 330Q200 362 114 330Z" />
      <circle className="tag" cx="200" cy="350" r="9" />
      <g className="fx"><g className="head">
        <ellipse className="fur" cx="200" cy="200" rx="105" ry="95" />
        <ellipse className="furl" cx="200" cy="172" rx="18" ry="42" />
        <g className="ear ear-l"><path className="furd" d="M128 125C90 118 62 160 66 215C68 250 92 270 112 250C128 232 140 170 140 140Z" /><path className="earin" d="M122 145C100 144 84 172 86 208C87 228 98 238 108 228C118 216 126 176 126 152Z" opacity=".55" /></g>
        <g className="ear ear-r"><path className="furd" d="M272 125C310 118 338 160 334 215C332 250 308 270 288 250C272 232 260 170 260 140Z" /><path className="earin" d="M278 145C300 144 316 172 314 208C313 228 302 238 292 228C282 216 274 176 274 152Z" opacity=".55" /></g>
        <ellipse className="furl" cx="200" cy="246" rx="60" ry="44" />
        <Face />
      </g></g>
      <Extras hearts={[[300, 100], [110, 104], [205, 78]]} />
    </svg>
  );
}

export function Sheep({ emotion, label }: Props) {
  return (
    <svg className="pet sheep" data-e={emotion} viewBox="0 30 400 372" role="img" aria-label={label}>
      <defs>
        <path id="hp" d={HEART} />
        <g id="woolBody">
          <circle cx="200" cy="372" r="78" /><circle cx="125" cy="352" r="46" /><circle cx="275" cy="352" r="46" />
          <circle cx="95" cy="398" r="42" /><circle cx="305" cy="398" r="42" />
          <circle cx="162" cy="326" r="38" /><circle cx="238" cy="326" r="38" />
        </g>
        <g id="woolHead">
          <circle cx="200" cy="100" r="34" /><circle cx="152" cy="118" r="30" /><circle cx="248" cy="118" r="30" />
          <circle cx="116" cy="148" r="22" /><circle cx="284" cy="148" r="22" />
          <circle cx="176" cy="122" r="26" /><circle cx="224" cy="122" r="26" />
        </g>
        <g id="woolTail"><circle cx="314" cy="350" r="15" /><circle cx="326" cy="338" r="11" /><circle cx="324" cy="358" r="11" /></g>
      </defs>
      <ellipse className="ground" cx="200" cy="392" rx="140" ry="14" />
      <g className="tail"><use href="#woolTail" className="woolO" /><use href="#woolTail" className="woolF" /></g>
      <use href="#woolBody" className="woolO" /><use href="#woolBody" className="woolF" />
      <path className="collar" d="M118 312Q200 342 282 312L286 330Q200 362 114 330Z" />
      <circle className="tag" cx="200" cy="350" r="9" />
      <g className="fx"><g className="head">
        <g className="ear ear-l">
          <path className="furd" d="M120 170C94 150 54 158 42 182C54 206 94 210 122 196Z" />
          <path className="earin" d="M114 175C94 162 68 167 58 182C68 197 94 200 114 190Z" />
        </g>
        <g className="ear ear-r">
          <path className="furd" d="M280 170C306 150 346 158 358 182C346 206 306 210 278 196Z" />
          <path className="earin" d="M286 175C306 162 332 167 342 182C332 197 306 200 286 190Z" />
        </g>
        <ellipse className="fur" cx="200" cy="205" rx="88" ry="94" />
        <use href="#woolHead" className="woolO" /><use href="#woolHead" className="woolF" />
        <ellipse className="furl" cx="200" cy="248" rx="58" ry="42" />
        <Face />
      </g></g>
      <Extras hearts={[[300, 92], [100, 96], [205, 52]]} />
    </svg>
  );
}
