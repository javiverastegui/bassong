// Builds ../songs.js from the list below using the public iTunes Search API.
// Run:  node tools/build-songs.js
//
// List format:
//   # 80s                                  -> every line below belongs to that decade
//   Title | Artist | alt answer | alt …    -> filed under the first letter of the title
//   [X] Title | Artist                     -> filed under X as a "title CONTAINS X" clue
//
// The API allows roughly 20 requests per minute, so the script waits between calls.
const fs = require('fs');
const path = require('path');

const LIST = `
# 70s
American Pie | Don McLean
Bohemian Rhapsody | Queen
Crocodile Rock | Elton John
Dancing Queen | ABBA
Dreams | Fleetwood Mac
Evil Woman | Electric Light Orchestra
Fame | David Bowie
Go Your Own Way | Fleetwood Mac
Hotel California | Eagles
I Will Survive | Gloria Gaynor
Imagine | John Lennon
Jolene | Dolly Parton
Killing Me Softly With His Song | Roberta Flack | Killing Me Softly
Let It Be | The Beatles
Le Freak | CHIC
Mamma Mia | ABBA
Night Fever | Bee Gees
One Way or Another | Blondie
Piano Man | Billy Joel
[Q] Killer Queen | Queen
Rocket Man | Elton John
Stayin' Alive | Bee Gees
Superstition | Stevie Wonder
Take Me Home, Country Roads | John Denver | Country Roads
Up Around the Bend | Creedence Clearwater Revival
Video Killed the Radio Star | The Buggles
Waterloo | ABBA
We Will Rock You | Queen
[X] Exodus | Bob Marley
Y.M.C.A. | Village People
Ziggy Stardust | David Bowie

# 80s
Africa | Toto
Another One Bites the Dust | Queen
Billie Jean | Michael Jackson
Careless Whisper | George Michael
Don't Stop Believin' | Journey
Eye of the Tiger | Survivor
Every Breath You Take | The Police
Faith | George Michael
Footloose | Kenny Loggins
Girls Just Want to Have Fun | Cyndi Lauper | Girls Just Wanna Have Fun
Holding Out for a Hero | Bonnie Tyler
I Wanna Dance with Somebody (Who Loves Me) | Whitney Houston | I Wanna Dance with Somebody
Jump | Van Halen
Karma Chameleon | Culture Club
Kiss | Prince
Livin' on a Prayer | Bon Jovi
Like a Virgin | Madonna
Material Girl | Madonna
Never Gonna Give You Up | Rick Astley
Our House | Madness
Purple Rain | Prince
Queen of Hearts | Juice Newton
Rio | Duran Duran
Sweet Child O' Mine | Guns N' Roses | Sweet Child of Mine
Thriller | Michael Jackson
Take On Me | a-ha
Under Pressure | Queen
Uptown Girl | Billy Joel
Venus | Bananarama
Walk Like an Egyptian | The Bangles
Wake Me Up Before You Go-Go | Wham!
Xanadu | Olivia Newton-John
You Give Love a Bad Name | Bon Jovi
[Z] Tarzan Boy | Baltimora

# 90s
All Star | Smash Mouth
...Baby One More Time | Britney Spears | Baby One More Time | Hit Me Baby One More Time
Champagne Supernova | Oasis
Don't Speak | No Doubt
Enter Sandman | Metallica
Fantasy | Mariah Carey
Gangsta's Paradise | Coolio
Hero | Mariah Carey
I Want It That Way | Backstreet Boys
I Will Always Love You | Whitney Houston
Jump Around | House of Pain
Killing Me Softly With His Song | Fugees | Killing Me Softly
Losing My Religion | R.E.M.
MMMBop | Hanson
No Scrubs | TLC
Nothing Else Matters | Metallica
Ordinary World | Duran Duran
Poison | Bell Biv DeVoe
Quit Playing Games (With My Heart) | Backstreet Boys | Quit Playing Games
Runaway Train | Soul Asylum
Smells Like Teen Spirit | Nirvana
Thunderstruck | AC/DC
Torn | Natalie Imbruglia
U Can't Touch This | MC Hammer | You Can't Touch This
Vogue | Madonna
Wonderwall | Oasis
Wannabe | Spice Girls
[X] I'm Too Sexy | Right Said Fred | Too Sexy
You Oughta Know | Alanis Morissette
Zombie | The Cranberries

# 00s
American Idiot | Green Day
Beautiful Day | U2
Bad Romance | Lady Gaga
Crazy in Love | Beyoncé
Dilemma | Nelly
Don't Stop the Music | Rihanna
Empire State of Mind | JAY-Z
Fix You | Coldplay
Gold Digger | Kanye West
Hey Ya! | OutKast
Hips Don't Lie | Shakira
I Gotta Feeling | Black Eyed Peas | I Got a Feeling
Just Dance | Lady Gaga
Kids | MGMT
Lose Yourself | Eminem
Mr. Brightside | The Killers | Mister Brightside
Numb | Linkin Park
One More Time | Daft Punk
Oops!... I Did It Again | Britney Spears
Paper Planes | M.I.A.
Party in the U.S.A. | Miley Cyrus
Question! | System Of A Down
Rehab | Amy Winehouse
Since U Been Gone | Kelly Clarkson | Since You Been Gone | Since You've Been Gone
Seven Nation Army | The White Stripes
Toxic | Britney Spears
Umbrella | Rihanna
Viva la Vida | Coldplay
Valerie | Mark Ronson
Wake Me Up When September Ends | Green Day
Where Is the Love? | Black Eyed Peas
X Gon' Give It to Ya | DMX | X Gon Give It to You | X Gonna Give It to Ya
Yellow | Coldplay
Yeah! | Usher
You Belong With Me | Taylor Swift
[Z] Crazy | Gnarls Barkley

# 10s
All of Me | John Legend
Bad Guy | Billie Eilish
Believer | Imagine Dragons
Call Me Maybe | Carly Rae Jepsen
California Gurls | Katy Perry | California Girls
Dark Horse | Katy Perry
Don't Start Now | Dua Lipa
Elastic Heart | Sia
Firework | Katy Perry
Get Lucky | Daft Punk
Happy | Pharrell Williams
Hello | Adele
I Knew You Were Trouble | Taylor Swift
Juice | Lizzo
King | Years & Years
Locked Out of Heaven | Bruno Mars
Moves Like Jagger | Maroon 5
New Rules | Dua Lipa
Old Town Road | Lil Nas X
Perfect | Ed Sheeran
[Q] Earthquake | Labrinth
Rolling in the Deep | Adele
Royals | Lorde
Roar | Katy Perry
Shake It Off | Taylor Swift
Shape of You | Ed Sheeran
Thinking Out Loud | Ed Sheeran
Titanium | David Guetta
Uptown Funk | Mark Ronson
Video Games | Lana Del Rey
Wrecking Ball | Miley Cyrus
We Found Love | Rihanna
XO | Beyoncé
Youngblood | 5 Seconds of Summer
Zero | Imagine Dragons
`;

