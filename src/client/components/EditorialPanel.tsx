import React, { useState, useEffect } from 'react';
import { RecipeEditorialProfile, RecipeEditorialAuditRecord, EditorialStatus, ImageRightsStatus, ImageLicense } from '../../shared/editorial-types.js';
import { fetchRecipeEditorialAuditApi } from '../services/api.js';
import { BookOpen, Image as ImageIcon, AlertTriangle, Sparkles, Wine, Quote, CheckCircle2, History, UserCheck } from 'lucide-react';

interface EditorialPanelProps {
  editorial: Partial<RecipeEditorialProfile> | undefined;
  onChange: (patch: Partial<RecipeEditorialProfile>) => void;
  recipeTitle: string;
  recipeId?: string;
}

const CANONICAL_IMAGES: Array<{
  url: string;
  label: string;
  author: string;
  license: ImageLicense;
  alt: string;
  caption: string;
}> = [
  {
    url: '/images/tagliatelle-ragu.jpg',
    label: 'Tagliatelle al Ragù',
    author: 'Arhiva Gastronomică Italiană',
    license: 'CC-BY-SA-4.0',
    alt: 'Tagliatelle proaspete cu ragù bolognese tradițional',
    caption: 'Tagliatelle al Ragù alla Bolognese conform rețetei originale depuse la Camera de Comerț din Bologna (1982)',
  },
  {
    url: '/images/risotto-milanese.jpg',
    label: 'Risotto alla Milanese',
    author: 'Arhiva Gastronomică Lombardă',
    license: 'Unsplash-License',
    alt: 'Risotto cremos cu șofran și măduvă de vită all\'onda',
    caption: 'Risotto alla Milanese pregătit all\'onda cu șofran pur și măduvă de vită',
  },
  {
    url: '/images/boeuf-bourguignon.jpg',
    label: 'Boeuf Bourguignon',
    author: 'Studio Haute Cuisine',
    license: 'Unsplash-License',
    alt: 'Carne de vită rumenită și înăbușită lent în vin roșu de Burgundia',
    caption: 'Boeuf Bourguignon tradițional cu ciuperci brune și ceapă perlată glasată',
  },
  {
    url: '/images/souffle-fromage.jpg',
    label: 'Soufflé au Fromage',
    author: 'Studio Patiserie Paris',
    license: 'Unsplash-License',
    alt: 'Sufleu cald de brânză Comté crescut deasupra ramekinului',
    caption: 'Soufflé Chaud au Fromage cu brânză Comté AOP maturat',
  },
  {
    url: '/images/ciorba-radauteana.jpg',
    label: 'Ciorbă Rădăuțeană',
    author: 'Unsplash Food Collection',
    license: 'Unsplash-License',
    alt: 'Ciorbă rădăuțeană catifelată de pui cu smântână și mujdei',
    caption: 'Ciorbă Rădăuțeană bucovineană cu pui fraged și dressing bogat de smântână',
  },
  {
    url: '/images/ratatouille-nicoise.jpg',
    label: 'Ratatouille Niçoise',
    author: 'Unsplash Food Collection',
    license: 'Unsplash-License',
    alt: 'Legume de vară provensale gătite lent în ulei de măsline',
    caption: 'Ratatouille Tradițională Niçoise cu vinete, dovlecei și ierburi de Provence',
  },
  {
    url: '/images/coq-au-vin.jpg',
    label: 'Coq au Vin',
    author: 'Unsplash Food Collection',
    license: 'Unsplash-License',
    alt: 'Pui rumenit înăbușit în sos bogat de vin roșu și ciuperci',
    caption: 'Coq au Vin clasic bourguignon servit cu ciuperci sote și verdeață',
  },
  {
    url: '/images/tiramisu-trevisano.jpg',
    label: 'Tiramisù Trevizan',
    author: 'Unsplash Food Collection',
    license: 'Unsplash-License',
    alt: 'Tiramisù clasic stratificat cu cremă fină de mascarpone și pișcoturi însiroparate',
    caption: 'Tiramisù clasic originar din Treviso pudrat cu cacao neagră amară',
  },
  {
    url: '/images/salata-vinete.jpg',
    label: 'Salată de Vinete',
    author: 'Unsplash Food Collection',
    license: 'Unsplash-License',
    alt: 'Salată de vinete coapte pe flacără deschisă cu ulei și ceapă tocată fin',
    caption: 'Salată Tradițională de Vinete coapte pe jar, spumate cu ulei de floarea-soarelui',
  },
  {
    url: '/images/shakshuka-maghreb.jpg',
    label: 'Shakshuka Maghreb',
    author: 'Unsplash Food Collection',
    license: 'Unsplash-License',
    alt: 'Ouă poșate în sos aromat de roșii, ardei și chimion în tigaie de fontă',
    caption: 'Shakshuka tradițională maghrebiană cu ouă poșate în sos picant de roșii',
  },
  {
    url: '/images/guacamole-mexicano.jpg',
    label: 'Guacamole Mexican',
    author: 'Zoshua Colah',
    license: 'Unsplash-License',
    alt: 'Avocado pisat în molcajete cu coriandru, lime și ardei serrano',
    caption: 'Guacamole auténtico tradițional preparat proaspăt în mojar de piatră vulcanică',
  },
  {
    url: '/images/sarmale.jpg',
    label: 'Sarmale Tradiționale',
    author: 'Colecția Etnografică Gastronomică',
    license: 'Proprietary-Atlas',
    alt: 'Sarmale tradiționale în foi de varză murată fierte lent la oală de lut',
    caption: 'Sarmale românești în foi de varză acră servite cu mămăligă caldă și smântână',
  },
];

