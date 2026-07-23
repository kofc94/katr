This a design document for a small in-browser JavaScript video game.

Core concept: “Ride for the Cause”

The player controls a horse running automatically from left to right. The goal is to travel as far as possible, collect fundraising-themed items, and avoid obstacles.

Controls:

* Spacebar / tap: Jump
* Hold: Higher or longer jump
* Down arrow / swipe down: Duck
* B / tap on item: Use a temporary boost

Keeping it playable with one button would make it work well on both phones and computers.

Obstacles

We gradually introduce different obstacle types:

* Wooden fences
* Hay bales
* Mud puddles that slow the horse
* Fallen tree branches
* Water jumps
* Rolling barrels
* Low tree limbs that require ducking
* Chickens, geese, or squirrels crossing the track
* Rival riders who throw harmless obstacles behind them


Power-ups

Power-ups could reinforce the fundraising theme:

* Golden Horseshoe: Temporary invincibility
* Carrot Boost: Increased speed
* Angel Wings: Fly over obstacles briefly
* Shield: Protects against one collision
* Magnet: Pulls nearby coins or donations toward the player
* Second Wind: Restores lost stamina
* Double Donation: Doubles the points collected for several seconds
* Volunteer Team: Friendly riders appear and clear obstacles ahead

You might represent collectible points as coins, donation envelopes, hearts, stars, or organization-specific symbols.

Enemies and rivals

The enemies do not need to be violent. They can be humorous impediments:

* A mischievous fox
* An angry goose
* A rival jockey
* A raccoon stealing collected coins
* A storm cloud that creates slippery ground
* A tractor that temporarily blocks part of the course
* A “Paperwork Monster” throwing forms onto the track
* A cartoon villain trying to interfere with the fundraiser

A recurring rival rider could appear throughout the race and become the final opponent.

Game structure

Option 1: Endless runner

The horse keeps running until the player loses all three lives.

This is probably the simplest format to build.

The score could be based on:

* Distance traveled
* Items collected
* Obstacles cleared
* Consecutive jumps without hitting anything

For the initial release, I would keep the scope small:

* One horse
* One background
* Jump control
* Three obstacle types
* Three power-ups
* Three lives
* Endless gameplay
* Local high score
* A “Donate” button on the results screen


Fundraising integration

The game could encourage participation without making payment affect gameplay unfairly.

Ideas include:

* Displaying a donation button after each race
* Showing a community distance goal
* Displaying sponsor logos on fences or banners
* Awarding a printable or downloadable “Champion Rider” certificate


A slightly more distinctive mechanic

Instead of controlling only the jump, the player could manage the horse’s stamina.

Running faster drains stamina. Carrots restore it. Players must decide whether to sprint toward a power-up or conserve energy for an upcoming jump.

That adds strategy while remaining simple:

* Tap: jump
* Hold right side of screen: sprint
* Release: normal speed

Recommended visual style

A colorful 2D cartoon style would likely work best:

* Large, readable objects
* Friendly animation
* Minimal text during gameplay
* Strong contrast for mobile screens
* Comical collision animations rather than realistic injuries