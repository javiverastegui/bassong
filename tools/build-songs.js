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

# 70s
Another Brick in the Wall, Pt. 2 | Pink Floyd | Another Brick in the Wall
ABC | The Jackson 5
Born to Run | Bruce Springsteen
Baba O'Riley | The Who
Blitzkrieg Bop | Ramones
Comfortably Numb | Pink Floyd
Carry On Wayward Son | Kansas
Don't Stop Me Now | Queen
Dream On | Aerosmith
Escape (The Piña Colada Song) | Rupert Holmes | Escape | The Piña Colada Song
Easy | Commodores
Free Bird | Lynyrd Skynyrd
Fire and Rain | James Taylor
Good Times | CHIC
Gimme! Gimme! Gimme! (A Man After Midnight) | ABBA | Gimme Gimme Gimme
Heart of Glass | Blondie
Highway to Hell | AC/DC
Heroes | David Bowie
I Feel Love | Donna Summer
Is This Love | Bob Marley
Jive Talkin' | Bee Gees
Jamming | Bob Marley
Just the Way You Are | Billy Joel
Knockin' on Heaven's Door | Bob Dylan
Kashmir | Led Zeppelin
Kung Fu Fighting | Carl Douglas
Layla | Derek & The Dominos
Lean on Me | Bill Withers
London Calling | The Clash
My Sharona | The Knack
Money | Pink Floyd
More Than a Feeling | Boston
Nutbush City Limits | Ike & Tina Turner
Old Time Rock & Roll | Bob Seger | Old Time Rock and Roll
One of These Nights | Eagles
Paranoid | Black Sabbath
Play That Funky Music | Wild Cherry
Queen Bitch | David Bowie
Roxanne | The Police
Rhiannon | Fleetwood Mac
Rapper's Delight | The Sugarhill Gang
Sweet Home Alabama | Lynyrd Skynyrd
September | Earth, Wind & Fire
Stairway to Heaven | Led Zeppelin
Sultans of Swing | Dire Straits
Tiny Dancer | Elton John
Take It Easy | Eagles
Us and Them | Pink Floyd
Vincent | Don McLean
Walk This Way | Aerosmith
Wish You Were Here | Pink Floyd
What's Going On | Marvin Gaye
You're So Vain | Carly Simon
Your Song | Elton John
You're the One That I Want | John Travolta

# 80s
Addicted to Love | Robert Palmer
Alone | Heart
Beat It | Michael Jackson
Back in Black | AC/DC
Blue Monday | New Order
Borderline | Madonna
Come On Eileen | Dexys Midnight Runners
Call Me | Blondie
Don't You (Forget About Me) | Simple Minds | Don't You Forget About Me | Don't You
Down Under | Men At Work
Dancing in the Dark | Bruce Springsteen
Everybody Wants to Rule the World | Tears for Fears
Eternal Flame | The Bangles
Flashdance... What a Feeling | Irene Cara | Flashdance | What a Feeling
Fast Car | Tracy Chapman
Ghostbusters | Ray Parker Jr.
Gold | Spandau Ballet
Hungry Like the Wolf | Duran Duran
Heaven Is a Place on Earth | Belinda Carlisle
Hello | Lionel Richie
I Love Rock 'N Roll | Joan Jett | I Love Rock and Roll
In the Air Tonight | Phil Collins
I Still Haven't Found What I'm Looking For | U2
Jessie's Girl | Rick Springfield
Just Like Heaven | The Cure
Jack & Diane | John Mellencamp
Kids in America | Kim Wilde
Kokomo | The Beach Boys
Let's Dance | David Bowie
Love Shack | The B-52's
La Isla Bonita | Madonna
Man in the Mirror | Michael Jackson
Maneater | Daryl Hall & John Oates
Money for Nothing | Dire Straits
Nothing's Gonna Stop Us Now | Starship
Need You Tonight | INXS
Open Arms | Journey
Once in a Lifetime | Talking Heads
Pour Some Sugar on Me | Def Leppard
Push It | Salt-N-Pepa
Papa Don't Preach | Madonna
Relax | Frankie Goes to Hollywood
Red Red Wine | UB40
Running Up That Hill (A Deal with God) | Kate Bush | Running Up That Hill
Sweet Dreams (Are Made of This) | Eurythmics | Sweet Dreams
Summer of '69 | Bryan Adams
Sledgehammer | Peter Gabriel
Should I Stay or Should I Go | The Clash
Total Eclipse of the Heart | Bonnie Tyler
Tainted Love | Soft Cell
Time After Time | Cyndi Lauper
The Final Countdown | Europe
Vacation | The Go-Go's
With or Without You | U2
Welcome to the Jungle | Guns N' Roses
We Built This City | Starship
What's Love Got to Do with It | Tina Turner
You Shook Me All Night Long | AC/DC
You Spin Me Round (Like a Record) | Dead or Alive | You Spin Me Round | You Spin Me Right Round
You Can Call Me Al | Paul Simon