const songs = [];
let decade = null;
for (const raw of LIST.split('\n')) {
  const line = raw.trim();
  if (!line) continue;
  if (line.startsWith('#')) { decade = line.slice(1).trim(); continue; }
  const tag = line.match(/^\[([A-Za-z])\]\s*/);
  const [title, artist, ...alt] = line.slice(tag ? tag[0].length : 0).split('|').map((s) => s.trim());
  songs.push({ title, artist, alt, dec: decade, contains: tag ? tag[1].toUpperCase() : null });
}

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/&/g, 'and').replace(/^the\s+/, '').replace(/[^a-z0-9]/g, '');
// "Song (Remastered 2011)" / "Song - Single Version" -> "Song"
const bare = (s) => s.replace(/\s*[\(\[].*$/, '').replace(/\s+-\s.*$/, '');
const BAD = /\b(live|karaoke|remix|instrumental|tribute|cover|acoustic|demo|re-?recorded|mix|edit|version|unplugged|extended|sessions?|peel|bbc)\b/i;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function search(term) {
  const url = `https://itunes.apple.com/search?media=music&entity=song&country=US&limit=25&term=${encodeURIComponent(term)}`;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url);
      if (res.ok) return (await res.json()).results || [];
      console.log(`  HTTP ${res.status}, waiting 30 s (attempt ${attempt})`);
    } catch (e) {
      console.log(`  network error: ${e.message}, waiting 30 s (attempt ${attempt})`);
    }
    await sleep(30000);
  }
  return [];
}

(async () => {
  const out = {};
  const missing = [];
  for (const song of songs) {
    const term = `${bare(song.title).replace(/^\.+/, '')} ${song.artist}`;
    let results = await search(term);
    if (!results.length) { await sleep(8000); results = await search(term); }
    const wantTitle = [norm(song.title), norm(bare(song.title))];
    const wantArtist = norm(song.artist);
    const candidates = results.filter((r) =>
      r.previewUrl && r.trackId && norm(r.artistName || '').includes(wantArtist) &&
      (wantTitle.includes(norm(r.trackName)) || wantTitle.includes(norm(bare(r.trackName)))));
    // Best first: a clean title that matches exactly, then a clean title with a "(feat. …)" style suffix.
    const clean = candidates.filter((r) => !BAD.test(r.trackName));
    const exact = clean.filter((r) => wantTitle.includes(norm(r.trackName)));
    const pool = exact.length ? exact : clean;
    const hit = pool.find((r) => !BAD.test(r.collectionName || '')) || pool[0] || null;
    if (!hit) {
      missing.push(`${song.title} | ${song.artist} (${song.dec})`);
      console.log(`MISS ${song.title} — ${song.artist} (${results.length} results, ${candidates.length} title+artist matches)`);
    } else {
      const letter = song.contains || norm(song.title)[0].toUpperCase();
      (out[letter] ||= []).push({
        id: hit.trackId, title: song.title, artist: hit.artistName, alt: song.alt, dec: song.dec,
        ...(song.contains ? { contains: true } : {}),
        preview: hit.previewUrl, art: hit.artworkUrl100 || '', url: hit.trackViewUrl || '',
      });
      console.log(`ok   ${song.dec} ${letter} ${song.title} — ${hit.artistName} [${hit.trackName}]`);
    }
    await sleep(3200);
  }
  const sorted = Object.fromEntries(Object.keys(out).sort().map((k) => [k, out[k]]));
  const file = path.join(__dirname, '..', 'songs.js');
  fs.writeFileSync(file,
    '// Generated by tools/build-songs.js — do not edit by hand.\n' +
    `const SONGS = ${JSON.stringify(sorted, null, 1)};\n` +
    "if (typeof module !== 'undefined') module.exports = SONGS;\n");
  const all = Object.values(sorted).flat();
  console.log(`\nWrote ${file}: ${all.length} songs.`);
  console.log(`Missing songs: ${missing.length ? missing.join('; ') : 'none'}`);
  for (const dec of [...new Set(songs.map((s) => s.dec))]) {
    const gaps = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter((l) => !(sorted[l] || []).some((s) => s.dec === dec));
    console.log(`${dec}: ${all.filter((s) => s.dec === dec).length} songs, letters without a song: ${gaps.join(' ') || 'none'}`);
  }
})();
