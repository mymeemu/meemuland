"use client";

import { useEffect, useRef } from "react";
import {
  MessageCircle,
  Users,
  ShoppingBag,
  Smile,
  Settings
} from "lucide-react";

export default function CozyWorld() {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let game: any;
    let cancelled = false;

    async function initializeWorld() {
      const PhaserModule = await import("phaser");

      if (cancelled || !gameRef.current) return;

      const Phaser = PhaserModule.default;

      class MeemulandScene extends Phaser.Scene {
        private keys: any;
        private avatar: any;
        private nameTag: any;

        private playerX = 9;
        private playerY = 9;

        private tileWidth = 64;
        private tileHeight = 32;

        private offsetX = 650;
        private offsetY = 65;

        private obstacles = [
          { x: 4, y: 5 },
          { x: 13, y: 4 },
          { x: 5, y: 13 },
          { x: 14, y: 12 },
          { x: 9, y: 5 },
          { x: 12, y: 10 }
        ];

        constructor() {
          super("MeemulandScene");
        }

        private project(x: number, y: number) {
          return {
            x: this.offsetX + (x - y) * this.tileWidth / 2,
            y: this.offsetY + (x + y) * this.tileHeight / 2
          };
        }

        create() {
          this.drawMap();
          this.drawEnvironment();
          this.createPlayer();

          this.keys = this.input.keyboard!.addKeys(
            "W,A,S,D,UP,DOWN,LEFT,RIGHT"
          );

          this.cameras.main.setZoom(1.05);
          this.cameras.main.setBounds(-200, -100, 1700, 1100);
          this.cameras.main.startFollow(
            this.avatar,
            true,
            0.08,
            0.08
          );
        }

        private drawMap() {
          const ground = this.add.graphics();

          for (let x = 0; x < 18; x++) {
            for (let y = 0; y < 18; y++) {
              const p = this.project(x, y);

              const colors = [
                0xb9d9bd,
                0xc1dfc4,
                0xb5d5b8,
                0xc7e2c8
              ];

              const color = colors[(x + y) % colors.length];

              ground.fillStyle(color, 1);

              ground.fillPoints([
                new Phaser.Math.Vector2(p.x, p.y),
                new Phaser.Math.Vector2(
                  p.x + this.tileWidth / 2,
                  p.y + this.tileHeight / 2
                ),
                new Phaser.Math.Vector2(
                  p.x,
                  p.y + this.tileHeight
                ),
                new Phaser.Math.Vector2(
                  p.x - this.tileWidth / 2,
                  p.y + this.tileHeight / 2
                )
              ], true);

              ground.lineStyle(1, 0xa9cbaE, 0.35);

              ground.strokePoints([
                new Phaser.Math.Vector2(p.x, p.y),
                new Phaser.Math.Vector2(
                  p.x + this.tileWidth / 2,
                  p.y + this.tileHeight / 2
                ),
                new Phaser.Math.Vector2(
                  p.x,
                  p.y + this.tileHeight
                ),
                new Phaser.Math.Vector2(
                  p.x - this.tileWidth / 2,
                  p.y + this.tileHeight / 2
                )
              ], true);
            }
          }

          ground.setDepth(-100);
        }

        private drawEnvironment() {
          this.drawFountain(9, 8);

          this.drawTree(4, 5);
          this.drawTree(13, 4);
          this.drawTree(5, 13);
          this.drawTree(14, 12);

          this.drawBench(9, 4);
          this.drawBench(12, 10);

          this.drawFlower(7, 12);
          this.drawFlower(11, 14);
          this.drawFlower(3, 9);
        }

        private drawTree(gx: number, gy: number) {
          const p = this.project(gx, gy);
          const tree = this.add.graphics();

          tree.fillStyle(0x8b7057);
          tree.fillRect(-6, -31, 12, 34);

          tree.fillStyle(0x6f9d72);
          tree.fillRect(-25, -72, 50, 37);

          tree.fillStyle(0x86b785);
          tree.fillRect(-18, -84, 36, 25);

          tree.fillStyle(0xa4c995);
          tree.fillRect(-10, -88, 16, 10);

          tree.fillStyle(0x58845e);
          tree.fillRect(-25, -42, 10, 7);
          tree.fillRect(15, -51, 10, 7);

          tree.setPosition(p.x, p.y);
          tree.setDepth(p.y + 10);
        }

        private drawFountain(gx: number, gy: number) {
          const p = this.project(gx, gy);
          const fountain = this.add.graphics();

          fountain.fillStyle(0x9caaa0);
          fountain.fillPoints([
            new Phaser.Math.Vector2(-63, 0),
            new Phaser.Math.Vector2(0, 24),
            new Phaser.Math.Vector2(63, 0),
            new Phaser.Math.Vector2(0, -24)
          ], true);

          fountain.fillStyle(0xb8c8bc);
          fountain.fillPoints([
            new Phaser.Math.Vector2(-51, -3),
            new Phaser.Math.Vector2(0, 16),
            new Phaser.Math.Vector2(51, -3),
            new Phaser.Math.Vector2(0, -21)
          ], true);

          fountain.fillStyle(0x83c8d4);
          fountain.fillEllipse(0, -5, 80, 27);

          fountain.fillStyle(0xd2f3ec);
          fountain.fillCircle(0, -13, 9);

          fountain.fillStyle(0x83c8d4);
          fountain.fillCircle(0, -17, 5);

          fountain.setPosition(p.x, p.y);
          fountain.setDepth(p.y);
        }

        private drawBench(gx: number, gy: number) {
          const p = this.project(gx, gy);
          const bench = this.add.graphics();

          bench.fillStyle(0x98745b);
          bench.fillRect(-23, -17, 46, 8);
          bench.fillRect(-23, -9, 46, 6);

          bench.fillStyle(0x70543f);
          bench.fillRect(-19, -3, 5, 13);
          bench.fillRect(14, -3, 5, 13);

          bench.setPosition(p.x, p.y);
          bench.setDepth(p.y);
        }

        private drawFlower(gx: number, gy: number) {
          const p = this.project(gx, gy);
          const flower = this.add.graphics();

          flower.fillStyle(0x4f8c5b);
          flower.fillRect(-2, -17, 4, 17);

          flower.fillStyle(0xe99db5);
          flower.fillCircle(-5, -20, 4);
          flower.fillCircle(5, -20, 4);
          flower.fillCircle(0, -25, 4);

          flower.fillStyle(0xf5d48a);
          flower.fillCircle(0, -20, 3);

          flower.setPosition(p.x, p.y);
          flower.setDepth(p.y);
        }

        private createPlayer() {
          const p = this.project(this.playerX, this.playerY);

          this.avatar = this.add.container(p.x, p.y);

          const character = this.add.graphics();

          // Sombra
          character.fillStyle(0x526c55, 0.22);
          character.fillEllipse(0, 0, 27, 12);

          // Pernas
          character.fillStyle(0x5d617e);
          character.fillRect(-9, -15, 7, 13);
          character.fillRect(3, -15, 7, 13);

          // Sapatos
          character.fillStyle(0x574e58);
          character.fillRect(-10, -5, 8, 5);
          character.fillRect(3, -5, 8, 5);

          // Corpo
          character.fillStyle(0x9c86d9);
          character.fillRect(-12, -36, 24, 23);

          character.fillStyle(0xc1a9ec);
          character.fillRect(-12, -36, 24, 6);

          // Braços
          character.fillStyle(0xf1c5a7);
          character.fillRect(-17, -32, 6, 15);
          character.fillRect(11, -32, 6, 15);

          // Cabeça
          character.fillStyle(0xf3c9ae);
          character.fillRect(-13, -62, 26, 25);

          // Cabelo
          character.fillStyle(0x654c43);
          character.fillRect(-14, -68, 28, 12);
          character.fillRect(-15, -60, 6, 12);
          character.fillRect(9, -60, 6, 10);

          // Olhos
          character.fillStyle(0x453d3b);
          character.fillRect(-7, -54, 3, 4);
          character.fillRect(5, -54, 3, 4);

          // Bochechas
          character.fillStyle(0xe99a9a);
          character.fillRect(-11, -49, 4, 3);
          character.fillRect(8, -49, 4, 3);

          this.avatar.add(character);
          this.avatar.setDepth(p.y + 1);

          this.nameTag = this.add.text(
            p.x,
            p.y - 84,
            "Você",
            {
              fontFamily: "Arial",
              fontSize: "12px",
              color: "#425747",
              backgroundColor: "#ffffffdd",
              padding: { x: 9, y: 5 }
            }
          );

          this.nameTag.setOrigin(0.5);
          this.nameTag.setDepth(10000);
        }

        update(_time: number, delta: number) {
          if (!this.keys || !this.avatar) return;

          let vx = 0;
          let vy = 0;

          if (this.keys.A.isDown || this.keys.LEFT.isDown) vx--;
          if (this.keys.D.isDown || this.keys.RIGHT.isDown) vx++;
          if (this.keys.W.isDown || this.keys.UP.isDown) vy--;
          if (this.keys.S.isDown || this.keys.DOWN.isDown) vy++;

          if (vx === 0 && vy === 0) return;

          const length = Math.sqrt(vx * vx + vy * vy);

          vx /= length;
          vy /= length;

          const speed = 2.7 * delta / 1000;

          const nextX = this.playerX + (vx + vy) * speed / 2;
          const nextY = this.playerY + (vy - vx) * speed / 2;

          if (
            nextX < 0.5 || nextX > 16.5 ||
            nextY < 0.5 || nextY > 16.5
          ) return;

          const blocked = this.obstacles.some((obstacle) => {
            return (
              Math.abs(nextX - obstacle.x) < 0.65 &&
              Math.abs(nextY - obstacle.y) < 0.65
            );
          });

          if (blocked) return;

          this.playerX = nextX;
          this.playerY = nextY;

          const p = this.project(this.playerX, this.playerY);

          this.avatar.setPosition(p.x, p.y);
          this.avatar.setDepth(p.y + 1);

          this.nameTag.setPosition(p.x, p.y - 84);
        }
      }

      game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: gameRef.current,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: "#b9d9bd",
        pixelArt: true,
        antialias: false,
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH
        },
        scene: [MeemulandScene]
      });
    }

    initializeWorld();

    return () => {
      cancelled = true;
      if (game) game.destroy(true);
    };
  }, []);

  return (
    <main className="world-container">

      <div ref={gameRef} className="world-canvas" />

      <header className="world-topbar">

        <div className="world-brand">
          <strong>MEEMULAND</strong>
          <span>YOUR LITTLE SOCIAL WORLD</span>
        </div>

        <div className="world-player">

          <div className="player-card">
            <div className="player-avatar">🌷</div>

            <div className="player-info">
              <strong>Visitante</strong>
              <span>Explorando o mundo</span>
            </div>
          </div>

          <div className="world-actions">
            <button className="world-icon" aria-label="Configurações">
              <Settings size={17} />
            </button>
          </div>

        </div>

      </header>

      <div className="world-hint">
        Use W A S D ou as setas para explorar a praça
      </div>

      <nav className="world-bottom">

        <button className="world-tool">
          <span><MessageCircle size={19}/></span>
          Chat
        </button>

        <button className="world-tool">
          <span><Users size={19}/></span>
          Amigos
        </button>

        <button className="world-tool">
          <span><ShoppingBag size={19}/></span>
          Loja
        </button>

        <button className="world-tool">
          <span><Smile size={19}/></span>
          Emoções
        </button>

      </nav>

    </main>
  );
}