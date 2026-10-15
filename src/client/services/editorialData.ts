// Curated Editorial Metadata & Gastronomic Photography for Atlas Gastronomic
// Strictly presentation-layer enrichment; all canonical recipe data remains derived from Recipe Core.

import { RecipeEditorialProfile as DbRecipeEditorialProfile } from '../../shared/editorial-types.js';

export interface RecipeEditorialProfile {
  id: string;
  image: string;
  imageAlt: string;
  imageCaption: string;
  heritage: string;
  region: string;
  terroir: string;
  chefQuote: string;
  chefTip?: string;
  pairingSuggestion: string;
  editorialSubtitle: string;
  imageRightsStatus?: string;
  imageAuthor?: string | null;
  imageLicense?: string | null;
  imageAttribution?: string | null;
  editorialStatus?: string;
  profileVersion?: number;
  approvedBy?: string | null;
  approvedAt?: string | null;
}

export const EDITORIAL_RECIPES: Record<string, RecipeEditorialProfile> = {
  rec_tagliatelle_ragu_001: {
    id: 'rec_tagliatelle_ragu_001',
    image: '/images/tagliatelle-ragu.jpg',
    imageAlt: 'Tagliatelle proaspete cu ragù alla Bolognese autentic',
    imageCaption: 'Tagliatelle trase manual la mașină, scăldate în ragù clasic fiert lent timp de 3 ore în vas greu de fontă.',
    heritage: 'Emilia-Romagna • Bologna',
    region: 'Accademia Italiana della Cucina (Depus la Camera de Comerț, 1982)',
    terroir: 'Câmpia Padului, Parmigiano-Reggiano maturat 24 luni, carne tocată la cuțit',
    chefQuote: '„Adevăratul ragù nu este un sos de roșii cu carne, ci o simfonie lentă a cărnii îmbogățită cu lapte și vin.”',
    chefTip: 'Un vin roșu bun face diferența în profunzimea gustului. Adăugați laptele după ce vinul s-a evaporat complet pentru a frăgezi fibrele cărnii.',
    pairingSuggestion: 'Sangiovese di Romagna Superiore DOC sau Lambrusco Grasparossa',
    editorialSubtitle: 'Simbolul suprem al pastelor proaspete emiliene și al gătirii lente.',
  },
  rec_risotto_milanese_002: {
    id: 'rec_risotto_milanese_002',
    image: '/images/risotto-milanese.jpg',
    imageAlt: 'Risotto alla Milanese galben-auriu cu șofran și măduvă de vită',
    imageCaption: 'Risotto all’onda infuzat cu pistiluri pure de șofran de Abruzzo și rotunjit cu măduvă de vită și unt rece.',
    heritage: 'Lombardia • Milano',
    region: 'Tradiție nobiliară milaneză (Documentat 1574)',
    terroir: 'Orez Carnaroli din bazinul Padului, șofran pur pistiluri, măduvă de vițel',
    chefQuote: '„Risotto-ul trebuie să curgă ca un val pe farfurie — ferm în bob, cremos și strălucitor ca aurul pur.”',
    chefTip: 'Mențineți supa fierbinte pe tot parcursul gătirii. Turnarea supei reci oprește fierberea orezului și rupe textura cremoasă all’onda.',
    pairingSuggestion: 'Franciacorta Brut DOCG sau Pinot Nero dell’Oltrepò Pavese',
    editorialSubtitle: 'Capodopera cremozității și a aromei aristocratice de șofran.',
  },
  rec_boeuf_bourguignon_003: {
    id: 'rec_boeuf_bourguignon_003',
    image: '/images/boeuf-bourguignon.jpg',
    imageAlt: 'Boeuf Bourguignon franțuzesc fiert lent în vin de Burgundia',
    imageCaption: 'Carne de vită rumenită și glasată în vin roșu de Burgundia cu ciuperci brune, ceapă perlată și lardons.',
    heritage: 'Bourgogne • Dijon & Beaune',
    region: 'Haute Cuisine & Gastronomie Rustic-Nobilă Franceză',
    terroir: 'Rasă bovină Charolaise, Pinot Noir de Bourgogne, buchet garni proaspăt',
    chefQuote: '„Răbdarea este singurul ingredient de neînlocuit: sosul trebuie să devină catifea, iar carnea să cedeze la simpla atingere a furculiței.”',
    chefTip: 'Rumenirea temeinică a cărnii în tranșe mici este secretul gustului profund. Dacă aglomerați vasul, carnea va fierbe în suc propriu în loc să se rumenească.',
    pairingSuggestion: 'Gevrey-Chambertin, Pommard sau Bourgogne Pinot Noir maturat',
    editorialSubtitle: 'Triumful gătirii la foc mic și al vinului nobil burgund.',
  },
  rec_souffle_fromage_004: {
    id: 'rec_souffle_fromage_004',
    image: '/images/souffle-fromage.jpg',
    imageAlt: 'Soufflé cald cu brânză Comté proaspăt scos din cuptor',
    imageCaption: 'Soufflé aerat din brânză Comté AOP maturat 18 luni, crescut spectaculos peste marginea ramekinului.',
    heritage: 'Île-de-France • Paris',
    region: 'Școala clasică a lui Marie-Antoine Carême & Auguste Escoffier',
    terroir: 'Comté AOP din masivul Jura, lapte integral de fermă, nucșoară măcinată pe loc',
    chefQuote: '„Oaspeții așteaptă soufflé-ul; soufflé-ul nu așteaptă niciodată pe nimeni.”',
    chefTip: 'Ungeți formele de ramekin cu unt rece folosind mișcări verticale ascendente; acest detaliu ghidează ascensiunea uniformă și spectaculoasă a aluatului.',
    pairingSuggestion: 'Chablis Premier Cru sau Côtes du Jura Savagnin',
    editorialSubtitle: 'Cea mai delicată arhitectură termică a bucătăriei clasice franceze.',
  },
  rec_ciorba_radauteana_005: {
    id: 'rec_ciorba_radauteana_005',
    image: '/images/ciorba-radauteana.jpg',
    imageAlt: 'Ciorbă Rădăuțeană bucovineană cu pui, smântână, usturoi și ardei iute',
    imageCaption: 'Bulion dens de pasăre dres cu smântână grasă, fâșii fragede de carne și pătrunjel verde tocat mărunt.',
    heritage: 'Bucovina • Rădăuți',
    region: 'Creată de maestrul bucătar Cornelia Dumitrescu la Rădăuți (cca. 1978)',
    terroir: 'Pui de curte bucovinean, smântână fermentată grasă de Dorna, usturoi de grădină',
    chefQuote: '„O ciorbă rădăuțeană desăvârșită are luciul mătăsii galbene și o iuțeală blândă de usturoi îmblânzit în smântână caldă.”',
    chefTip: 'Nu fierbeți niciodată ciorba după adăugarea mujdeiului și a dresalei de gălbenuș cu smântână. Focul se oprește complet înainte de temperare pentru a păstra emulsia fină.',
    pairingSuggestion: 'Fetească Regală din Moldova de Nord sau rachiu tradițional de pere',
    editorialSubtitle: 'Tradiția catifelată a ciorbelor drese din ținutul Bucovinei.',
  },
  rec_ratatouille_nicoise_006: {
    id: 'rec_ratatouille_nicoise_006',
    image: '/images/ratatouille-nicoise.jpg',
    imageAlt: 'Ratatouille tradițională niçoise gătită lent cu legume de vară',
    imageCaption: 'Dovlecei, vinete, ardei grași și roșii scăldate în ulei parfumat de măsline și ierburi de Provence.',
    heritage: 'Provence • Nisa & Côte d’Azur',
    region: 'Gastronomie populară provensală tradițională',
    terroir: 'Legume de vară din valea Var, ulei de măsline extravirgin AOP Nice, cimbru sălbatic',
    chefQuote: '„Fiecare legumă își cere propriul moment de glorie în tigaie înainte de a se topi în armonia comună.”',
    chefTip: 'Gătiți vinetele și dovleceii separat în ulei fierbinte înainte de asamblarea lentă. Dacă le fierbeți pe toate deodată, legumele se vor sfărâma și își vor pierde individualitatea.',
    pairingSuggestion: 'Bandol Rosé, Côtes de Provence sau Cassis Blanc',
    editorialSubtitle: 'Oda legumelor însorite din grădinile coastei mediteraneene.',
  },
  rec_coq_au_vin_007: {
    id: 'rec_coq_au_vin_007',
    image: '/images/coq-au-vin.jpg',
    imageAlt: 'Coq au Vin clasic burgund cu ciuperci brune, ceapă perlată și sos catifelat',
    imageCaption: 'Carne rumenită și scăldată ore întregi în vin roșu închis la culoare, alături de ceapă dulce glasată.',
    heritage: 'Bourgogne • Burgundia rurală',
    region: 'Bucătărie nobiliară și clasică franceză',
    terroir: 'Cocoș de fermă crescut liber, Pinot Noir din Côte d’Or, lardons afumați de casă',
    chefQuote: '„Vinul roșu nu este doar un ingredient lichid, ci mediul viu în care carnea capătă o profunzime aristocratică.”',
    chefTip: 'Marinați carnea peste noapte în vin roșu cu legume aromate. Înainte de sotare, uscați bine bucățile de carne cu prosoape de hârtie; carnea umedă nu se va carameliza corect.',
    pairingSuggestion: 'Bourgogne Rouge, Côte de Nuits Villages sau Mercurey',
    editorialSubtitle: 'Arta clasică a transformării răbdătoare în vin nobil de Bourgogne.',
  },
  rec_tiramisu_trevisano_008: {
    id: 'rec_tiramisu_trevisano_008',
    image: '/images/tiramisu-trevisano.jpg',
    imageAlt: 'Tiramisù clasic trevizan cu straturi de mascarpone și pișcoturi scăldate în espresso',
    imageCaption: 'Pudră generoasă de cacao amară peste cremă densă de mascarpone și pișcoturi îmbibate în cafea proaspătă.',
    heritage: 'Veneto • Treviso',
    region: 'Restaurantul Le Beccherie din Treviso (atestat 1970)',
    terroir: 'Mascarpone proaspăt din Lombardia/Veneto, pișcoturi Savoiardi artizanale, espresso intens',
    chefQuote: '„Tiramisù este o îmbrățișare dulce-amară între crema nobilă de ou și forța neîndulcită a cafelei.”',
    chefTip: 'Înmuiați pișcoturile doar o fracțiune de secundă pe fiecare parte în cafeaua răcită. Dacă se îmbibă excesiv, vor lăsa lichid în tavă și vor rupe structura aerată a cremei.',
    pairingSuggestion: 'Recioto di Soave DOCG, Vin Santo sau un espresso ristretto dublu',
    editorialSubtitle: 'Desertul emblematic al ospitalității venete și al contrastului fin.',
  },
  rec_salata_vinete_009: {
    id: 'rec_salata_vinete_009',
    image: '/images/salata-vinete.jpg',
    imageAlt: 'Salată tradițională de vinete coapte pe flacără cu ceapă roșie fin tocată',
    imageCaption: 'Pastă mătăsoasă din miez de vânătă copt la jar, bătută cu ulei fin și servită pe pâine de casă.',
    heritage: 'România • Muntenia & Moldova',
    region: 'Bucătărie tradițională românească de vară',
    terroir: 'Vinete lungi negre de grădină, ulei presat la rece, ceapă de Buzău',
    chefQuote: '„Secretul stă în flacăra vie: vinetele trebuie arse iute până coaja se face cenușă, lăsând miezul alb și afumat.”',
    chefTip: 'Tocați vinetele exclusiv cu satâr de lemn sau de inox alimentar pentru a preveni oxidarea și înnegrirea pulpei. Lăsați-le la scurs cel puțin o oră pentru a elimina amăreala.',
    pairingSuggestion: 'Fetească Albă de Drăgășani sau Tămâioasă Românească sec',
    editorialSubtitle: 'Simbolul verilor românești și al aromei inconfundabile de fum curat.',
  },
  rec_shakshuka_maghreb_010: {
    id: 'rec_shakshuka_maghreb_010',
    image: '/images/shakshuka-maghreb.jpg',
    imageAlt: 'Shakshuka maghrebiană fierbinte în tigaie de fontă cu ouă poșate și verdeață',
    imageCaption: 'Ouă gătite molcom într-un sos bogat de roșii, ardei și mirodenii calde de deșert, garnisite cu coriandru.',
    heritage: 'Maghreb • Tunisia & Maroc',
    region: 'Tradiție culinară nord-africană și levantină',
    terroir: 'Ardei copți de câmp, roșii cărnoase de vară, chimion măcinat proaspăt, harissa artizanală',
    chefQuote: '„O shakshuka reușită aduce tigaia de fontă direct pe masă, unde gălbenușul cremos se unește cu sosul picant.”',
    chefTip: 'Formați mici cuiburi cu o lingură în sosul dens de roșii înainte de a sparge ouăle și acoperiți tigaia 3 minute pentru ca albușul să se gătească la abur în timp ce gălbenușul rămâne lichid.',
    pairingSuggestion: 'Ceai fierbinte de mentă proaspătă cu muguri de pin sau limonadă cu apă de flori de portocal',
    editorialSubtitle: 'Explozia de mirodenii și soare a micului dejun maghrebian.',
  },
  rec_guacamole_mexicano_011: {
    id: 'rec_guacamole_mexicano_011',
    image: '/images/guacamole-mexicano.jpg',
    imageAlt: 'Guacamole autentic mexican preparat în molcajete tradițional din piatră',
    imageCaption: 'Pulpă cremoasă de avocado cu bucăți crocante de ceapă albă, feliuțe de ardei iute și zeamă de limetă.',
    heritage: 'Mexic • Michoacán & Mexic Central',
    region: 'Tradiție precolumbiană aztecă (āhuacamolli)',
    terroir: 'Avocado Hass copt în sol vulcanic, ardei serrano proaspeți, coriandru sălbatic, sare grunjoasă de mare',
    chefQuote: '„Guacamole nu se pasează niciodată fin ca o maioneză: piatra molcajete-ului îi dă textura rustică și sufletul.”',
    chefTip: 'Zdrobiți mai întâi ceapa, ardeiul iute, sarea și coriandrul într-o pastă fină (chiltomatl/base) în mojar, apoi încorporați cuburile de avocado prin zdrobire ușoară pentru bucăți texturate.',
    pairingSuggestion: 'Cerveza artizanală mexicană cu lime rece sau Mezcal tânăr cu note minerale',
    editorialSubtitle: 'Prospețimea vibrantă a avocado-ului zdrobit în piatră vulcanică.',
  },
  rec_sarmale_traditionale_012: {
    id: 'rec_sarmale_traditionale_012',
    image: '/images/sarmale.jpg',
    imageAlt: 'Sarmale tradiționale în foi de varză murată cu mămăligă și smântână',
    imageCaption: 'Sarmale rulate atent în foi subțiri de varză murată, fierte molcom în vas de lut cu afumătură și cimbru uscat.',
    heritage: 'Tradiție Pan-Românească • Moldova & Muntenia',
    region: 'Patrimoniu culinar românesc imaterial',
    terroir: 'Varză murată la butoi de stejar, carne mixtă porc-vită, cimbru sălbatic de grădină',
    chefQuote: '„Sarmaua desăvârșită cere foi subțiri ca mătasea, foc blând ca o rugăciune și odihnă de o zi înainte de ospăț.”',
    chefTip: 'Gustați foile de varză murată înainte de împăturit; dacă sunt prea sărate sau acre, lăsați-le la desărat în apă călduță timp de 1–2 ore înainte de rulare.',
    pairingSuggestion: 'Fetească Neagră de Dealu Mare baricată sau Novac',
    editorialSubtitle: 'Sărbătoarea ospitalității și a gustului profund românesc.',
  },
};