export const EditorialPanel: React.FC<EditorialPanelProps> = ({
  editorial = {},
  onChange,
  recipeTitle,
  recipeId,
}) => {
  const status: EditorialStatus = editorial.editorial_status || 'draft';
  const rightsStatus: ImageRightsStatus = editorial.image_rights_status || 'unverified';
  const isApproved = status === 'approved';

  const [auditHistory, setAuditHistory] = useState<RecipeEditorialAuditRecord[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  useEffect(() => {
    if (recipeId) {
      setIsLoadingAudit(true);
      fetchRecipeEditorialAuditApi(recipeId)
        .then(setAuditHistory)
        .catch((err) => console.warn('Nu s-a putut încărca istoricul de audit:', err))
        .finally(() => setIsLoadingAudit(false));
    }
  }, [recipeId, editorial.profile_version, editorial.editorial_status]);

  const handleFieldChange = (field: keyof RecipeEditorialProfile, value: any) => {
    onChange({ [field]: value });
  };

  const handleSelectCanonicalImage = (img: typeof CANONICAL_IMAGES[0]) => {
    onChange({
      image_url: img.url,
      image_alt: editorial.image_alt || img.alt,
      image_caption: editorial.image_caption || img.caption,
      image_author: editorial.image_author || img.author,
      image_license: editorial.image_license || img.license,
    });
  };

  return (
    <div className="editorial-panel-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. Header & Status Banner */}
      <div className="card" style={{ borderLeft: isApproved ? '4px solid var(--color-success)' : '4px solid var(--color-accent-gold)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <BookOpen size={20} style={{ color: 'var(--color-accent-gold)' }} />
              <h3 style={{ margin: 0, fontFamily: 'Playfair Display, serif', fontSize: '1.25rem' }}>
                Profil Editorial & Proveniență
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-subtle)' }}>
              Metadate de prezentare pentru Jurnalul Culinar European. Baza de date SQLite este sursa unică de adevăr.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Versiune Profil: v{editorial.profile_version || 1}
              </div>
              <span className={`badge ${
                status === 'approved' ? 'badge-val-valid' :
                status === 'in_review' ? 'badge-risk-culinary_quality' :
                status === 'needs_revision' ? 'badge-risk-irreversible_risk' : 'badge-draft'
              }`}>
                {status === 'approved' ? 'Aprobat Uman' :
                 status === 'in_review' ? 'În Revizuire' :
                 status === 'needs_revision' ? 'Necesită Revizuire' : 'Schiță (Draft)'}
              </span>
            </div>
          </div>
        </div>

        {isApproved && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(34, 197, 94, 0.08)', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
            <div>
              <strong>Profil editorial aprobat</strong> de către <code>{editorial.approved_by || 'Redactor-Șef'}</code> la {editorial.approved_at ? new Date(editorial.approved_at).toLocaleString('ro-RO') : 'dată confirmată'}.
              <br />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                Regulă de integritate: Orice modificare materială a textului sau a imaginii va invalida automat această aprobare și va readuce profilul în starea <code>in_review</code>.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Text Editorial de Prezentare */}
      <div className="card">
        <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem' }}>
          <Sparkles size={16} style={{ color: 'var(--color-accent-gold)' }} />
          Texte & Narațiune Editorială
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
          <div>
            <label className="field-label">
              Subtitlu Editorial (Liric / Definitoriu)
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="ex: Simbolul suprem al pastelor proaspete emiliene și al gătirii lente."
              value={editorial.editorial_subtitle || ''}
              onChange={(e) => handleFieldChange('editorial_subtitle', e.target.value)}
            />
            <span className="field-hint">Apare ca subtitlu în cărțile de prezentare din catalog și în deschiderea detaliului rețetei.</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="field-label">Patrimoniu & Origine (Heritage)</label>
              <input
                type="text"
                className="form-control"
                placeholder="ex: Emilia-Romagna • Bologna"
                value={editorial.heritage || ''}
                onChange={(e) => handleFieldChange('heritage', e.target.value)}
              />
            </div>

            <div>
              <label className="field-label">Context Regional & Arhivă</label>
              <input
                type="text"
                className="form-control"
                placeholder="ex: Accademia Italiana della Cucina (Depus la Camera de Comerț, 1982)"
                value={editorial.region_context || ''}
                onChange={(e) => handleFieldChange('region_context', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="field-label">Terroir & Calitatea Ingredientelor</label>
            <input
              type="text"
              className="form-control"
              placeholder="ex: Câmpia Padului, Parmigiano-Reggiano maturat 24 luni, carne tocată la cuțit"
              value={editorial.terroir || ''}
              onChange={(e) => handleFieldChange('terroir', e.target.value)}
            />
          </div>

          <div>
            <label className="field-label">
              <Quote size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Citatul Maestrului Bucătar (Chef Quote)
            </label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="ex: „Adevăratul ragù nu este un sos de roșii cu carne, ci o simfonie lentă a cărnii îmbogățită cu lapte și vin.”"
              value={editorial.chef_quote || ''}
              onChange={(e) => handleFieldChange('chef_quote', e.target.value)}
            />
          </div>

          <div>
            <label className="field-label">Sfatul Tehnic al Bucătarului (Chef Tip)</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="ex: Un vin roșu bun face diferența în profunzimea gustului. Adăugați laptele după ce vinul s-a evaporat complet..."
              value={editorial.chef_tip || ''}
              onChange={(e) => handleFieldChange('chef_tip', e.target.value)}
            />
          </div>

          <div>
            <label className="field-label">
              <Wine size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Recomandare Sommelier (Pairing Suggestion)
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="ex: Sangiovese di Romagna Superiore DOC sau Lambrusco Grasparossa"
              value={editorial.pairing_suggestion || ''}
              onChange={(e) => handleFieldChange('pairing_suggestion', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 3. Fotografie & Proveniență Drepturi */}
      <div className="card">
        <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem' }}>
          <ImageIcon size={16} style={{ color: 'var(--color-accent-gold)' }} />
          Fotografie Canonică & Verificare Drepturi
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
          {/* Formular parametri imagine */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="field-label">Cale / URL Imagine</label>
              <input
                type="text"
                className="form-control"
                placeholder="/images/nume-reteta.jpg"
                value={editorial.image_url || ''}
                onChange={(e) => handleFieldChange('image_url', e.target.value)}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', alignSelf: 'center', marginRight: '4px' }}>Active canonice:</span>
                {CANONICAL_IMAGES.map((img) => (
                  <button
                    key={img.url}
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{
                      fontSize: '0.7rem',
                      padding: '2px 6px',
                      height: 'auto',
                      border: editorial.image_url === img.url ? '1px solid var(--color-accent-gold)' : '1px solid var(--border-color)',
                      background: editorial.image_url === img.url ? 'rgba(217, 119, 6, 0.1)' : 'transparent',
                    }}
                    onClick={() => handleSelectCanonicalImage(img)}
                  >
                    {img.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="field-label">Text Alternativ (Alt)</label>
              <input
                type="text"
                className="form-control"
                placeholder="Descriere detaliată a imaginii pentru accesibilitate"
                value={editorial.image_alt || ''}
                onChange={(e) => handleFieldChange('image_alt', e.target.value)}
              />
            </div>

            <div>
              <label className="field-label">Legendă Imagine (Caption)</label>
              <input
                type="text"
                className="form-control"
                placeholder="Legenda afișată sub imagine în pagina de detaliu"
                value={editorial.image_caption || ''}
                onChange={(e) => handleFieldChange('image_caption', e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="field-label">Autor / Fotograf</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="ex: Arhiva Gastronomică"
                  value={editorial.image_author || ''}
                  onChange={(e) => handleFieldChange('image_author', e.target.value)}
                />
              </div>

              <div>
                <label className="field-label">Licență</label>
                <select
                  className="form-control"
                  value={editorial.image_license || 'Unsplash-License'}
                  onChange={(e) => handleFieldChange('image_license', e.target.value as ImageLicense)}
                >
                  <option value="Unsplash-License">Unsplash-License</option>
                  <option value="CC-BY-4.0">CC-BY-4.0</option>
                  <option value="CC-BY-SA-4.0">CC-BY-SA-4.0</option>
                  <option value="CC0-1.0">CC0-1.0 (Domeniu Public)</option>
                  <option value="Public-Domain-Mark">Public-Domain-Mark</option>
                  <option value="Proprietary-Atlas">Proprietary-Atlas</option>
                  <option value="Custom-Documented">Custom-Documented</option>
                </select>
              </div>
            </div>

            <div>
              <label className="field-label">Stare Verificare Drepturi Utilizare</label>
              <select
                className="form-control"
                value={rightsStatus}
                onChange={(e) => handleFieldChange('image_rights_status', e.target.value as ImageRightsStatus)}
                style={{
                  fontWeight: 600,
                  color: rightsStatus === 'verified' ? 'var(--color-success)' :
                         rightsStatus === 'restricted' ? 'var(--color-error)' : 'inherit',
                }}
              >
                <option value="unverified">Neconfirmat (Unverified)</option>
                <option value="verification_pending">În Curs de Verificare</option>
                <option value="verified">Confirmat & Verificat Juridic</option>
                <option value="restricted">Restricționat / Exclus</option>
              </select>
              {rightsStatus !== 'verified' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem', color: '#b45309', fontSize: '0.75rem' }}>
                  <AlertTriangle size={13} />
                  <span>Profilul nu poate fi aprobat fără verificarea drepturilor de imagine (image_rights_status = verified).</span>
                </div>
              )}
            </div>
          </div>

          {/* Previzualizare card imagine */}
          <div style={{ background: 'var(--color-bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-subtle)', letterSpacing: '0.05em' }}>Previzualizare Cadru</span>
            <div style={{ marginTop: '0.5rem', overflow: 'hidden', borderRadius: '6px', maxHeight: '220px', background: '#000' }}>
              <img
                src={editorial.image_url || '/images/tagliatelle-ragu.jpg'}
                alt={editorial.image_alt || recipeTitle}
                style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/tagliatelle-ragu.jpg';
                }}
              />
            </div>
            {editorial.image_caption && (
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-subtle)' }}>
                {editorial.image_caption}
              </p>
            )}
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
              Licență: <code>{editorial.image_license || 'Unsplash-License'}</code> • Drepturi: <strong>{rightsStatus}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Jurnal de Audit & Istoric Tranzacții (Imutabil) */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem' }}>
            <History size={16} style={{ color: 'var(--color-accent-gold)' }} />
            Jurnal de Audit & Istoric Modificări (Imutabil)
          </h4>
          <span className="badge badge-draft" style={{ fontSize: '0.75rem' }}>
            {auditHistory.length} înregistrări
          </span>
        </div>

        <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-subtle)' }}>
          Toate tranzițiile de stare și modificările editoriale sunt consemnate permanent în SQLite. Integritatea este garantată prin triggere native ale motorului bazei de date.
        </p>

        {isLoadingAudit ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-subtle)', fontSize: '0.875rem' }}>
            Se încarcă istoricul de audit...
          </div>
        ) : auditHistory.length === 0 ? (
          <div style={{ padding: '1rem', background: 'var(--color-bg-secondary)', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--text-subtle)', textAlign: 'center' }}>
            Nicio înregistrare de audit consemnată încă pentru această rețetă.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {auditHistory.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  padding: '0.75rem 1rem',
                  background: 'var(--color-bg-secondary)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>
                      v{item.profile_version}
                    </span>
                    <span style={{ color: 'var(--text-subtle)' }}>•</span>
                    <span className="badge badge-draft" style={{ fontSize: '0.7rem' }}>
                      {item.from_status} ➔ {item.to_status}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                    {new Date(item.created_at).toLocaleString('ro-RO')}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                  <UserCheck size={14} />
                  <span>
                    Actor: <strong>{item.actor_id}</strong> (Rol: <code>{item.actor_role}</code>)
                  </span>
                </div>

                {item.rationale && (
                  <div style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-color)' }}>
                    Motiv: „{item.rationale}”
                  </div>
                )}

                {item.changed_fields && item.changed_fields.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', alignSelf: 'center' }}>Câmpuri modificate:</span>
                    {item.changed_fields.map((f: string) => (
                      <span
                        key={f}
                        style={{
                          fontSize: '0.7rem',
                          padding: '1px 5px',
                          background: 'rgba(0,0,0,0.05)',
                          borderRadius: '3px',
                          fontFamily: 'monospace',
                        }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