# 90s
Always | Bon Jovi
Achy Breaky Heart | Billy Ray Cyrus
All I Want for Christmas Is You | Mariah Carey
Around the World | Daft Punk
Black Hole Sun | Soundgarden
Believe | Cher
Bitter Sweet Symphony | The Verve | Bittersweet Symphony
Barbie Girl | Aqua
Creep | TLC
Come As You Are | Nirvana
California Love | 2Pac
Crazy | Aerosmith
Don't Look Back in Anger | Oasis
Dreams | The Cranberries
Everybody (Backstreet's Back) | Backstreet Boys | Everybody | Backstreet's Back
Everlong | Foo Fighters
End of the Road | Boyz II Men
Every Morning | Sugar Ray
Fly Away | Lenny Kravitz
Freedom! '90 | George Michael | Freedom | Freedom 90
Friday I'm in Love | The Cure
Genie in a Bottle | Christina Aguilera
Good Riddance (Time of Your Life) | Green Day | Good Riddance | Time of Your Life
Gettin' Jiggy Wit It | Will Smith | Getting Jiggy With It
How Bizarre | OMC
Hold On | Wilson Phillips
Iris | Goo Goo Dolls
Ironic | Alanis Morissette
I Don't Want to Miss a Thing | Aerosmith
Jeremy | Pearl Jam
Just a Girl | No Doubt
Jumper | Third Eye Blind
Kiss from a Rose | Seal
Karma Police | Radiohead
Killing in the Name | Rage Against the Machine
Livin' la Vida Loca | Ricky Martin
Linger | The Cranberries
Loser | Beck
Lovefool | The Cardigans
Mambo No. 5 (A Little Bit of...) | Lou Bega | Mambo No. 5 | Mambo Number 5 | Mambo Number Five
My Heart Will Go On | Céline Dion
Mr. Jones | Counting Crows | Mister Jones
Nothing Compares 2 U | Sinéad O'Connor | Nothing Compares to You
November Rain | Guns N' Roses
One | U2
One Week | Barenaked Ladies
Only Happy When It Rains | Garbage
Pretty Fly (For a White Guy) | The Offspring | Pretty Fly
Paranoid Android | Radiohead
Praise You | Fatboy Slim
Rhythm Is a Dancer | SNAP!
Ray of Light | Madonna
Say My Name | Destiny's Child
Semi-Charmed Life | Third Eye Blind
Song 2 | Blur | Song Two
Smooth | Santana
Scar Tissue | Red Hot Chili Peppers
Tubthumping | Chumbawamba
Tearin' Up My Heart | *NSYNC
The Sign | Ace of Base
Under the Bridge | Red Hot Chili Peppers
Un-Break My Heart | Toni Braxton | Unbreak My Heart
Virtual Insanity | Jamiroquai
What's Up? | 4 Non Blondes
Waterfalls | TLC
What Is Love | Haddaway
You Get What You Give | New Radicals
You're Still the One | Shania Twain
You Learn | Alanis Morissette
Zoot Suit Riot | Cherry Poppin' Daddies

# 00s
A Thousand Miles | Vanessa Carlton
American Boy | Estelle
Apologize | OneRepublic
Boulevard of Broken Dreams | Green Day
Bleeding Love | Leona Lewis
Beautiful | Christina Aguilera
Bring Me to Life | Evanescence
Complicated | Avril Lavigne
Clocks | Coldplay
Chasing Cars | Snow Patrol
Can't Get You Out of My Head | Kylie Minogue
Drops of Jupiter (Tell Me) | Train | Drops of Jupiter
Dani California | Red Hot Chili Peppers
Disturbia | Rihanna
Everytime We Touch | Cascada
Electric Feel | MGMT
Feel Good Inc. | Gorillaz | Feel Good Inc
Fallin' | Alicia Keys
Float On | Modest Mouse
Fireflies | Owl City
Get the Party Started | P!nk
Girlfriend | Avril Lavigne
Gives You Hell | The All-American Rejects
Hot N Cold | Katy Perry | Hot and Cold
How to Save a Life | The Fray
Hollaback Girl | Gwen Stefani
In Da Club | 50 Cent | In the Club
I Kissed a Girl | Katy Perry
Irreplaceable | Beyoncé
In the End | Linkin Park
Jenny from the Block | Jennifer Lopez
Jesus Walks | Kanye West
Kryptonite | 3 Doors Down
Last Resort | Papa Roach
Low | Flo Rida
Love Story | Taylor Swift
Ms. Jackson | OutKast | Miss Jackson
Maps | Yeah Yeah Yeahs
Mercy | Duffy
No One | Alicia Keys
Naive | The Kooks
Ocean Avenue | Yellowcard
Pon de Replay | Rihanna
Pocketful of Sunshine | Natasha Bedingfield
Pump It | Black Eyed Peas
Rock Your Body | Justin Timberlake
Ridin' | Chamillionaire
Run | Snow Patrol
SexyBack | Justin Timberlake | Sexy Back
Stan | Eminem
Sk8er Boi | Avril Lavigne | Skater Boy | Sk8er Boy
Single Ladies (Put a Ring on It) | Beyoncé | Single Ladies
Somebody Told Me | The Killers
Take Me Out | Franz Ferdinand
The Middle | Jimmy Eat World
Teenage Dirtbag | Wheatus
Tik Tok | Kesha
Unwritten | Natasha Bedingfield
Use Somebody | Kings of Leon
We Belong Together | Mariah Carey
Whenever, Wherever | Shakira
Without Me | Eminem
You're Beautiful | James Blunt

# 10s
All About That Bass | Meghan Trainor
Applause | Lady Gaga
Attention | Charlie Puth
Blank Space | Taylor Swift
Blinding Lights | The Weeknd
Bang Bang | Jessie J
Born This Way | Lady Gaga
Can't Stop the Feeling! | Justin Timberlake
Counting Stars | OneRepublic
Chandelier | Sia
Cheap Thrills | Sia
Closer | The Chainsmokers
Diamonds | Rihanna
Dynamite | Taio Cruz
Drunk in Love | Beyoncé
E.T. | Katy Perry
Ex's & Oh's | Elle King | Exes and Ohs
Fancy | Iggy Azalea
Feel It Still | Portugal. The Man
Formation | Beyoncé
Fight Song | Rachel Platten
Gangnam Style | PSY
Good as Hell | Lizzo
Girls Like You | Maroon 5
God's Plan | Drake
Havana | Camila Cabello
Ho Hey | The Lumineers
Hotline Bling | Drake
HUMBLE. | Kendrick Lamar
I Don't Care | Ed Sheeran
I Like It | Cardi B
I Love It | Icona Pop
Just the Way You Are | Bruno Mars
Just Give Me a Reason | P!nk
Jealous | Nick Jonas
Kiss You | One Direction
Lose You to Love Me | Selena Gomez
Let It Go | Idina Menzel
Love Yourself | Justin Bieber
Lean On | Major Lazer
Little Talks | Of Monsters and Men
Mirrors | Justin Timberlake
Marry You | Bruno Mars
Night Changes | One Direction
No Tears Left to Cry | Ariana Grande
One Kiss | Calvin Harris
One Dance | Drake
Only Girl (In the World) | Rihanna | Only Girl
Party Rock Anthem | LMFAO
Pumped Up Kicks | Foster the People
Problem | Ariana Grande
Payphone | Maroon 5
Radioactive | Imagine Dragons
Riptide | Vance Joy
Rude | MAGIC!
Someone Like You | Adele
Somebody That I Used to Know | Gotye
Stay With Me | Sam Smith
Sorry | Justin Bieber
Stressed Out | twenty one pilots
Señorita | Shawn Mendes
Thrift Shop | Macklemore
Take Me to Church | Hozier
Teenage Dream | Katy Perry
thank u, next | Ariana Grande | Thank You Next
Timber | Pitbull
Truth Hurts | Lizzo
Unconditionally | Katy Perry
Versace on the Floor | Bruno Mars
What Makes You Beautiful | One Direction
Wake Me Up | Avicii
We Are Young | fun.
Wildest Dreams | Taylor Swift
Work | Rihanna
Watermelon Sugar | Harry Styles
You Need to Calm Down | Taylor Swift
Young Dumb & Broke | Khalid | Young Dumb and Broke
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

// Songs already in ../songs.js are kept as they are, and known misses are remembered in
// tools/misses.json, so a re-run only asks iTunes about what is new. Progress is saved as it
// goes: if a run is cut short, run it again and it carries on. Delete misses.json to retry them.
const OUT_FILE = path.join(__dirname, '..', 'songs.js');
const MISS_FILE = path.join(__dirname, 'misses.json');
// The letter a title is filed under: its first letter exactly as written ("The Sign" is a T).
const firstLetter = (title) => title.normalize('NFD').replace(/[̀-ͯ]/g, '').match(/[A-Za-z]/)[0].toUpperCase();
const keyOf = (s) => `${s.dec}|${norm(s.title)}`;
const found = new Map();
try {
  delete require.cache[OUT_FILE];
  for (const list of Object.values(require(OUT_FILE))) for (const s of list) if (s.dec) found.set(keyOf(s), s);
} catch { /* no catalogue yet */ }
let missed = new Set();
try { missed = new Set(JSON.parse(fs.readFileSync(MISS_FILE, 'utf8'))); } catch { /* none yet */ }

function save() {
  const out = {};
  for (const song of songs) {
    const hit = found.get(keyOf(song));
    if (!hit) continue;
    const letter = song.contains || firstLetter(song.title);
    (out[letter] ||= []).push(hit);
  }
  const sorted = Object.fromEntries(Object.keys(out).sort().map((k) => [k, out[k]]));
  fs.writeFileSync(OUT_FILE,
    '// Generated by tools/build-songs.js — do not edit by hand.\n' +
    `const SONGS = ${JSON.stringify(sorted, null, 1)};\n` +
    "if (typeof module !== 'undefined') module.exports = SONGS;\n");
  fs.writeFileSync(MISS_FILE, JSON.stringify([...missed], null, 1) + '\n');
  return sorted;
}

(async () => {
  const out = {};
  const missing = [];
  let asked = 0;
  for (const song of songs) {
    if (found.has(keyOf(song))) continue;
    if (missed.has(keyOf(song))) { missing.push(`${song.title} | ${song.artist} (${song.dec})`); continue; }
    if (++asked % 15 === 0) save();
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
      // an empty answer may just be the rate limit, so only a real "no match" is remembered
      if (results.length) missed.add(keyOf(song));
      missing.push(`${song.title} | ${song.artist} (${song.dec})`);
      console.log(`MISS ${song.title} — ${song.artist} (${results.length} results, ${candidates.length} title+artist matches)`);
    } else {
      found.set(keyOf(song), {
        id: hit.trackId, title: song.title, artist: hit.artistName, alt: song.alt, dec: song.dec,
        ...(song.contains ? { contains: true } : {}),
        preview: hit.previewUrl, art: hit.artworkUrl100 || '', url: hit.trackViewUrl || '',
      });
      console.log(`ok   ${song.dec} ${song.title} — ${hit.artistName} [${hit.trackName}]`);
    }
    await sleep(3200);
  }
  const sorted = save();
  const file = OUT_FILE;
  const all = Object.values(sorted).flat();
  console.log(`\nWrote ${file}: ${all.length} songs.`);
  console.log(`Missing songs: ${missing.length ? missing.join('; ') : 'none'}`);
  for (const dec of [...new Set(songs.map((s) => s.dec))]) {
    const gaps = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter((l) => !(sorted[l] || []).some((s) => s.dec === dec));
    console.log(`${dec}: ${all.filter((s) => s.dec === dec).length} songs, letters without a song: ${gaps.join(' ') || 'none'}`);
  }
})();