export function mapDbProfileToEditorialProfile(db: DbRecipeEditorialProfile): RecipeEditorialProfile {
  return {
    id: db.recipe_id,
    image: db.image_url || '/images/tagliatelle-ragu.jpg',
    imageAlt: db.image_alt || db.editorial_subtitle || '',
    imageCaption: db.image_caption || '',
    heritage: db.heritage || '',
    region: db.region_context || '',
    terroir: db.terroir || '',
    chefQuote: db.chef_quote || '',
    chefTip: db.chef_tip || undefined,
    pairingSuggestion: db.pairing_suggestion || '',
    editorialSubtitle: db.editorial_subtitle || '',
    imageRightsStatus: db.image_rights_status,
    imageAuthor: db.image_author,
    imageLicense: db.image_license,
    imageAttribution: db.image_attribution,
    editorialStatus: db.editorial_status,
    profileVersion: db.profile_version,
    approvedBy: db.approved_by,
    approvedAt: db.approved_at,
  };
}

export function getRecipeEditorial(
  id: string | null | undefined,
  liveDbProfile?: DbRecipeEditorialProfile | null
): RecipeEditorialProfile | null {
  if (liveDbProfile && (liveDbProfile.image_url || liveDbProfile.editorial_subtitle || liveDbProfile.chef_quote)) {
    return mapDbProfileToEditorialProfile(liveDbProfile);
  }
  if (!id) return null;
  return EDITORIAL_RECIPES[id] || null;
}
