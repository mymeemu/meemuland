"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import {
  UserRound,
  Music2,
  Heart,
  Film,
  BookOpen,
  Image as ImageIcon,
  Instagram,
  Youtube,
  Gamepad2,
  Plus,
  Settings2,
  Sparkles,
  Pencil,
  ExternalLink,
  Camera,
  Quote,
} from "lucide-react";
import * as THREE from "three";

function AvatarModel() {
  const { scene } = useGLTF("/meemu-avatar.glb");

  const model = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });

    return clone;
  }, [scene]);

  return (
    <primitive
      object={model}
      scale={1.5}
      position={[0, -0.65, 0]}
    />
  );
}

function AvatarPreview() {
  return (
    <Canvas
      camera={{ position: [0, 1.45, 4.5], fov: 30 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={1.5} />
      <directionalLight position={[3, 5, 4]} intensity={2} />
      <directionalLight
        position={[-3, 2, -2]}
        intensity={0.8}
        color="#c9baff"
      />

      <Suspense fallback={null}>
        <AvatarModel />
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 2.7}
        maxPolarAngle={Math.PI / 2}
        minAzimuthAngle={-Math.PI / 2}
        maxAzimuthAngle={Math.PI / 2}
        target={[0, 1.2, 0]}
      />
    </Canvas>
  );
}

type WidgetProps = {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
};

function Widget({ icon, title, children, className = "" }: WidgetProps) {
  return (
    <section className={`widget ${className}`}>
      <div className="widget-heading">
        <div className="widget-title">
          <span className="widget-icon">{icon}</span>
          <h3>{title}</h3>
        </div>
        <button className="widget-edit" aria-label={`Editar ${title}`}>
          <Pencil size={14} />
        </button>
      </div>
      <div className="widget-content">{children}</div>
    </section>
  );
}

export default function MeemuProfile() {
  return (
    <main className="meemu-page">
      <header className="topbar">
        <a className="brand" href="#">
          <span className="brand-symbol">
            <Sparkles size={21} />
          </span>
          <span>meemu<span className="brand-dot">.</span></span>
        </a>

        <nav className="navigation">
          <a className="nav-active" href="#">Meu perfil</a>
          <a href="#">Explorar</a>
          <a href="#">Comunidade</a>
        </nav>

        <button className="top-profile">
          <span className="mini-avatar">M</span>
          <span>Minha conta</span>
        </button>
      </header>

      <div className="page-container">
        <div className="page-intro">
          <div>
            <span className="eyebrow">
              <Sparkles size={13} /> SEU UNIVERSO DIGITAL
            </span>
            <h1>Seu espaço, suas regras.</h1>
            <p>Um pequeno universo que tem tudo a ver com você.</p>
          </div>

          <button className="customize-button">
            <Settings2 size={17} />
            Personalizar perfil
          </button>
        </div>

        <div className="profile-layout">
          <aside className="profile-column">
            <section className="avatar-card">
              <div className="avatar-background">
                <div className="avatar-label">
                  <span className="online-dot" />
                  Disponível
                </div>

                <div className="avatar-canvas">
                  <AvatarPreview />
                </div>

                <div className="avatar-hint">
                  <span>↔</span> Arraste para girar
                </div>
              </div>

              <div className="avatar-info">
                <div className="avatar-name-row">
                  <div>
                    <h2>Seu nome</h2>
                    <span className="username">@seuusuario</span>
                  </div>
                  <button className="round-edit" aria-label="Editar perfil">
                    <Pencil size={16} />
                  </button>
                </div>

                <p className="avatar-bio">
                  Bem-vindo ao meu pequeno universo! ✨
                </p>

                <div className="profile-tags">
                  <span><Sparkles size={12} /> Explorador</span>
                  <span><Heart size={12} /> Criativo</span>
                </div>
              </div>
            </section>

            <div className="avatar-action">
              <button>
                <Settings2 size={17} />
                Personalizar avatar
              </button>
              <p>Deixe seu personagem com a sua cara.</p>
            </div>

            <div className="profile-quote">
              <Quote size={18} />
              <p>“Seja você mesmo. Todo mundo já existe.”</p>
            </div>
          </aside>

          <section className="widgets-column">
            <div className="widgets-header">
              <div>
                <span className="eyebrow">MEU UNIVERSO</span>
                <h2>Um pouco sobre mim <span>♡</span></h2>
                <p>Coisas que fazem parte do meu mundo.</p>
              </div>

              <button className="add-widget">
                <Plus size={17} />
                Adicionar widget
              </button>
            </div>

            <div className="widgets-grid">
              <Widget icon={<UserRound size={17} />} title="Sobre mim">
                <p className="widget-description">
                  Escreva um pouco sobre você, seus gostos, personalidade e
                  tudo aquilo que gostaria de compartilhar.
                </p>
              </Widget>

              <Widget icon={<Music2 size={17} />} title="Minha música">
                <div className="music-content">
                  <div className="music-cover">
                    <Music2 size={25} />
                  </div>
                  <div>
                    <strong>Sua música favorita</strong>
                    <span>Artista ou banda</span>
                    <span className="music-status">♫ Sua trilha sonora</span>
                  </div>
                </div>
              </Widget>

              <Widget icon={<Heart size={17} />} title="Animes favoritos">
                <div className="empty-content">
                  <Sparkles size={22} />
                  <span>Seus animes favoritos aparecem aqui.</span>
                </div>
              </Widget>

              <Widget icon={<Film size={17} />} title="Filmes e séries">
                <div className="empty-content">
                  <Film size={22} />
                  <span>Compartilhe seus filmes e séries favoritos.</span>
                </div>
              </Widget>

              <Widget icon={<BookOpen size={17} />} title="Meus livros">
                <div className="empty-content">
                  <BookOpen size={22} />
                  <span>Mostre os livros que fazem parte do seu mundo.</span>
                </div>
              </Widget>

              <Widget icon={<Quote size={17} />} title="Minha frase">
                <p className="favorite-quote">
                  “Cada pessoa é um universo inteiro.”
                </p>
              </Widget>

              <Widget
                icon={<ImageIcon size={17} />}
                title="Galeria de fotos"
                className="wide-widget"
              >
                <div className="gallery-placeholder">
                  <div><Camera size={23} /></div>
                  <strong>Seu álbum pessoal</strong>
                  <span>Suas memórias, momentos e fotografias.</span>
                  <button><Plus size={15} /> Adicionar fotos</button>
                </div>
              </Widget>

              <Widget
                icon={<Gamepad2 size={17} />}
                title="Minhas redes"
                className="wide-widget"
              >
                <div className="social-links">
                  <span><Instagram size={18} /> Instagram</span>
                  <span><Youtube size={18} /> YouTube</span>
                  <span><ExternalLink size={17} /> Outros links</span>
                </div>
              </Widget>
            </div>

            <div className="add-more">
              <span><Plus size={16} /></span>
              <div>
                <strong>Seu universo pode crescer!</strong>
                <p>Adicione novos widgets e personalize seu espaço.</p>
              </div>
            </div>
          </section>
        </div>

        <footer className="page-footer">
          <span>meemu<span className="brand-dot">.</span></span>
          <p>Feito para ser do seu jeito. ♡</p>
        </footer>
      </div>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #f7f7fc;
          color: #29283c;
          font-family: Arial, Helvetica, sans-serif;
        }

        button {
          font: inherit;
          cursor: pointer;
        }

        .meemu-page {
          min-height: 100vh;
          background:
            radial-gradient(ellipse at 10% 15%, #eeedff 0, transparent 35%),
            #f8f8fc;
        }

        .topbar {
          height: 76px;
          padding: 0 max(5%, calc((100% - 1240px) / 2));
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255,255,255,.86);
          border-bottom: 1px solid #eeedf5;
          gap: 25px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #35304e;
          text-decoration: none;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -1px;
        }

        .brand-symbol {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          color: white;
          background: linear-gradient(135deg,#8174ed,#b39af7);
        }

        .brand-dot {
          color: #8b7bea;
        }

        .navigation {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .navigation a {
          color: #9290a5;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
        }

        .navigation .nav-active {
          color: #7668d9;
        }

        .top-profile {
          display: flex;
          align-items: center;
          gap: 9px;
          border: 1px solid #efedf6;
          border-radius: 30px;
          background: white;
          padding: 6px 13px 6px 6px;
          color: #57546c;
          font-size: 12px;
          font-weight: 600;
        }

        .mini-avatar {
          width: 27px;
          height: 27px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: white;
          background: #a99bea;
        }

        .page-container {
          max-width: 1190px;
          margin: auto;
          padding: 45px 25px 25px;
        }

        .page-intro {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
        }

        .eyebrow {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #9284df;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .page-intro h1 {
          margin: 9px 0 6px;
          font-size: clamp(26px, 3vw, 34px);
          letter-spacing: -1.2px;
        }

        .page-intro p,
        .widgets-header p {
          color: #9693a7;
          font-size: 13px;
          margin: 0;
        }

        .customize-button,
        .add-widget {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 0;
          border-radius: 12px;
          padding: 12px 17px;
          color: white;
          background: #8173df;
          font-size: 12px;
          font-weight: 700;
          box-shadow: 0 5px 15px #8173df2b;
        }

        .profile-layout {
          display: grid;
          grid-template-columns: 350px minmax(0, 1fr);
          align-items: start;
          gap: 28px;
        }

        .profile-column {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .avatar-card,
        .widget,
        .profile-quote,
        .add-more {
          background: white;
          border: 1px solid #efedf6;
          border-radius: 19px;
          box-shadow: 0 5px 22px #39305c08;
        }

        .avatar-card {
          overflow: hidden;
        }

        .avatar-background {
          height: 345px;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(ellipse at 50% 65%, #fff 0%, transparent 54%),
            linear-gradient(145deg,#e9e7ff,#dcdafa);
        }

        .avatar-canvas {
          position: absolute;
          inset: 0;
        }

        .avatar-label {
          position: absolute;
          top: 16px;
          left: 16px;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 7px;
          border: 1px solid #ffffffb0;
          border-radius: 20px;
          padding: 7px 11px;
          color: #625d7b;
          background: #ffffffbd;
          font-size: 10px;
          font-weight: 700;
          backdrop-filter: blur(8px);
        }

        .online-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #6bc99b;
        }

        .avatar-hint {
          position: absolute;
          z-index: 2;
          bottom: 13px;
          left: 0;
          right: 0;
          text-align: center;
          color: #817c9c;
          font-size: 10px;
          pointer-events: none;
        }

        .avatar-hint span {
          font-size: 15px;
          margin-right: 5px;
        }

        .avatar-info {
          padding: 20px;
        }

        .avatar-name-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .avatar-name-row h2 {
          margin: 0 0 4px;
          font-size: 21px;
        }

        .username {
          color: #a19db2;
          font-size: 12px;
        }

        .round-edit,
        .widget-edit {
          display: grid;
          place-items: center;
          width: 31px;
          height: 31px;
          border: 1px solid #efedf6;
          border-radius: 10px;
          color: #9287cf;
          background: white;
        }

        .avatar-bio {
          color: #777389;
          font-size: 12px;
          line-height: 1.6;
          margin: 17px 0;
        }

        .profile-tags {
          display: flex;
          gap: 7px;
        }

        .profile-tags span {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 7px 10px;
          border-radius: 20px;
          background: #f2f0ff;
          color: #8174ce;
          font-size: 10px;
          font-weight: 700;
        }

        .avatar-action {
          text-align: center;
        }

        .avatar-action button {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 9px;
          padding: 13px;
          border: 0;
          border-radius: 13px;
          background: #8173df;
          color: white;
          font-size: 12px;
          font-weight: 700;
        }

        .avatar-action p {
          color: #a19db2;
          font-size: 10px;
          margin: 9px 0 0;
        }

        .profile-quote {
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 17px;
          color: #a092e4;
        }

        .profile-quote p {
          margin: 0;
          color: #77718e;
          font-size: 11px;
          font-style: italic;
        }

        .widgets-column {
          min-width: 0;
        }

        .widgets-header {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 15px;
          margin: 4px 0 20px;
        }

        .widgets-header h2 {
          font-size: 22px;
          margin: 8px 0 5px;
          letter-spacing: -.5px;
        }

        .widgets-header h2 span {
          color: #a89aee;
        }

        .add-widget {
          flex-shrink: 0;
          padding: 11px 13px;
          font-size: 11px;
        }

        .widgets-grid {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 14px;
        }

        .widget {
          min-width: 0;
          padding: 17px;
          min-height: 153px;
        }

        .widget-heading,
        .widget-title {
          display: flex;
          align-items: center;
        }

        .widget-heading {
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 17px;
        }

        .widget-title {
          gap: 9px;
          min-width: 0;
        }

        .widget-icon {
          width: 29px;
          height: 29px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          color: #897cdd;
          background: #f1efff;
          border-radius: 9px;
        }

        .widget-title h3 {
          margin: 0;
          color: #49465e;
          font-size: 12px;
          font-weight: 700;
        }

        .widget-edit {
          width: 27px;
          height: 27px;
          border: 0;
          background: #f8f7fc;
        }

        .widget-content {
          color: #8d899f;
          font-size: 11px;
        }

        .widget-description {
          line-height: 1.8;
          margin: 0;
        }

        .music-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .music-cover {
          width: 56px;
          height: 56px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          color: white;
          background: linear-gradient(135deg,#a99beb,#d4b7ef);
        }

        .music-content strong,
        .music-content span {
          display: block;
          margin-bottom: 5px;
          font-size: 10px;
        }

        .music-content strong {
          color: #56516c;
          font-size: 11px;
        }

        .music-status {
          color: #9989df;
        }

        .empty-content {
          min-height: 65px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 7px;
          text-align: center;
          color: #b1a7e5;
        }

        .empty-content span {
          color: #a29eb1;
          font-size: 10px;
        }

        .favorite-quote {
          margin: 0;
          padding: 5px 0;
          color: #8b7ed0;
          font-size: 14px;
          line-height: 1.7;
          font-style: italic;
        }

        .wide-widget {
          grid-column: 1 / -1;
          min-height: 150px;
        }

        .gallery-placeholder {
          min-height: 115px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border: 1px dashed #ded9f2;
          border-radius: 12px;
          background: #fbfaff;
          color: #a79ce1;
        }

        .gallery-placeholder strong {
          color: #716b8b;
          font-size: 11px;
        }

        .gallery-placeholder span {
          color: #aaa6b8;
          font-size: 10px;
        }

        .gallery-placeholder button {
          display: flex;
          align-items: center;
          gap: 5px;
          border: 0;
          background: transparent;
          color: #8173d6;
          font-size: 10px;
          font-weight: 700;
        }

        .social-links {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .social-links span {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 13px;
          border-radius: 10px;
          color: #8276ca;
          background: #f6f4ff;
          font-size: 10px;
        }

        .add-more {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 15px;
          padding: 16px;
          border-style: dashed;
        }

        .add-more > span {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: #f0edff;
          color: #8d7de0;
        }

        .add-more strong {
          color: #625d79;
          font-size: 11px;
        }

        .add-more p {
          margin: 4px 0 0;
          color: #a29eb1;
          font-size: 10px;
        }

        .page-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 35px 0 10px;
          color: #aaa5bb;
          font-size: 11px;
        }

        .page-footer > span {
          color: #8174ce;
          font-size: 16px;
          font-weight: 800;
        }

        .page-footer p {
          margin: 0;
        }

        @media (max-width: 850px) {
          .profile-layout {
            grid-template-columns: 290px minmax(0,1fr);
            gap: 18px;
          }

          .avatar-background {
            height: 310px;
          }

          .widgets-grid {
            gap: 10px;
          }
        }

        @media (max-width: 650px) {
          .topbar {
            height: 65px;
            padding: 0 17px;
          }

          .navigation {
            display: none;
          }

          .page-container {
            padding: 30px 15px 20px;
          }

          .page-intro {
            align-items: flex-start;
            flex-direction: column;
          }

          .profile-layout {
            grid-template-columns: 1fr;
          }

          .avatar-background {
            height: 350px;
          }

          .widgets-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .widgets-grid {
            grid-template-columns: 1fr;
          }

          .wide-widget {
            grid-column: auto;
          }
        }
      `}</style>
    </main>
  );
}

useGLTF.preload("/meemu-avatar.glb");
