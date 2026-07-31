import { useState } from 'react';
import { ArrowRight, Radio } from 'lucide-react';
import './HomeScreen.css';

export default function HomeScreen({ onSubmit, loading, error }) {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) onSubmit(value.trim());
  };

  return (
    <div className="home">
      <div className="home__glow" />

      <div className="home__content">
        <div className="home__mark">
          <Radio size={20} strokeWidth={2.4} />
          <span>sinal</span>
        </div>

        <h1 className="home__title">
          Cole o link do canal.
          <br />
          <span className="home__title-accent">Assista sem travar.</span>
        </h1>

        <p className="home__subtitle">
          Player próprio, sem o peso da página da Kick. Qualidade, zoom, saturação e
          chat do seu jeito.
        </p>

        <form className="home__form" onSubmit={handleSubmit}>
          <input
            type="text"
            inputMode="url"
            autoCapitalize="off"
            autoCorrect="off"
            placeholder="kick.com/nomedocanal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="home__input"
          />
          <button type="submit" className="home__submit" disabled={loading || !value.trim()}>
            {loading ? <span className="home__spinner" /> : <ArrowRight size={18} />}
          </button>
        </form>

        {error && <p className="home__error">{error}</p>}
      </div>
    </div>
  );
}
