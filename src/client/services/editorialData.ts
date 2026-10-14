// Curated Editorial Metadata & Gastronomic Photography for Atlas Gastronomic
// Strictly presentation-layer enrichment; all canonical recipe data remains derived from Recipe Core.

export interface RecipeEditorialProfile {
  id: string;
  image: string;
  imageAlt: string;
  imageCaption: string;
  heritage: string;
  region: string;
  terroir: string;
  chefQuote: string;
  pairingSuggestion: string;
  editorialSubtitle: string;
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
    pairingSuggestion: 'Chablis Premier Cru sau Côtes du Jura Savagnin',
    editorialSubtitle: 'Cea mai delicată arhitectură termică a bucătăriei clasice franceze.',
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
    pairingSuggestion: 'Fetească Neagră de Dealu Mare baricată sau Novac',
    editorialSubtitle: 'Sărbătoarea ospitalității și a gustului profund românesc.',
  },
};

export function getRecipeEditorial(id: string | null | undefined): RecipeEditorialProfile | null {
  if (!id) return null;
  return EDITORIAL_RECIPES[id] || null;
}
