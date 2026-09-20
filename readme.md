# Game

An arcade space shooter with two nine-wave rounds, insect enemies, orbiting
black/white-hole portals and two three-phase bosses.

## Play

**Play online: https://richorama.github.io/game/**

To play locally, run `python3 -m http.server 8000` from this directory and open
http://localhost:8000. The browser bundle is checked in, so no install is
needed to play.

Use the **arrow keys** to move, **hold Space** to fire all collected weapons,
and press **R** (or click **Restart**) to reset the game without reloading the
page. Restart clears enemies, shots, pickups, score and upgrades, restores full
health, and starts wave one again. Fly into glowing pickups to add weapons,
repair your ship, charge shields or boost your engines. Clear the final wave to
face the Hive Queen. Defeating her starts a four-second intermission, then round
two begins with your surviving health, shields, engine boosts, weapons and score
intact. Defeat the Rift Matriarch at the end of round two to win. Restart always
returns to round one with the starting loadout.

Round-one weapon drops arrive in waves **1, 2, 3, 5 and 7**: three-way spread
shot, rapid twin pulse, beam cannon, heat-seeking missiles and rear shot.
Round two uses the same unlock spacing for **rotary halo, flank cannons,
heavy pulse, rail lance and nova pulse**. Other main supply slots become repairs.
The rail lance pierces up to four distinct enemies; the nova pulse releases
twelve radial shots every 1.4 seconds. The side-mounted
beam cannon emits 12-pixel-wide energy segments every 24 milliseconds. Each
segment draws a line to the previous live segment, forming a smooth connected
beam as you strafe or gravity bends the stream. Segments keep their own world
positions, and collision detection follows the connecting lines. Releasing fire,
overheating, teleporting, or destroying a segment breaks the chain instead of drawing across
the gap.
The beam overheats after about 1.2 seconds of continuous fire, then locks out
for about 1.5 seconds while cooling. Release fire early to manage heat; the
HUD shows its charge and cooling state. The rotary halo turns continuously
and fires two opposing streams of weak bullets while Space is held.
Cyan, gold, green, pink, and violet trails
identify your weapons; orange and pink projectiles belong to enemies. Shot
size is independent of damage so even low-damage rounds remain visible.

Watch for chasing beetles, stationary spiders, weaving wasps firing paired
shots, spinner drones releasing radial volleys, and slow armoured beetles firing
three-shot fans. Armoured beetles'
glowing rings show remaining health.
Round two adds **rift lancers**, which telegraph fast straight-line dashes,
and tough **brood carriers**, which fire aimed fans and release up to three
pairs of spinner drones.

Temporary gravity wells appear in waves five, seven, and nine. After a
1.5-second warning, they pull every gameplay sprite within 280 pixels: your ship,
all enemies (including the Queen), pickups, and both sides' projectiles.
Bullets, missiles, and beam segments are absorbed at the core; ships, enemies,
and pickups are pulled without being deleted or automatically damaged. Steer
against the pull to escape. Momentum fades after leaving the field, and restart
clears it. Wells last 11 seconds; the HUD and decorative background stay fixed.
Their attraction is stronger than before, but you can still steer against it.

In round two, paired black and white holes orbit one another. Black holes
attract; white holes repel. **Everything entering a paired black core emerges
from its white partner**: your ship, enemies (including bosses), pickups,
missiles, bullets and beam segments. Ownership, damage, health and projectile
lifetime are preserved. Exits are kept on-screen, the player receives brief
arrival protection, and a shared 1.4-second transit cooldown prevents portal
loops. Beams break at portal jumps rather than connecting across the screen.
Pairs warn for 1.5 seconds, last 22 seconds in ordinary waves, and remain for
90 seconds during the Matriarch encounter.

Waves last **30 seconds**, with enemy groups arriving at the start and at
6, 14, and 22 seconds. Round one has **102 regular enemies plus the Queen**;
round two has **126 regular enemies plus the Matriarch**, before carrier broods.
Wasps arrive in wave two, spiders in wave four, and armoured beetles in wave
six. Each round's boss arrives **4 minutes 31 seconds** after that round begins;
progress depends on defeating the boss, not a timer. Watch the health bar: aimed fans intensify and
rotating bullet rings join the fight as her health falls through three phases.
The Matriarch has more health, faster attacks and an orbiting portal pair.
Ramming either boss damages your ship but does not instantly kill her.

There are **23 pickups per round**: five weapon unlocks plus repairs, shields, and engine
boosts. Every wave includes a support pickup. Shields absorb damage before hull
health, up to 100 points, with their charge shown in the HUD and around the ship.
Engine boosts improve movement speed up to 500 pixels per second.
An extra repair-and-shield supply arrives with the boss.
Even-numbered waves also drop a late field repair with their final reinforcements.

## Sound and effects

Synthesized arcade sounds cover weapons, explosions, damage, pickups, wave
announcements, boss attacks, and victory. Audio starts after the first keypress
or click; press **M** or use the **Sound** button to mute/unmute. Muting persists
across restarts. No audio downloads are needed.
Weapon sounds use quiet, rate-limited sine tones; the continuous beam and rotary
halo are silent to avoid a constant buzz.

Combat includes muzzle flares, additive sparks, shockwaves, pulsing star trails,
orbiting pickups, and brighter engine exhaust. Screen shake and brief impact
tints respect your system's reduced-motion preference; the HUD stays still.
The player interceptor and Hive Queen use detailed metallic vector artwork.

## Development

With Node.js 20 or newer, run `npm ci`, then `npm run watch` while editing,
or `npm run build` to update
the checked-in `index.min.js`. Run `npm test` for gameplay regression tests.
Movement uses pixels per second; long frame gaps are capped to avoid jumps
after switching tabs.

Pushes to `master` run the tests, rebuild the browser bundle, and deploy to
GitHub Pages through `.github/workflows/pages.yml`. The published site contains
only `index.html`, `index.min.js`, and the `svg/` assets. Deployment can also be
started manually from the workflow's Actions page.

# TODO

* ~~Health / death~~
* ~~Rebirth (R to restart)~~
* Levels menu
* ~~SoundFX~~
* Music
* ~~Sprites~~
* ~~Level design (nine-wave opening sector)~~
* ~~Final boss~~
* ~~Second sector with orbiting black/white holes~~
* ~~Text overlay~~
* Load progress (with image 'onload')
* Control from touch
* 'Are you ready?'

# Ideas

* Slow down time
* ~~Black holes (temporary gravity wells)~~
* ~~Heat seeking missiles~~
* ~~Bug sprites~~
* ~~ASCII are background (skull)~~
* Nuke

# Credits

Bug icons: https://thenounproject.com/yuluck/collection/insect/

ASCII Art: http://www.roysac.com/

# License

MIT