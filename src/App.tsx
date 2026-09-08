import { useEffect, useMemo, useState } from 'react';

type Tab = 'home' | 'news' | 'settings' | 'mods';

declare global {
  interface Window {
    launcherApi?: {
      play: (payload?: { version: string; ram: number }) => Promise<{ ok: boolean; message: string }>;
      getConfig: () => Promise<{ version: string; ram: number }>;
      saveConfig: (patch: { version: string; ram: number }) => Promise<{ ok: boolean; config: { version: string; ram: number } }>;
      onLog: (cb: (msg: string) => void) => void;
    };
  }
}

export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [log, setLog] = useState('Готов к запуску 🌸');
  const [ram, setRam] = useState(4096);
  const [version, setVersion] = useState('1.20.1');

  const petals = useMemo(() => Array.from({ length: 22 }, (_, i) => i), []);

  useEffect(() => {
    window.launcherApi?.getConfig?.().then((cfg) => {
      if (!cfg) return;
      setVersion(cfg.version ?? '1.20.1');
      setRam(Number(cfg.ram ?? 4096));
    });

    window.launcherApi?.onLog?.((msg) => {
      setLog((prev) => `${prev}\n${msg}`);
    });
  }, []);

  async function onPlay() {
    setLog('Проверка и запуск...');
    await window.launcherApi?.saveConfig?.({ version, ram });
    const res = await window.launcherApi?.play?.({ version, ram });
    setLog((prev) => `${prev}\n${res?.message ?? 'Не удалось вызвать launcherApi'}`);
  }

  return (
    <div className="app">
      <div className="bg-gradient" />
      <div className="moon" />

      {petals.map((p) => (
        <span
          key={p}
          className="petal"
          style={
            {
              '--x': `${Math.random() * 100}%`,
              '--d': `${8 + Math.random() * 8}s`,
              '--delay': `${Math.random() * 6}s`,
              '--r': `${Math.random() * 360}deg`
            } as React.CSSProperties
          }
        />
      ))}

      <aside className="sidebar glass">
        <h1>SAKURA</h1>
        <p className="subtitle">Launcher</p>

        <nav>
          <button className={tab === 'home' ? 'active' : ''} onClick={() => setTab('home')}>Главная</button>
          <button className={tab === 'news' ? 'active' : ''} onClick={() => setTab('news')}>Новости</button>
          <button className={tab === 'mods' ? 'active' : ''} onClick={() => setTab('mods')}>Моды</button>
          <button className={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')}>Настройки</button>
        </nav>

        <div className="footer-note">made with 🌸</div>
      </aside>

      <main className="content">
        {tab === 'home' && (
          <section className="panel glass">
            <h2>Добро пожаловать</h2>
            <p>Минималистичный лаунчер в эстетике сакуры.</p>

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
              <li>🌸 Новый весенний интерфейс</li>
              <li>⚙️ Скоро: Microsoft OAuth</li>
              <li>🧩 Скоро: менеджер модпаков</li>
            </ul>
          </section>
        )}

        {tab === 'mods' && (
          <section className="panel glass">
            <h2>Моды</h2>
            <p>Здесь будет каталог модов и импорт .mrpack</p>
          </section>
        )}

        {tab === 'settings' && (
          <section className="panel glass">
            <h2>Настройки</h2>
            <p>Java path, папка игры, параметры запуска и т.д.</p>
          </section>
        )}
      </main>
    </div>
  );
}
