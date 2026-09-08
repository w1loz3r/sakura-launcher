import { useEffect, useMemo, useState } from 'react';

type Tab = 'home' | 'news' | 'settings' | 'mods';

declare global {
  interface Window {
    launcherApi?: {
      getConfig: () => Promise<{ version: string; ram: number; nickname: string }>;
      saveConfig: (patch: { version: string; ram: number; nickname: string }) => Promise<{ ok: boolean }>;
      play: (payload: { version: string; ram: number; nickname: string }) => Promise<{ ok: boolean; message: string }>;
      onLog: (cb: (msg: string) => void) => void;
    };
  }
}

export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [log, setLog] = useState('Готов к запуску 🌸');
  const [ram, setRam] = useState(4096);
  const [version, setVersion] = useState('1.20.1');
  const [nickname, setNickname] = useState('SakuraPlayer');

  const petals = useMemo(() => Array.from({ length: 28 }, (_, i) => i), []);

  useEffect(() => {
    window.launcherApi?.getConfig?.().then((cfg) => {
      if (!cfg) return;
      setVersion(cfg.version ?? '1.20.1');
      setRam(Number(cfg.ram ?? 4096));
      setNickname(cfg.nickname ?? 'SakuraPlayer');
    });

    window.launcherApi?.onLog?.((msg) => {
      setLog((prev) => `${prev}\n${msg}`);
    });
  }, []);

  async function onPlay() {
    setLog('Сохраняю профиль и запускаю...');
    await window.launcherApi?.saveConfig?.({ version, ram, nickname });
    const res = await window.launcherApi?.play?.({ version, ram, nickname });
    setLog((prev) => `${prev}\n${res?.message ?? 'Ошибка IPC'}`);
  }

  return (
    <div className="app">
      <div className="bg-gradient" />
      <div className="glow glow1" />
      <div className="glow glow2" />
      <div className="moon" />

      {petals.map((p) => (
        <span
          key={p}
          className="petal"
          style={
            {
              '--x': `${Math.random() * 100}%`,
              '--d': `${7 + Math.random() * 9}s`,
              '--delay': `${Math.random() * 6}s`,
              '--r': `${Math.random() * 360}deg`,
              '--s': `${0.8 + Math.random() * 0.8}`
            } as React.CSSProperties
          }
        />
      ))}

      <aside className="sidebar glass">
        <div className="brand">
          <div className="logo">🌸</div>
          <div>
            <h1>SAKURA</h1>
            <p className="subtitle">Launcher</p>
          </div>
        </div>

        <nav>
          <button className={tab === 'home' ? 'active' : ''} onClick={() => setTab('home')}>Главная</button>
          <button className={tab === 'news' ? 'active' : ''} onClick={() => setTab('news')}>Новости</button>
          <button className={tab === 'mods' ? 'active' : ''} onClick={() => setTab('mods')}>Моды</button>
          <button className={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')}>Настройки</button>
        </nav>

        <div className="footer-note">made with love & petals</div>
      </aside>

      <main className="content">
        {tab === 'home' && (
          <section className="panel glass">
            <h2>Добро пожаловать</h2>
            <p>Эстетичный лаунчер с профилем, запуском и логами.</p>

            <div className="row">
              <label>Никнейм</label>
              <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Введите ник" />
            </div>

            <div className="row">
              <label>Версия</label>
              <select value={version} onChange={(e) => setVersion(e.target.value)}>
                <option>1.20.1</option>
                <option>1.21</option>
                <option>1.19.4</option>
              </select>
            </div>

            <div className="row">
              <label>RAM (MB): {ram}</label>
              <input
                type="range"
                min={2048}
                max={16384}
                step={512}
                value={ram}
                onChange={(e) => setRam(Number(e.target.value))}
              />
            </div>

            <button className="play-btn" onClick={onPlay}>Играть</button>
            <pre className="log">{log}</pre>
          </section>
        )}

        {tab === 'news' && (
          <section className="panel glass">
            <h2>Новости</h2>
            <ul>
              <li>🌸 Новый Sakura Pro интерфейс</li>
              <li>🎮 Реальный запуск через minecraft-launcher-core</li>
              <li>🔐 Следующий шаг: Microsoft OAuth</li>
            </ul>
          </section>
        )}

        {tab === 'mods' && (
          <section className="panel glass">
            <h2>Моды</h2>
            <p>В следующем обновлении: импорт .mrpack и менеджер профилей.</p>
          </section>
        )}

        {tab === 'settings' && (
          <section className="panel glass">
            <h2>Настройки</h2>
            <p>Сейчас сохраняются: ник, версия и RAM в JSON-файл профиля.</p>
          </section>
        )}
      </main>
    </div>
  );
}
