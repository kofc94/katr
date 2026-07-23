import React, { useEffect, useRef, useState } from 'react';
import { VIEW_W, VIEW_H } from '../game/constants.js';
import { loadAssets } from '../game/assets.js';
import { Game } from '../game/game.js';
import { createLoop } from '../game/loop.js';
import { attachInput } from '../game/input.js';
import { getHighScore, setHighScore } from '../game/highscore.js';

const EFFECT_LABEL = {
  invincible: '🌟 Golden Horseshoe',
  speed: '🥕 Carrot Boost',
};

/**
 * Fullscreen game overlay. Owns the canvas + engine lifecycle; React renders
 * only the surrounding UI (start screen, HUD, game-over). The 60fps canvas draw
 * never routes through React state — HUD is a throttled snapshot.
 */
export default function GameModal({ onClose, donateHref = '#tickets' }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const gameRef = useRef(null);
  const loopRef = useRef(null);
  const frameRef = useRef(0);

  const [phase, setPhase] = useState('loading'); // loading | ready | playing | gameover
  const [paused, setPaused] = useState(false);
  const [hud, setHud] = useState({ score: 0, distance: 0, lives: 3, shield: false, effect: null });
  const [result, setResult] = useState({ score: 0, best: getHighScore(), isNew: false });

  // --- engine setup (once) ---
  useEffect(() => {
    let cancelled = false;

    loadAssets()
      .then((images) => {
        if (cancelled) return;
        const canvas = canvasRef.current;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = VIEW_W * dpr;
        canvas.height = VIEW_H * dpr;
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.imageSmoothingEnabled = false;
        ctxRef.current = ctx;

        const game = new Game(images);
        game.onGameOver = (score) => {
          const best = getHighScore();
          const isNew = score > best;
          if (isNew) setHighScore(score);
          setResult({ score, best: Math.max(best, score), isNew });
          setPhase('gameover');
        };
        gameRef.current = game;

        const loop = createLoop(
          (dt) => game.update(dt),
          () => {
            game.render(ctx);
            // throttle HUD updates to ~10/sec
            if (frameRef.current++ % 6 === 0) setHud(game.getHud());
          }
        );
        loopRef.current = loop;

        const detachInput = attachInput(game, canvas);
        loop.start(); // renders the idle scene behind the start screen
        setPhase('ready');

        // pause when the tab/window loses focus
        const onVisibility = () => {
          if (document.hidden && game.state === 'running') {
            loop.pause();
            setPaused(true);
          }
        };
        document.addEventListener('visibilitychange', onVisibility);

        loopRef.current._detach = () => {
          detachInput();
          document.removeEventListener('visibilitychange', onVisibility);
        };
      })
      .catch(() => {
        if (!cancelled) setPhase('error');
      });

    return () => {
      cancelled = true;
      if (loopRef.current) {
        loopRef.current.stop();
        loopRef.current._detach?.();
      }
    };
  }, []);

  // Esc closes the modal
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if ((e.key === 'Enter') && (phase === 'ready' || phase === 'gameover')) startGame();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, onClose]);

  const startGame = () => {
    const game = gameRef.current;
    if (!game) return;
    game.start();
    setHud(game.getHud());
    loopRef.current.resume();
    setPaused(false);
    setPhase('playing');
  };

  const togglePause = () => {
    const loop = loopRef.current;
    if (!loop) return;
    if (loop.isPaused) {
      loop.resume();
      setPaused(false);
    } else {
      loop.pause();
      setPaused(true);
    }
  };

  const handleDonate = () => {
    onClose();
    // defer so the modal unmounts before we scroll the page underneath
    setTimeout(() => {
      document.querySelector(donateHref)?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };

  return (
    <div className="game-modal" role="dialog" aria-label="Ride for the Cause game" aria-modal="true">
      <div className="game-stage">
        <canvas
          ref={canvasRef}
          className="game-canvas"
          style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
        />

        {/* In-play HUD */}
        {phase === 'playing' && (
          <div className="game-hud">
            <div className="hud-left">
              <span className="hud-score">{hud.score.toLocaleString()}</span>
              <span className="hud-distance">{hud.distance}m</span>
            </div>
            <div className="hud-right">
              <span className="hud-lives" aria-label={`${hud.lives} lives`}>
                {'❤️'.repeat(Math.max(0, hud.lives))}
              </span>
              <button className="hud-btn" onClick={togglePause} aria-label="Pause">
                {loopRef.current?.isPaused ? '▶' : '⏸'}
              </button>
              <button className="hud-btn" onClick={onClose} aria-label="Close game">✕</button>
            </div>
            {(hud.effect || hud.shield) && (
              <div className="hud-effects">
                {hud.effect && (
                  <span className="hud-badge">
                    {EFFECT_LABEL[hud.effect.type]} {Math.ceil(hud.effect.remaining)}s
                  </span>
                )}
                {hud.shield && <span className="hud-badge">🛡️ Shield</span>}
              </div>
            )}
          </div>
        )}

        {/* Paused veil */}
        {phase === 'playing' && paused && (
          <div className="game-overlay">
            <div className="game-panel">
              <h3>Paused</h3>
              <button className="btn-primary" onClick={togglePause}><span>▶ Resume</span></button>
            </div>
          </div>
        )}

        {/* Loading / error */}
        {phase === 'loading' && (
          <div className="game-overlay"><div className="game-panel"><p>Loading…</p></div></div>
        )}
        {phase === 'error' && (
          <div className="game-overlay">
            <div className="game-panel">
              <p>Couldn’t load the game.</p>
              <button className="btn-secondary" onClick={onClose}><span>Close</span></button>
            </div>
          </div>
        )}

        {/* Start screen */}
        {phase === 'ready' && (
          <div className="game-overlay">
            <div className="game-panel">
              <h2 className="game-title">🐎 Ride for the Cause</h2>
              <p className="game-how">
                Jump the horse over fences and hay bales, splash through mud, and
                grab coins &amp; power-ups. You have 3 lives — see how far you can ride!
              </p>
              <p className="game-controls">
                <strong>Tap / Space / ↑</strong> to jump · hold for a higher jump
              </p>
              <p className="game-best">Best: {result.best.toLocaleString()}</p>
              <div className="game-actions">
                <button className="btn-primary" onClick={startGame}><span>▶ Start Race</span></button>
                <button className="btn-secondary" onClick={onClose}><span>Close</span></button>
              </div>
            </div>
          </div>
        )}

        {/* Game over */}
        {phase === 'gameover' && (
          <div className="game-overlay">
            <div className="game-panel">
              <h2 className="game-title">🏁 Race Over</h2>
              {result.isNew && <p className="game-newbest">🏆 New High Score!</p>}
              <p className="game-finalscore">{result.score.toLocaleString()}</p>
              <p className="game-best">Best: {result.best.toLocaleString()}</p>
              <div className="game-actions">
                <button className="btn-primary" onClick={startGame}><span>↻ Play Again</span></button>
                <button className="btn-secondary game-donate" onClick={handleDonate}>
                  <span>💛 Donate to the Cause</span>
                </button>
              </div>
              <button className="game-close-link" onClick={onClose}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
