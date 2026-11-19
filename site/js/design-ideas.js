/* =========================================================
   DESIGN IDEAS VIEW — self-contained module.
   The site router (js/main.js) calls window.DIC_IDEAS
   to show, steer and hide this page.
========================================================= */
(() => {
  'use strict';
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer  = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const body = document.body;
  const esc = str => String(str).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  const pad = n => String(n).padStart(2, '0');
  const slug = s => s.toLowerCase().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  /* ---------------------------------------------------------
     DATA — the full catalogue.
     Taken from the studio's real projects (same photos as the Portfolio).
     IDEAS: { id, t: title, c: collection index, r: room, s: Completed / design concept,
              d: description, p: [[photoId, caption, note], …] }
     A photoId is a file name in site/images (without .webp).
  --------------------------------------------------------- */
  const CATS  = ["Living & dining", "Kitchens", "Bedrooms & wardrobes", "Pooja spaces", "Workspaces & studios", "Details & storage"];
  const IDEAS = [
    {"id":"living-room-completed","t":"Living Room — Completed","c":0,"r":"Living Room","s":"Completed","d":"Living rooms planned around how the family gathers — wall mouldings, cove lighting, feature walls and seating composed as one.","p":[["saveetha-01","Living Room · Saveetha Residence, Keelkattalai, Chennai","The living area features classic wall mouldings, a sleek floating TV unit, fluted wooden accents and soft cove lighting."],["saveetha-05","Living Room · Saveetha Residence, Keelkattalai, Chennai","The living area features classic wall mouldings, a sleek floating TV unit, fluted wooden accents and soft cove lighting."],["saveetha-07","Living Room · Saveetha Residence, Keelkattalai, Chennai","The living area features classic wall mouldings, a sleek floating TV unit, fluted wooden accents and soft cove lighting."],["saveetha-18","Living Room · Saveetha Residence, Keelkattalai, Chennai","The living area features classic wall mouldings, a sleek floating TV unit, fluted wooden accents and soft cove lighting."],["venkateswara-01","Living Room · Venkateswara Rao Residence, Ponmar, Chennai","The living area features a sleek TV unit, illuminated display niches and thoughtfully arranged decorative accents."],["mukundhan-01","Living Room · Mukundhan Residence, Keelkattalai, Chennai","The living area features a sleek floating TV unit, marble-inspired flooring and elegant devotional accents."],["mukundhan-05","Living Room · Mukundhan Residence, Keelkattalai, Chennai","The living area features a sleek floating TV unit, marble-inspired flooring and elegant devotional accents."],["mukundhan-06","Living Room · Mukundhan Residence, Keelkattalai, Chennai","The living area features a sleek floating TV unit, marble-inspired flooring and elegant devotional accents."],["navin-2-06","Living Room · Navin Residence — Phase 2, Katpadi, Vellore","The living area features classic wall mouldings, a floating TV console, decorative lighting and beautifully curved wooden accents."],["navin-2-08","Living Room · Navin Residence — Phase 2, Katpadi, Vellore","The living area features classic wall mouldings, a floating TV console, decorative lighting and beautifully curved wooden accents."],["navin-2-28","Living Room · Navin Residence — Phase 2, Katpadi, Vellore","The living area features classic wall mouldings, a floating TV console, decorative lighting and beautifully curved wooden accents."],["senthil-04","Living Room · Senthil Residence, Adyar, Chennai","A distinctive fusion of artistic expression and traditional elegance, this interior celebrates creativity through rich wooden textures, cultural detailing and warm ambient lighting."],["senthil-09","Living Room · Senthil Residence, Adyar, Chennai","A distinctive fusion of artistic expression and traditional elegance, this interior celebrates creativity through rich wooden textures, cultural detailing and warm ambient lighting."],["fayyaz-01","Living Room · Fayyaz Manzil, Velachery, Chennai","The living area features plush green seating, graceful arched detailing, decorative wall textures and elegant pendant lighting."],["kalpana-2-01","Living Room · Kalpana Residence — Phase 2, Katpadi, Vellore","The living area features graceful curved detailing, a sleek TV unit, fluted panelling and sophisticated gold-accented partitions."]]},
    {"id":"living-room-concepts","t":"Living Room — Design Concepts","c":0,"r":"Living Room","s":"Design concept","d":"Living rooms planned around how the family gathers — wall mouldings, cove lighting, feature walls and seating composed as one.","p":[["srinivasan-01","Living Room · Srinivasan Residence, Keelkattalai, Chennai","The living area features an intricately detailed wooden pooja unit, classic wall mouldings, warm ambient lighting and vibrant mustard-yellow seating that adds character to the space."],["srinivasan-08","Living Room · Srinivasan Residence, Keelkattalai, Chennai","The living area features an intricately detailed wooden pooja unit, classic wall mouldings, warm ambient lighting and vibrant mustard-yellow seating that adds character to the space."],["kalpana-01","Living Room · Kalpana Residence, Katpadi, Vellore","The living area features sculptural furniture, textured feature walls, subtle architectural detailing and warm ambient lighting."],["navin-01","Living Room · Navin Residence, Katpadi, Vellore","The living area features graceful wall mouldings, fluted detailing, soft neutral furnishings and elegant cove lighting."],["navin-04","Living Room · Navin Residence, Katpadi, Vellore","The living area features graceful wall mouldings, fluted detailing, soft neutral furnishings and elegant cove lighting."],["navin-06","Living Room · Navin Residence, Katpadi, Vellore","The living area features graceful wall mouldings, fluted detailing, soft neutral furnishings and elegant cove lighting."],["karthik-01","Living Room · Karthik Residence, Erode","The living area features textured sage-green wall panels, circular decorative elements, soft ivory seating and graceful curved openings."],["vaibhav-01","Living Room · Vaibhav Residence, Keelkattalai, Chennai","The living area features ornate wooden furniture, delicate botanical wallpapers, peacock motifs and refreshing mint-green accents."],["sandhya-01","Living Room · Sandhya Residence, Katpadi, Vellore","The living area features sophisticated wall panelling, a sleek TV unit, illuminated display shelves and soft ambient lighting."],["jeyashree-01","Living Room · Jeyashree Residence, Katpadi, Vellore","The living area features sculptural wall detailing, delicate metallic décor, soft ivory seating and subtle ambient lighting."],["jeyashree-05","Living Room · Jeyashree Residence, Katpadi, Vellore","The living area features sculptural wall detailing, delicate metallic décor, soft ivory seating and subtle ambient lighting."],["karthik-2-01","Living Room · Karthik Residence — Phase 2, Erode","The living area features elegant wall mouldings, floor-length curtains, plush seating and thoughtfully arranged accent lighting."],["karthik-2-06","Living Room · Karthik Residence — Phase 2, Erode","The living area features elegant wall mouldings, floor-length curtains, plush seating and thoughtfully arranged accent lighting."],["karthik-2-07","Living Room · Karthik Residence — Phase 2, Erode","The living area features elegant wall mouldings, floor-length curtains, plush seating and thoughtfully arranged accent lighting."],["varun-01","Living Room · Varun Residence, Bengaluru","The living area features sleek TV panelling, floating cabinetry, soft neutral furnishings and a beautifully coordinated dining space."],["varun-09","Living Room · Varun Residence, Bengaluru","The living area features sleek TV panelling, floating cabinetry, soft neutral furnishings and a beautifully coordinated dining space."],["varun-12","Living Room · Varun Residence, Bengaluru","The living area features sleek TV panelling, floating cabinetry, soft neutral furnishings and a beautifully coordinated dining space."],["nihitha-01","Living Room · Nihitha Sinha Residence, Bengaluru","The living area features elegant fluted wall panelling, a sleek floating TV unit, illuminated display shelving and soft ambient lighting."],["nihitha-07","Living Room · Nihitha Sinha Residence, Bengaluru","The living area features elegant fluted wall panelling, a sleek floating TV unit, illuminated display shelving and soft ambient lighting."]]},
    {"id":"tv-units-completed","t":"TV Units — Completed","c":0,"r":"TV Units","s":"Completed","d":"Floating consoles, panelled TV walls and lit display niches that keep the media wall calm and uncluttered.","p":[["saveetha-11","TV unit · Saveetha Residence, Keelkattalai, Chennai","The living area features classic wall mouldings, a sleek floating TV unit, fluted wooden accents and soft cove lighting."],["saveetha-13","TV unit · Saveetha Residence, Keelkattalai, Chennai","The living area features classic wall mouldings, a sleek floating TV unit, fluted wooden accents and soft cove lighting."],["venkateswara-05","TV unit · Venkateswara Rao Residence, Ponmar, Chennai","The living area features a sleek TV unit, illuminated display niches and thoughtfully arranged decorative accents."],["venkateswara-06","TV unit · Venkateswara Rao Residence, Ponmar, Chennai","The living area features a sleek TV unit, illuminated display niches and thoughtfully arranged decorative accents."],["mukundhan-13","TV unit · Mukundhan Residence, Keelkattalai, Chennai","The living area features a sleek floating TV unit, marble-inspired flooring and elegant devotional accents."],["mukundhan-15","TV unit · Mukundhan Residence, Keelkattalai, Chennai","The living area features a sleek floating TV unit, marble-inspired flooring and elegant devotional accents."],["navin-2-01","TV unit · Navin Residence — Phase 2, Katpadi, Vellore","The living area features classic wall mouldings, a floating TV console, decorative lighting and beautifully curved wooden accents."],["navin-2-05","TV unit · Navin Residence — Phase 2, Katpadi, Vellore","The living area features classic wall mouldings, a floating TV console, decorative lighting and beautifully curved wooden accents."],["fayyaz-16","TV unit · Fayyaz Manzil, Velachery, Chennai","A captivating blend of Arabic-inspired elegance and contemporary luxury, this residence showcases rich emerald-green tones, warm wooden textures and sophisticated golden accents."],["kalpana-2-02","TV unit · Kalpana Residence — Phase 2, Katpadi, Vellore","The living area features graceful curved detailing, a sleek TV unit, fluted panelling and sophisticated gold-accented partitions."]]},
    {"id":"tv-units-concepts","t":"TV Units — Design Concepts","c":0,"r":"TV Units","s":"Design concept","d":"Floating consoles, panelled TV walls and lit display niches that keep the media wall calm and uncluttered.","p":[["srinivasan-10","TV unit · Srinivasan Residence, Keelkattalai, Chennai","A harmonious blend of traditional craftsmanship and contemporary elegance, this residence celebrates timeless design with modern comfort."],["srinivasan-15","TV unit · Srinivasan Residence, Keelkattalai, Chennai","A harmonious blend of traditional craftsmanship and contemporary elegance, this residence celebrates timeless design with modern comfort."],["kalpana-06","TV unit · Kalpana Residence, Katpadi, Vellore","A refined expression of modern minimalism, this residence embraces soft neutral tones, graceful curves and understated elegance."],["kalpana-08","TV unit · Kalpana Residence, Katpadi, Vellore","A refined expression of modern minimalism, this residence embraces soft neutral tones, graceful curves and understated elegance."],["navin-03","TV unit · Navin Residence, Katpadi, Vellore","A beautifully crafted wooden pooja unit adds a distinctive traditional character, while the contemporary TV wall, coordinated cabinetry and thoughtfully arranged dining space create a harmonious balance of heritage, comfort and functionality."],["navin-11","TV unit · Navin Residence, Katpadi, Vellore","A beautifully crafted wooden pooja unit adds a distinctive traditional character, while the contemporary TV wall, coordinated cabinetry and thoughtfully arranged dining space create a harmonious balance of heritage, comfort and functionality."],["karthik-04","TV unit · Karthik Residence, Erode","A refreshing interpretation of contemporary living, this residence combines soothing neutrals with playful pastel accents and elegant architectural details."],["karthik-05","TV unit · Karthik Residence, Erode","A refreshing interpretation of contemporary living, this residence combines soothing neutrals with playful pastel accents and elegant architectural details."],["vaibhav-04","TV unit · Vaibhav Residence, Keelkattalai, Chennai","A captivating celebration of traditional elegance, this residence blends heritage-inspired craftsmanship with vibrant, nature-inspired design."],["jeyashree-04","TV unit · Jeyashree Residence, Katpadi, Vellore","A beautiful expression of contemporary elegance, this residence blends warm neutrals, natural wood textures and refreshing earthy accents."],["jeyashree-06","TV unit · Jeyashree Residence, Katpadi, Vellore","A beautiful expression of contemporary elegance, this residence blends warm neutrals, natural wood textures and refreshing earthy accents."],["jeyashree-18","TV unit · Jeyashree Residence, Katpadi, Vellore","A beautiful expression of contemporary elegance, this residence blends warm neutrals, natural wood textures and refreshing earthy accents."],["karthik-2-02","TV unit · Karthik Residence — Phase 2, Erode","A sophisticated TV feature wall with subtle metallic detailing and a floating console adds modern character."],["karthik-2-04","TV unit · Karthik Residence — Phase 2, Erode","A sophisticated TV feature wall with subtle metallic detailing and a floating console adds modern character."],["naren-03","TV unit · Naren Residence, Katpadi, Vellore","Custom wardrobes showcase graceful arched patterns with subtle metallic accents, while the contemporary TV unit mirrors the same design language."]]},
    {"id":"dining-area","t":"Dining Area","c":0,"r":"Dining Area","s":"Completed & concepts","d":"Dining corners and open dining zones with pendant lighting, crockery storage and finishes that suit everyday meals.","p":[["fayyaz-09","Dining Area · Fayyaz Manzil, Velachery, Chennai","A captivating blend of Arabic-inspired elegance and contemporary luxury, this residence showcases rich emerald-green tones, warm wooden textures and sophisticated golden accents."],["srinivasan-05","Dining Area · Srinivasan Residence, Keelkattalai, Chennai","A harmonious blend of traditional craftsmanship and contemporary elegance, this residence celebrates timeless design with modern comfort."],["kalpana-09","Dining Area · Kalpana Residence, Katpadi, Vellore","A refined expression of modern minimalism, this residence embraces soft neutral tones, graceful curves and understated elegance."],["kalpana-12","Dining Area · Kalpana Residence, Katpadi, Vellore","A refined expression of modern minimalism, this residence embraces soft neutral tones, graceful curves and understated elegance."],["navin-08","Dining Area · Navin Residence, Katpadi, Vellore","A beautifully crafted wooden pooja unit adds a distinctive traditional character, while the contemporary TV wall, coordinated cabinetry and thoughtfully arranged dining space create a harmonious balance of heritage, comfort and functionality."],["karthik-02","Dining Area · Karthik Residence, Erode","A refreshing interpretation of contemporary living, this residence combines soothing neutrals with playful pastel accents and elegant architectural details."],["varun-11","Dining Area · Varun Residence, Bengaluru","The living area features sleek TV panelling, floating cabinetry, soft neutral furnishings and a beautifully coordinated dining space."],["varun-14","Dining Area · Varun Residence, Bengaluru","The living area features sleek TV panelling, floating cabinetry, soft neutral furnishings and a beautifully coordinated dining space."],["nihitha-02","Dining Area · Nihitha Sinha Residence, Bengaluru","Decorative glass-front cabinets, warm wooden accents and thoughtfully arranged dining spaces create a welcoming atmosphere of modern comfort and sophistication."]]},
    {"id":"foyer-area-completed","t":"Foyer Area — Completed","c":0,"r":"Foyer Area","s":"Completed","d":"Entrances and passages that set the tone of the home, with mouldings, consoles and warm accent light.","p":[["saveetha-16","Foyer Area · Saveetha Residence, Keelkattalai, Chennai","A beautiful fusion of traditional craftsmanship and modern elegance, this residence showcases warm neutral tones, rich wooden textures and refined architectural details."],["navin-2-02","Foyer Area · Navin Residence — Phase 2, Katpadi, Vellore","A graceful blend of traditional craftsmanship and contemporary sophistication, this residence showcases rich wooden textures, warm ivory tones and elegant architectural detailing."],["navin-2-04","Foyer Area · Navin Residence — Phase 2, Katpadi, Vellore","A graceful blend of traditional craftsmanship and contemporary sophistication, this residence showcases rich wooden textures, warm ivory tones and elegant architectural detailing."],["fayyaz-04","Foyer Area · Fayyaz Manzil, Velachery, Chennai","A captivating blend of Arabic-inspired elegance and contemporary luxury, this residence showcases rich emerald-green tones, warm wooden textures and sophisticated golden accents."],["fayyaz-06","Foyer Area · Fayyaz Manzil, Velachery, Chennai","A captivating blend of Arabic-inspired elegance and contemporary luxury, this residence showcases rich emerald-green tones, warm wooden textures and sophisticated golden accents."],["kalpana-2-04","Foyer Area · Kalpana Residence — Phase 2, Katpadi, Vellore","A beautiful expression of contemporary minimalism and understated luxury, this residence embraces soothing neutral tones, elegant wall textures and warm ambient lighting."]]},
    {"id":"foyer-area-concepts","t":"Foyer Area — Design Concepts","c":0,"r":"Foyer Area","s":"Design concept","d":"Entrances and passages that set the tone of the home, with mouldings, consoles and warm accent light.","p":[["kalpana-11","Foyer Area · Kalpana Residence, Katpadi, Vellore","A refined expression of modern minimalism, this residence embraces soft neutral tones, graceful curves and understated elegance."],["navin-05","Foyer Area · Navin Residence, Katpadi, Vellore","A sophisticated fusion of traditional artistry and modern classic design, this residence showcases timeless elegance through warm wooden accents and refined architectural details."],["jeyashree-22","Foyer Area · Jeyashree Residence, Katpadi, Vellore","A beautiful expression of contemporary elegance, this residence blends warm neutrals, natural wood textures and refreshing earthy accents."],["varun-02","Foyer Area · Varun Residence, Bengaluru","A harmonious blend of Japandi-inspired simplicity and contemporary elegance, this residence celebrates natural textures, warm wood tones and understated luxury."]]},
    {"id":"kitchen-completed","t":"Kitchen — Completed","c":1,"r":"Kitchen","s":"Completed","d":"Modular kitchens with efficient storage, integrated lighting and finishes chosen for daily cooking.","p":[["saveetha-03","Kitchen · Saveetha Residence, Keelkattalai, Chennai","The modular kitchen combines elegant taupe cabinetry, streamlined storage and integrated lighting, creating a harmonious balance of heritage, comfort and contemporary functionality."],["saveetha-08","Kitchen · Saveetha Residence, Keelkattalai, Chennai","The modular kitchen combines elegant taupe cabinetry, streamlined storage and integrated lighting, creating a harmonious balance of heritage, comfort and contemporary functionality."],["venkateswara-03","Kitchen · Venkateswara Rao Residence, Ponmar, Chennai","The modular kitchen showcases wood-grain cabinetry, dark countertops and practical storage solutions."],["venkateswara-04","Kitchen · Venkateswara Rao Residence, Ponmar, Chennai","The modular kitchen showcases wood-grain cabinetry, dark countertops and practical storage solutions."],["mukundhan-03","Kitchen · Mukundhan Residence, Keelkattalai, Chennai","The modular kitchen combines glossy cabinetry, dark countertops and illuminated storage."],["mukundhan-08","Kitchen · Mukundhan Residence, Keelkattalai, Chennai","The modular kitchen combines glossy cabinetry, dark countertops and illuminated storage."],["mukundhan-09","Kitchen · Mukundhan Residence, Keelkattalai, Chennai","The modular kitchen combines glossy cabinetry, dark countertops and illuminated storage."],["navin-2-11","Kitchen · Navin Residence — Phase 2, Katpadi, Vellore","A graceful blend of traditional craftsmanship and contemporary sophistication, this residence showcases rich wooden textures, warm ivory tones and elegant architectural detailing."],["navin-2-12","Kitchen · Navin Residence — Phase 2, Katpadi, Vellore","A graceful blend of traditional craftsmanship and contemporary sophistication, this residence showcases rich wooden textures, warm ivory tones and elegant architectural detailing."],["navin-2-13","Kitchen · Navin Residence — Phase 2, Katpadi, Vellore","A graceful blend of traditional craftsmanship and contemporary sophistication, this residence showcases rich wooden textures, warm ivory tones and elegant architectural detailing."],["navin-2-14","Kitchen · Navin Residence — Phase 2, Katpadi, Vellore","A graceful blend of traditional craftsmanship and contemporary sophistication, this residence showcases rich wooden textures, warm ivory tones and elegant architectural detailing."],["navin-2-15","Kitchen · Navin Residence — Phase 2, Katpadi, Vellore","A graceful blend of traditional craftsmanship and contemporary sophistication, this residence showcases rich wooden textures, warm ivory tones and elegant architectural detailing."],["fayyaz-11","Kitchen · Fayyaz Manzil, Velachery, Chennai","A captivating blend of Arabic-inspired elegance and contemporary luxury, this residence showcases rich emerald-green tones, warm wooden textures and sophisticated golden accents."],["kalpana-2-08","Kitchen · Kalpana Residence — Phase 2, Katpadi, Vellore","A beautiful expression of contemporary minimalism and understated luxury, this residence embraces soothing neutral tones, elegant wall textures and warm ambient lighting."],["kalpana-2-09","Kitchen · Kalpana Residence — Phase 2, Katpadi, Vellore","A beautiful expression of contemporary minimalism and understated luxury, this residence embraces soothing neutral tones, elegant wall textures and warm ambient lighting."],["kalpana-2-16","Kitchen · Kalpana Residence — Phase 2, Katpadi, Vellore","A beautiful expression of contemporary minimalism and understated luxury, this residence embraces soothing neutral tones, elegant wall textures and warm ambient lighting."]]},
    {"id":"kitchen-concepts","t":"Kitchen — Design Concepts","c":1,"r":"Kitchen","s":"Design concept","d":"Modular kitchens with efficient storage, integrated lighting and finishes chosen for daily cooking.","p":[["srinivasan-09","Kitchen · Srinivasan Residence, Keelkattalai, Chennai","A harmonious blend of traditional craftsmanship and contemporary elegance, this residence celebrates timeless design with modern comfort."],["srinivasan-11","Kitchen · Srinivasan Residence, Keelkattalai, Chennai","A harmonious blend of traditional craftsmanship and contemporary elegance, this residence celebrates timeless design with modern comfort."],["srinivasan-12","Kitchen · Srinivasan Residence, Keelkattalai, Chennai","A harmonious blend of traditional craftsmanship and contemporary elegance, this residence celebrates timeless design with modern comfort."],["kalpana-03","Kitchen · Kalpana Residence, Katpadi, Vellore","A contemporary modular kitchen with sleek cabinetry and a playful terrazzo-inspired backsplash adds functionality and character to this thoughtfully designed home."],["kalpana-14","Kitchen · Kalpana Residence, Katpadi, Vellore","A contemporary modular kitchen with sleek cabinetry and a playful terrazzo-inspired backsplash adds functionality and character to this thoughtfully designed home."],["kalpana-15","Kitchen · Kalpana Residence, Katpadi, Vellore","A contemporary modular kitchen with sleek cabinetry and a playful terrazzo-inspired backsplash adds functionality and character to this thoughtfully designed home."],["navin-07","Kitchen · Navin Residence, Katpadi, Vellore","A sophisticated fusion of traditional artistry and modern classic design, this residence showcases timeless elegance through warm wooden accents and refined architectural details."],["navin-10","Kitchen · Navin Residence, Katpadi, Vellore","A sophisticated fusion of traditional artistry and modern classic design, this residence showcases timeless elegance through warm wooden accents and refined architectural details."],["navin-12","Kitchen · Navin Residence, Katpadi, Vellore","A sophisticated fusion of traditional artistry and modern classic design, this residence showcases timeless elegance through warm wooden accents and refined architectural details."],["karthik-06","Kitchen · Karthik Residence, Erode","A refreshing interpretation of contemporary living, this residence combines soothing neutrals with playful pastel accents and elegant architectural details."],["karthik-07","Kitchen · Karthik Residence, Erode","A refreshing interpretation of contemporary living, this residence combines soothing neutrals with playful pastel accents and elegant architectural details."],["karthik-08","Kitchen · Karthik Residence, Erode","A refreshing interpretation of contemporary living, this residence combines soothing neutrals with playful pastel accents and elegant architectural details."],["vaibhav-06","Kitchen · Vaibhav Residence, Keelkattalai, Chennai","A captivating celebration of traditional elegance, this residence blends heritage-inspired craftsmanship with vibrant, nature-inspired design."],["vaibhav-07","Kitchen · Vaibhav Residence, Keelkattalai, Chennai","A captivating celebration of traditional elegance, this residence blends heritage-inspired craftsmanship with vibrant, nature-inspired design."],["vaibhav-09","Kitchen · Vaibhav Residence, Keelkattalai, Chennai","A captivating celebration of traditional elegance, this residence blends heritage-inspired craftsmanship with vibrant, nature-inspired design."],["sandhya-03","Kitchen · Sandhya Residence, Katpadi, Vellore","The modular kitchen combines muted sage cabinetry with marble-inspired finishes and functional storage."],["sandhya-04","Kitchen · Sandhya Residence, Katpadi, Vellore","The modular kitchen combines muted sage cabinetry with marble-inspired finishes and functional storage."],["sandhya-05","Kitchen · Sandhya Residence, Katpadi, Vellore","The modular kitchen combines muted sage cabinetry with marble-inspired finishes and functional storage."],["jeyashree-08","Kitchen · Jeyashree Residence, Katpadi, Vellore","The modular kitchen combines olive-green cabinetry with warm wooden finishes and marble-inspired surfaces."],["jeyashree-09","Kitchen · Jeyashree Residence, Katpadi, Vellore","The modular kitchen combines olive-green cabinetry with warm wooden finishes and marble-inspired surfaces."],["jeyashree-11","Kitchen · Jeyashree Residence, Katpadi, Vellore","The modular kitchen combines olive-green cabinetry with warm wooden finishes and marble-inspired surfaces."],["jeyashree-12","Kitchen · Jeyashree Residence, Katpadi, Vellore","The modular kitchen combines olive-green cabinetry with warm wooden finishes and marble-inspired surfaces."],["varun-13","Kitchen · Varun Residence, Bengaluru","A harmonious blend of Japandi-inspired simplicity and contemporary elegance, this residence celebrates natural textures, warm wood tones and understated luxury."],["varun-15","Kitchen · Varun Residence, Bengaluru","A harmonious blend of Japandi-inspired simplicity and contemporary elegance, this residence celebrates natural textures, warm wood tones and understated luxury."],["nihitha-03","Kitchen · Nihitha Sinha Residence, Bengaluru","The modular kitchen showcases sage-green cabinetry, contrasting ivory finishes and a textured backsplash."]]},
    {"id":"crockery-utility-completed","t":"Crockery & Utility — Completed","c":1,"r":"Crockery & Utility","s":"Completed","d":"Crockery units, utility areas and tall storage that keep the kitchen working smoothly.","p":[["kalpana-2-10","Crockery & Utility · Kalpana Residence — Phase 2, Katpadi, Vellore","A beautiful expression of contemporary minimalism and understated luxury, this residence embraces soothing neutral tones, elegant wall textures and warm ambient lighting."],["navin-2-16","Crockery & Utility · Navin Residence — Phase 2, Katpadi, Vellore","A graceful blend of traditional craftsmanship and contemporary sophistication, this residence showcases rich wooden textures, warm ivory tones and elegant architectural detailing."]]},
    {"id":"crockery-utility-concepts","t":"Crockery & Utility — Design Concepts","c":1,"r":"Crockery & Utility","s":"Design concept","d":"Crockery units, utility areas and tall storage that keep the kitchen working smoothly.","p":[["kalpana-16","Crockery & Utility · Kalpana Residence, Katpadi, Vellore","A contemporary modular kitchen with sleek cabinetry and a playful terrazzo-inspired backsplash adds functionality and character to this thoughtfully designed home."],["karthik-09","Crockery & Utility · Karthik Residence, Erode","A refreshing interpretation of contemporary living, this residence combines soothing neutrals with playful pastel accents and elegant architectural details."],["kalpana-13","Crockery & Utility · Kalpana Residence, Katpadi, Vellore","A contemporary modular kitchen with sleek cabinetry and a playful terrazzo-inspired backsplash adds functionality and character to this thoughtfully designed home."],["jeyashree-10","Crockery & Utility · Jeyashree Residence, Katpadi, Vellore","The modular kitchen combines olive-green cabinetry with warm wooden finishes and marble-inspired surfaces."]]},
    {"id":"bedrooms-completed","t":"Bedrooms — Completed","c":2,"r":"Bedrooms","s":"Completed","d":"Bedrooms with upholstered headboards, wall panelling and soft lighting, planned as restful retreats.","p":[["saveetha-12","Bedroom · Saveetha Residence, Keelkattalai, Chennai","A beautiful fusion of traditional craftsmanship and modern elegance, this residence showcases warm neutral tones, rich wooden textures and refined architectural details."],["saveetha-14","Bedroom · Saveetha Residence, Keelkattalai, Chennai","A beautiful fusion of traditional craftsmanship and modern elegance, this residence showcases warm neutral tones, rich wooden textures and refined architectural details."],["mukundhan-12","Bedroom · Mukundhan Residence, Keelkattalai, Chennai","A graceful blend of traditional heritage and contemporary sophistication, this residence showcases soothing sage-green tones, rich wooden detailing and warm ambient lighting."],["mukundhan-14","Bedroom · Mukundhan Residence, Keelkattalai, Chennai","A graceful blend of traditional heritage and contemporary sophistication, this residence showcases soothing sage-green tones, rich wooden detailing and warm ambient lighting."],["mukundhan-16","Bedroom · Mukundhan Residence, Keelkattalai, Chennai","A graceful blend of traditional heritage and contemporary sophistication, this residence showcases soothing sage-green tones, rich wooden detailing and warm ambient lighting."],["mukundhan-18","Bedroom · Mukundhan Residence, Keelkattalai, Chennai","A graceful blend of traditional heritage and contemporary sophistication, this residence showcases soothing sage-green tones, rich wooden detailing and warm ambient lighting."],["mukundhan-21","Bedroom · Mukundhan Residence, Keelkattalai, Chennai","A graceful blend of traditional heritage and contemporary sophistication, this residence showcases soothing sage-green tones, rich wooden detailing and warm ambient lighting."],["mukundhan-22","Bedroom · Mukundhan Residence, Keelkattalai, Chennai","A graceful blend of traditional heritage and contemporary sophistication, this residence showcases soothing sage-green tones, rich wooden detailing and warm ambient lighting."],["navin-2-18","Bedroom · Navin Residence — Phase 2, Katpadi, Vellore","A graceful blend of traditional craftsmanship and contemporary sophistication, this residence showcases rich wooden textures, warm ivory tones and elegant architectural detailing."],["navin-2-19","Bedroom · Navin Residence — Phase 2, Katpadi, Vellore","A graceful blend of traditional craftsmanship and contemporary sophistication, this residence showcases rich wooden textures, warm ivory tones and elegant architectural detailing."],["navin-2-21","Bedroom · Navin Residence — Phase 2, Katpadi, Vellore","A graceful blend of traditional craftsmanship and contemporary sophistication, this residence showcases rich wooden textures, warm ivory tones and elegant architectural detailing."],["navin-2-23","Bedroom · Navin Residence — Phase 2, Katpadi, Vellore","A graceful blend of traditional craftsmanship and contemporary sophistication, this residence showcases rich wooden textures, warm ivory tones and elegant architectural detailing."],["navin-2-24","Bedroom · Navin Residence — Phase 2, Katpadi, Vellore","A graceful blend of traditional craftsmanship and contemporary sophistication, this residence showcases rich wooden textures, warm ivory tones and elegant architectural detailing."],["navin-2-25","Bedroom · Navin Residence — Phase 2, Katpadi, Vellore","A graceful blend of traditional craftsmanship and contemporary sophistication, this residence showcases rich wooden textures, warm ivory tones and elegant architectural detailing."],["navin-2-26","Bedroom · Navin Residence — Phase 2, Katpadi, Vellore","A graceful blend of traditional craftsmanship and contemporary sophistication, this residence showcases rich wooden textures, warm ivory tones and elegant architectural detailing."],["navin-2-29","Bedroom · Navin Residence — Phase 2, Katpadi, Vellore","A graceful blend of traditional craftsmanship and contemporary sophistication, this residence showcases rich wooden textures, warm ivory tones and elegant architectural detailing."],["fayyaz-12","Bedroom · Fayyaz Manzil, Velachery, Chennai","A captivating blend of Arabic-inspired elegance and contemporary luxury, this residence showcases rich emerald-green tones, warm wooden textures and sophisticated golden accents."],["fayyaz-13","Bedroom · Fayyaz Manzil, Velachery, Chennai","A captivating blend of Arabic-inspired elegance and contemporary luxury, this residence showcases rich emerald-green tones, warm wooden textures and sophisticated golden accents."],["fayyaz-17","Bedroom · Fayyaz Manzil, Velachery, Chennai","A captivating blend of Arabic-inspired elegance and contemporary luxury, this residence showcases rich emerald-green tones, warm wooden textures and sophisticated golden accents."],["kalpana-2-11","Bedroom · Kalpana Residence — Phase 2, Katpadi, Vellore","Comfortable grey seating creates an inviting atmosphere, while the bedroom showcases a refreshing sage-green headboard, delicate floral patterns and practical furnishings."],["kalpana-2-12","Bedroom · Kalpana Residence — Phase 2, Katpadi, Vellore","Comfortable grey seating creates an inviting atmosphere, while the bedroom showcases a refreshing sage-green headboard, delicate floral patterns and practical furnishings."],["kalpana-2-14","Bedroom · Kalpana Residence — Phase 2, Katpadi, Vellore","Comfortable grey seating creates an inviting atmosphere, while the bedroom showcases a refreshing sage-green headboard, delicate floral patterns and practical furnishings."],["kalpana-2-15","Bedroom · Kalpana Residence — Phase 2, Katpadi, Vellore","Comfortable grey seating creates an inviting atmosphere, while the bedroom showcases a refreshing sage-green headboard, delicate floral patterns and practical furnishings."]]},
    {"id":"bedrooms-concepts","t":"Bedrooms — Design Concepts","c":2,"r":"Bedrooms","s":"Design concept","d":"Bedrooms with upholstered headboards, wall panelling and soft lighting, planned as restful retreats.","p":[["srinivasan-02","Bedroom · Srinivasan Residence, Keelkattalai, Chennai","The bedroom embraces a soothing neutral palette, complemented by elegant vertical panelling, integrated lighting and thoughtfully designed storage."],["srinivasan-07","Bedroom · Srinivasan Residence, Keelkattalai, Chennai","The bedroom embraces a soothing neutral palette, complemented by elegant vertical panelling, integrated lighting and thoughtfully designed storage."],["srinivasan-14","Bedroom · Srinivasan Residence, Keelkattalai, Chennai","The bedroom embraces a soothing neutral palette, complemented by elegant vertical panelling, integrated lighting and thoughtfully designed storage."],["kalpana-02","Bedroom · Kalpana Residence, Katpadi, Vellore","The bedroom combines elegant wall panelling with muted coral accents, creating a restful atmosphere."],["kalpana-07","Bedroom · Kalpana Residence, Katpadi, Vellore","The bedroom combines elegant wall panelling with muted coral accents, creating a restful atmosphere."],["navin-13","Bedroom · Navin Residence, Katpadi, Vellore","A sophisticated fusion of traditional artistry and modern classic design, this residence showcases timeless elegance through warm wooden accents and refined architectural details."],["navin-14","Bedroom · Navin Residence, Katpadi, Vellore","A sophisticated fusion of traditional artistry and modern classic design, this residence showcases timeless elegance through warm wooden accents and refined architectural details."],["navin-15","Bedroom · Navin Residence, Katpadi, Vellore","A sophisticated fusion of traditional artistry and modern classic design, this residence showcases timeless elegance through warm wooden accents and refined architectural details."],["navin-17","Bedroom · Navin Residence, Katpadi, Vellore","A sophisticated fusion of traditional artistry and modern classic design, this residence showcases timeless elegance through warm wooden accents and refined architectural details."],["karthik-03","Bedroom · Karthik Residence, Erode","The bedroom introduces warm coral cabinetry, refined wall panelling and coordinated furnishings, creating a cosy retreat."],["karthik-10","Bedroom · Karthik Residence, Erode","The bedroom introduces warm coral cabinetry, refined wall panelling and coordinated furnishings, creating a cosy retreat."],["karthik-12","Bedroom · Karthik Residence, Erode","The bedroom introduces warm coral cabinetry, refined wall panelling and coordinated furnishings, creating a cosy retreat."],["vaibhav-03","Bedroom · Vaibhav Residence, Keelkattalai, Chennai","The bedroom showcases rich green cabinetry, warm wooden furnishings and an artistic peacock-themed feature wall."],["vaibhav-05","Bedroom · Vaibhav Residence, Keelkattalai, Chennai","The bedroom showcases rich green cabinetry, warm wooden furnishings and an artistic peacock-themed feature wall."],["sandhya-06","Bedroom · Sandhya Residence, Katpadi, Vellore","A graceful fusion of traditional heritage and contemporary luxury, this residence showcases refined craftsmanship, warm neutral tones and elegant architectural detailing."],["sandhya-07","Bedroom · Sandhya Residence, Katpadi, Vellore","A graceful fusion of traditional heritage and contemporary luxury, this residence showcases refined craftsmanship, warm neutral tones and elegant architectural detailing."],["sandhya-09","Bedroom · Sandhya Residence, Katpadi, Vellore","A graceful fusion of traditional heritage and contemporary luxury, this residence showcases refined craftsmanship, warm neutral tones and elegant architectural detailing."],["sandhya-10","Bedroom · Sandhya Residence, Katpadi, Vellore","A graceful fusion of traditional heritage and contemporary luxury, this residence showcases refined craftsmanship, warm neutral tones and elegant architectural detailing."],["sandhya-12","Bedroom · Sandhya Residence, Katpadi, Vellore","A graceful fusion of traditional heritage and contemporary luxury, this residence showcases refined craftsmanship, warm neutral tones and elegant architectural detailing."],["sandhya-13","Bedroom · Sandhya Residence, Katpadi, Vellore","A graceful fusion of traditional heritage and contemporary luxury, this residence showcases refined craftsmanship, warm neutral tones and elegant architectural detailing."],["sandhya-14","Bedroom · Sandhya Residence, Katpadi, Vellore","A graceful fusion of traditional heritage and contemporary luxury, this residence showcases refined craftsmanship, warm neutral tones and elegant architectural detailing."],["jeyashree-13","Bedroom · Jeyashree Residence, Katpadi, Vellore","A beautiful expression of contemporary elegance, this residence blends warm neutrals, natural wood textures and refreshing earthy accents."],["jeyashree-17","Bedroom · Jeyashree Residence, Katpadi, Vellore","A beautiful expression of contemporary elegance, this residence blends warm neutrals, natural wood textures and refreshing earthy accents."],["naren-01","Bedroom · Naren Residence, Katpadi, Vellore","The bedroom features a plush upholstered headboard, coordinated furnishings and floor-length curtains, creating a serene retreat."],["varun-03","Bedroom · Varun Residence, Bengaluru","The bedroom showcases woven-texture wardrobe panels, delicate botanical artwork and soothing ambient lighting."],["varun-04","Bedroom · Varun Residence, Bengaluru","The bedroom showcases woven-texture wardrobe panels, delicate botanical artwork and soothing ambient lighting."],["varun-05","Bedroom · Varun Residence, Bengaluru","The bedroom showcases woven-texture wardrobe panels, delicate botanical artwork and soothing ambient lighting."],["varun-06","Bedroom · Varun Residence, Bengaluru","The bedroom showcases woven-texture wardrobe panels, delicate botanical artwork and soothing ambient lighting."],["varun-07","Bedroom · Varun Residence, Bengaluru","The bedroom showcases woven-texture wardrobe panels, delicate botanical artwork and soothing ambient lighting."],["varun-08","Bedroom · Varun Residence, Bengaluru","The bedroom showcases woven-texture wardrobe panels, delicate botanical artwork and soothing ambient lighting."],["varun-10","Bedroom · Varun Residence, Bengaluru","The bedroom showcases woven-texture wardrobe panels, delicate botanical artwork and soothing ambient lighting."],["nihitha-05","Bedroom · Nihitha Sinha Residence, Bengaluru","A stylish interpretation of contemporary living, this residence combines earthy green tones, warm neutrals and refined architectural detailing."],["nihitha-06","Bedroom · Nihitha Sinha Residence, Bengaluru","A stylish interpretation of contemporary living, this residence combines earthy green tones, warm neutrals and refined architectural detailing."],["nihitha-09","Bedroom · Nihitha Sinha Residence, Bengaluru","A stylish interpretation of contemporary living, this residence combines earthy green tones, warm neutrals and refined architectural detailing."],["nihitha-10","Bedroom · Nihitha Sinha Residence, Bengaluru","A stylish interpretation of contemporary living, this residence combines earthy green tones, warm neutrals and refined architectural detailing."],["nihitha-11","Bedroom · Nihitha Sinha Residence, Bengaluru","A stylish interpretation of contemporary living, this residence combines earthy green tones, warm neutrals and refined architectural detailing."],["nihitha-12","Bedroom · Nihitha Sinha Residence, Bengaluru","A stylish interpretation of contemporary living, this residence combines earthy green tones, warm neutrals and refined architectural detailing."],["nihitha-13","Bedroom · Nihitha Sinha Residence, Bengaluru","A stylish interpretation of contemporary living, this residence combines earthy green tones, warm neutrals and refined architectural detailing."],["nihitha-14","Bedroom · Nihitha Sinha Residence, Bengaluru","A stylish interpretation of contemporary living, this residence combines earthy green tones, warm neutrals and refined architectural detailing."],["nihitha-16","Bedroom · Nihitha Sinha Residence, Bengaluru","A stylish interpretation of contemporary living, this residence combines earthy green tones, warm neutrals and refined architectural detailing."],["nihitha-17","Bedroom · Nihitha Sinha Residence, Bengaluru","A stylish interpretation of contemporary living, this residence combines earthy green tones, warm neutrals and refined architectural detailing."],["nihitha-18","Bedroom · Nihitha Sinha Residence, Bengaluru","A stylish interpretation of contemporary living, this residence combines earthy green tones, warm neutrals and refined architectural detailing."]]},
    {"id":"kids-bedroom","t":"Kids Bedroom","c":2,"r":"Kids Bedroom","s":"Design concept","d":"Kids’ rooms with study desks, playful colour and storage that grows with them.","p":[["kalpana-04","Kids Bedroom · Kalpana Residence, Katpadi, Vellore","The bedroom combines elegant wall panelling with muted coral accents, creating a restful atmosphere."],["kalpana-05","Kids Bedroom · Kalpana Residence, Katpadi, Vellore","The bedroom combines elegant wall panelling with muted coral accents, creating a restful atmosphere."],["jeyashree-19","Kids Bedroom · Jeyashree Residence, Katpadi, Vellore","A beautiful expression of contemporary elegance, this residence blends warm neutrals, natural wood textures and refreshing earthy accents."],["jeyashree-20","Kids Bedroom · Jeyashree Residence, Katpadi, Vellore","A beautiful expression of contemporary elegance, this residence blends warm neutrals, natural wood textures and refreshing earthy accents."],["jeyashree-21","Kids Bedroom · Jeyashree Residence, Katpadi, Vellore","A beautiful expression of contemporary elegance, this residence blends warm neutrals, natural wood textures and refreshing earthy accents."]]},
    {"id":"wardrobes-completed","t":"Wardrobes — Completed","c":2,"r":"Wardrobes","s":"Completed","d":"Custom wardrobes, lofts and lit niches built to measure for every room.","p":[["saveetha-10","Wardrobe · Saveetha Residence, Keelkattalai, Chennai","A beautiful fusion of traditional craftsmanship and modern elegance, this residence showcases warm neutral tones, rich wooden textures and refined architectural details."],["saveetha-17","Wardrobe · Saveetha Residence, Keelkattalai, Chennai","A beautiful fusion of traditional craftsmanship and modern elegance, this residence showcases warm neutral tones, rich wooden textures and refined architectural details."],["venkateswara-08","Wardrobe · Venkateswara Rao Residence, Ponmar, Chennai","A charming blend of traditional warmth and contemporary functionality, this residence celebrates rich wooden textures, elegant detailing and inviting ambient lighting."],["venkateswara-09","Wardrobe · Venkateswara Rao Residence, Ponmar, Chennai","A charming blend of traditional warmth and contemporary functionality, this residence celebrates rich wooden textures, elegant detailing and inviting ambient lighting."],["mukundhan-19","Wardrobe · Mukundhan Residence, Keelkattalai, Chennai","A graceful blend of traditional heritage and contemporary sophistication, this residence showcases soothing sage-green tones, rich wooden detailing and warm ambient lighting."],["navin-2-17","Wardrobe · Navin Residence — Phase 2, Katpadi, Vellore","A graceful blend of traditional craftsmanship and contemporary sophistication, this residence showcases rich wooden textures, warm ivory tones and elegant architectural detailing."],["navin-2-22","Wardrobe · Navin Residence — Phase 2, Katpadi, Vellore","A graceful blend of traditional craftsmanship and contemporary sophistication, this residence showcases rich wooden textures, warm ivory tones and elegant architectural detailing."],["kalpana-2-13","Wardrobe · Kalpana Residence — Phase 2, Katpadi, Vellore","A beautiful expression of contemporary minimalism and understated luxury, this residence embraces soothing neutral tones, elegant wall textures and warm ambient lighting."]]},
    {"id":"wardrobes-concepts","t":"Wardrobes — Design Concepts","c":2,"r":"Wardrobes","s":"Design concept","d":"Custom wardrobes, lofts and lit niches built to measure for every room.","p":[["srinivasan-16","Wardrobe · Srinivasan Residence, Keelkattalai, Chennai","A harmonious blend of traditional craftsmanship and contemporary elegance, this residence celebrates timeless design with modern comfort."],["kalpana-10","Wardrobe · Kalpana Residence, Katpadi, Vellore","A refined expression of modern minimalism, this residence embraces soft neutral tones, graceful curves and understated elegance."],["navin-16","Wardrobe · Navin Residence, Katpadi, Vellore","A sophisticated fusion of traditional artistry and modern classic design, this residence showcases timeless elegance through warm wooden accents and refined architectural details."],["karthik-11","Wardrobe · Karthik Residence, Erode","A refreshing interpretation of contemporary living, this residence combines soothing neutrals with playful pastel accents and elegant architectural details."],["vaibhav-08","Wardrobe · Vaibhav Residence, Keelkattalai, Chennai","A captivating celebration of traditional elegance, this residence blends heritage-inspired craftsmanship with vibrant, nature-inspired design."],["jeyashree-15","Wardrobe · Jeyashree Residence, Katpadi, Vellore","A beautiful expression of contemporary elegance, this residence blends warm neutrals, natural wood textures and refreshing earthy accents."],["jeyashree-16","Wardrobe · Jeyashree Residence, Katpadi, Vellore","A beautiful expression of contemporary elegance, this residence blends warm neutrals, natural wood textures and refreshing earthy accents."],["naren-02","Wardrobe · Naren Residence, Katpadi, Vellore","Custom wardrobes showcase graceful arched patterns with subtle metallic accents, while the contemporary TV unit mirrors the same design language."]]},
    {"id":"study-corner-completed","t":"Study Corner — Completed","c":2,"r":"Study Corner","s":"Completed","d":"Study tables and work corners fitted neatly into bedrooms and living spaces.","p":[["venkateswara-10","Study Corner · Venkateswara Rao Residence, Ponmar, Chennai","A charming blend of traditional warmth and contemporary functionality, this residence celebrates rich wooden textures, elegant detailing and inviting ambient lighting."],["mukundhan-23","Study Corner · Mukundhan Residence, Keelkattalai, Chennai","A graceful blend of traditional heritage and contemporary sophistication, this residence showcases soothing sage-green tones, rich wooden detailing and warm ambient lighting."],["navin-2-07","Study Corner · Navin Residence — Phase 2, Katpadi, Vellore","A graceful blend of traditional craftsmanship and contemporary sophistication, this residence showcases rich wooden textures, warm ivory tones and elegant architectural detailing."],["navin-2-30","Study Corner · Navin Residence — Phase 2, Katpadi, Vellore","A graceful blend of traditional craftsmanship and contemporary sophistication, this residence showcases rich wooden textures, warm ivory tones and elegant architectural detailing."],["fayyaz-14","Study Corner · Fayyaz Manzil, Velachery, Chennai","A captivating blend of Arabic-inspired elegance and contemporary luxury, this residence showcases rich emerald-green tones, warm wooden textures and sophisticated golden accents."],["kalpana-2-05","Study Corner · Kalpana Residence — Phase 2, Katpadi, Vellore","A beautiful expression of contemporary minimalism and understated luxury, this residence embraces soothing neutral tones, elegant wall textures and warm ambient lighting."],["kalpana-2-07","Study Corner · Kalpana Residence — Phase 2, Katpadi, Vellore","A beautiful expression of contemporary minimalism and understated luxury, this residence embraces soothing neutral tones, elegant wall textures and warm ambient lighting."]]},
    {"id":"study-corner-concepts","t":"Study Corner — Design Concepts","c":2,"r":"Study Corner","s":"Design concept","d":"Study tables and work corners fitted neatly into bedrooms and living spaces.","p":[["srinivasan-03","Study Corner · Srinivasan Residence, Keelkattalai, Chennai","A harmonious blend of traditional craftsmanship and contemporary elegance, this residence celebrates timeless design with modern comfort."],["srinivasan-04","Study Corner · Srinivasan Residence, Keelkattalai, Chennai","A harmonious blend of traditional craftsmanship and contemporary elegance, this residence celebrates timeless design with modern comfort."],["srinivasan-06","Study Corner · Srinivasan Residence, Keelkattalai, Chennai","A harmonious blend of traditional craftsmanship and contemporary elegance, this residence celebrates timeless design with modern comfort."],["karthik-13","Study Corner · Karthik Residence, Erode","A refreshing interpretation of contemporary living, this residence combines soothing neutrals with playful pastel accents and elegant architectural details."],["karthik-14","Study Corner · Karthik Residence, Erode","A refreshing interpretation of contemporary living, this residence combines soothing neutrals with playful pastel accents and elegant architectural details."],["sandhya-11","Study Corner · Sandhya Residence, Katpadi, Vellore","A graceful fusion of traditional heritage and contemporary luxury, this residence showcases refined craftsmanship, warm neutral tones and elegant architectural detailing."],["jeyashree-14","Study Corner · Jeyashree Residence, Katpadi, Vellore","A beautiful expression of contemporary elegance, this residence blends warm neutrals, natural wood textures and refreshing earthy accents."]]},
    {"id":"pooja-area-completed","t":"Pooja Area — Completed","c":3,"r":"Pooja Area","s":"Completed","d":"Pooja units and mandapams in crafted wood, with lattice shutters, brass details and soft backlight.","p":[["saveetha-02","Pooja Area · Saveetha Residence, Keelkattalai, Chennai","An intricately crafted wooden pooja unit adds spiritual warmth and timeless character."],["venkateswara-02","Pooja Area · Venkateswara Rao Residence, Ponmar, Chennai","A beautifully crafted corner pooja mandapam with intricate lattice detailing and warm illumination adds spiritual elegance."],["mukundhan-02","Pooja Area · Mukundhan Residence, Keelkattalai, Chennai","An intricately designed pooja space with carved wooden pillars, traditional artwork and golden detailing creates a serene atmosphere of spiritual elegance and modern comfort."],["mukundhan-10","Pooja Area · Mukundhan Residence, Keelkattalai, Chennai","An intricately designed pooja space with carved wooden pillars, traditional artwork and golden detailing creates a serene atmosphere of spiritual elegance and modern comfort."],["navin-2-03","Pooja Area · Navin Residence — Phase 2, Katpadi, Vellore","An intricately crafted pooja unit with illuminated lattice shutters adds spiritual warmth, while a stylish display cabinet with fluted panelling and soft lighting creates a harmonious balance of heritage, elegance and modern functionality."],["navin-2-09","Pooja Area · Navin Residence — Phase 2, Katpadi, Vellore","An intricately crafted pooja unit with illuminated lattice shutters adds spiritual warmth, while a stylish display cabinet with fluted panelling and soft lighting creates a harmonious balance of heritage, elegance and modern functionality."],["senthil-02","Pooja Area · Senthil Residence, Adyar, Chennai","A wood-panelled feature wall with an illuminated circular mirror adds character, while a compact pooja cabinet with decorative lattice shutters creates a harmonious blend of spirituality, artistry and modern functionality."],["senthil-06","Pooja Area · Senthil Residence, Adyar, Chennai","A wood-panelled feature wall with an illuminated circular mirror adds character, while a compact pooja cabinet with decorative lattice shutters creates a harmonious blend of spirituality, artistry and modern functionality."]]},
    {"id":"pooja-area-concepts","t":"Pooja Area — Design Concepts","c":3,"r":"Pooja Area","s":"Design concept","d":"Pooja units and mandapams in crafted wood, with lattice shutters, brass details and soft backlight.","p":[["navin-02","Pooja Area · Navin Residence, Katpadi, Vellore","A beautifully crafted wooden pooja unit adds a distinctive traditional character, while the contemporary TV wall, coordinated cabinetry and thoughtfully arranged dining space create a harmonious balance of heritage, comfort and functionality."],["navin-09","Pooja Area · Navin Residence, Katpadi, Vellore","A beautifully crafted wooden pooja unit adds a distinctive traditional character, while the contemporary TV wall, coordinated cabinetry and thoughtfully arranged dining space create a harmonious balance of heritage, comfort and functionality."],["vaibhav-02","Pooja Area · Vaibhav Residence, Keelkattalai, Chennai","A beautifully detailed devotional corner is complemented by traditional artwork and fluted wooden panelling."],["sandhya-02","Pooja Area · Sandhya Residence, Katpadi, Vellore","An intricately carved wooden pooja mandapam, enriched with traditional artwork and golden accents, adds spiritual warmth and timeless grandeur."],["jeyashree-02","Pooja Area · Jeyashree Residence, Katpadi, Vellore","A thoughtfully crafted pooja unit with decorative glass shutters adds traditional charm, creating a harmonious balance of modern comfort and timeless character."]]},
    {"id":"workstations","t":"Workstations","c":4,"r":"Workstations","s":"Design concept","d":"Ergonomic workstations, open shelving and integrated storage for a productive office floor.","p":[["sheik-01","Workstations · Sheik Office, Ranipet, Vellore","Ergonomic workstations, suspended open shelving and thoughtfully integrated storage maximise space efficiency."],["sheik-03","Workstations · Sheik Office, Ranipet, Vellore","Ergonomic workstations, suspended open shelving and thoughtfully integrated storage maximise space efficiency."],["sheik-04","Workstations · Sheik Office, Ranipet, Vellore","Ergonomic workstations, suspended open shelving and thoughtfully integrated storage maximise space efficiency."],["sheik-05","Workstations · Sheik Office, Ranipet, Vellore","Ergonomic workstations, suspended open shelving and thoughtfully integrated storage maximise space efficiency."],["sheik-07","Workstations · Sheik Office, Ranipet, Vellore","Ergonomic workstations, suspended open shelving and thoughtfully integrated storage maximise space efficiency."],["sheik-08","Workstations · Sheik Office, Ranipet, Vellore","Ergonomic workstations, suspended open shelving and thoughtfully integrated storage maximise space efficiency."]]},
    {"id":"conference-room","t":"Conference Room","c":4,"r":"Conference Room","s":"Design concept","d":"Meeting rooms with warm wood, linear lighting and seating for client conversations.","p":[["sheik-02","Conference Room · Sheik Office, Ranipet, Vellore","Linear ceiling lighting, subtle accent illumination and indoor greenery enhance the ambience, while collaborative desk arrangements encourage productivity and seamless teamwork."],["sheik-10","Conference Room · Sheik Office, Ranipet, Vellore","Linear ceiling lighting, subtle accent illumination and indoor greenery enhance the ambience, while collaborative desk arrangements encourage productivity and seamless teamwork."],["sheik-11","Conference Room · Sheik Office, Ranipet, Vellore","Linear ceiling lighting, subtle accent illumination and indoor greenery enhance the ambience, while collaborative desk arrangements encourage productivity and seamless teamwork."],["sheik-12","Conference Room · Sheik Office, Ranipet, Vellore","Linear ceiling lighting, subtle accent illumination and indoor greenery enhance the ambience, while collaborative desk arrangements encourage productivity and seamless teamwork."],["sheik-13","Conference Room · Sheik Office, Ranipet, Vellore","Linear ceiling lighting, subtle accent illumination and indoor greenery enhance the ambience, while collaborative desk arrangements encourage productivity and seamless teamwork."],["sheik-14","Conference Room · Sheik Office, Ranipet, Vellore","Linear ceiling lighting, subtle accent illumination and indoor greenery enhance the ambience, while collaborative desk arrangements encourage productivity and seamless teamwork."],["sheik-15","Conference Room · Sheik Office, Ranipet, Vellore","Linear ceiling lighting, subtle accent illumination and indoor greenery enhance the ambience, while collaborative desk arrangements encourage productivity and seamless teamwork."]]},
    {"id":"cabins","t":"Cabins","c":4,"r":"Cabins","s":"Design concept","d":"Partitioned workstations and cabins that give focus without closing off the team.","p":[["sheik-06","Cabin · Sheik Office, Ranipet, Vellore","Ergonomic workstations, suspended open shelving and thoughtfully integrated storage maximise space efficiency."],["sheik-09","Cabin · Sheik Office, Ranipet, Vellore","Ergonomic workstations, suspended open shelving and thoughtfully integrated storage maximise space efficiency."]]},
    {"id":"music-studio","t":"Music Studio","c":4,"r":"Music Studio","s":"Completed","d":"A creative studio with a coffered ceiling, instrument displays and a devotional corner.","p":[["senthil-01","Music Studio · Senthil Residence, Adyar, Chennai","The music studio features an elegant coffered ceiling, acoustic equipment, instrument displays and a beautifully arranged devotional space."],["senthil-08","Music Studio · Senthil Residence, Adyar, Chennai","The music studio features an elegant coffered ceiling, acoustic equipment, instrument displays and a beautifully arranged devotional space."]]},
    {"id":"details-decor","t":"Details & Décor","c":5,"r":"Details & Décor","s":"Completed","d":"Close-ups of the craft — carved wood, lighting, wall textures and accents that finish a room.","p":[["mukundhan-04","Details & Décor · Mukundhan Residence, Keelkattalai, Chennai","An intricately designed pooja space with carved wooden pillars, traditional artwork and golden detailing creates a serene atmosphere of spiritual elegance and modern comfort."],["navin-2-20","Details & Décor · Navin Residence — Phase 2, Katpadi, Vellore","The living area features classic wall mouldings, a floating TV console, decorative lighting and beautifully curved wooden accents."],["senthil-03","Details & Décor · Senthil Residence, Adyar, Chennai","The music studio features an elegant coffered ceiling, acoustic equipment, instrument displays and a beautifully arranged devotional space."],["senthil-05","Details & Décor · Senthil Residence, Adyar, Chennai","The music studio features an elegant coffered ceiling, acoustic equipment, instrument displays and a beautifully arranged devotional space."],["senthil-07","Details & Décor · Senthil Residence, Adyar, Chennai","The music studio features an elegant coffered ceiling, acoustic equipment, instrument displays and a beautifully arranged devotional space."],["fayyaz-05","Details & Décor · Fayyaz Manzil, Velachery, Chennai","The living area features plush green seating, graceful arched detailing, decorative wall textures and elegant pendant lighting."],["fayyaz-08","Details & Décor · Fayyaz Manzil, Velachery, Chennai","The living area features plush green seating, graceful arched detailing, decorative wall textures and elegant pendant lighting."],["fayyaz-10","Details & Décor · Fayyaz Manzil, Velachery, Chennai","The living area features plush green seating, graceful arched detailing, decorative wall textures and elegant pendant lighting."],["fayyaz-02","Details & Décor · Fayyaz Manzil, Velachery, Chennai","Intricate ceiling patterns, illuminated display niches and thoughtfully curated décor add distinctive character."],["fayyaz-03","Details & Décor · Fayyaz Manzil, Velachery, Chennai","Intricate ceiling patterns, illuminated display niches and thoughtfully curated décor add distinctive character."],["fayyaz-07","Details & Décor · Fayyaz Manzil, Velachery, Chennai","The living area features plush green seating, graceful arched detailing, decorative wall textures and elegant pendant lighting."]]},
    {"id":"vanity-units","t":"Vanity Units","c":5,"r":"Vanity Units","s":"Completed & concepts","d":"Wash-basin vanities with mirrors, storage and lighting that make small spaces feel finished.","p":[["saveetha-04","Vanity Units · Saveetha Residence, Keelkattalai, Chennai","A beautiful fusion of traditional craftsmanship and modern elegance, this residence showcases warm neutral tones, rich wooden textures and refined architectural details."],["venkateswara-07","Vanity Units · Venkateswara Rao Residence, Ponmar, Chennai","A charming blend of traditional warmth and contemporary functionality, this residence celebrates rich wooden textures, elegant detailing and inviting ambient lighting."],["navin-2-10","Vanity Units · Navin Residence — Phase 2, Katpadi, Vellore","A graceful blend of traditional craftsmanship and contemporary sophistication, this residence showcases rich wooden textures, warm ivory tones and elegant architectural detailing."],["jeyashree-07","Vanity Units · Jeyashree Residence, Katpadi, Vellore","A beautiful expression of contemporary elegance, this residence blends warm neutrals, natural wood textures and refreshing earthy accents."]]},
    {"id":"display-units","t":"Display Units","c":5,"r":"Display Units","s":"Completed","d":"Lit display shelving and showcases for collections, books and décor.","p":[["mukundhan-17","Display Units · Mukundhan Residence, Keelkattalai, Chennai","A graceful blend of traditional heritage and contemporary sophistication, this residence showcases soothing sage-green tones, rich wooden detailing and warm ambient lighting."],["mukundhan-20","Display Units · Mukundhan Residence, Keelkattalai, Chennai","A graceful blend of traditional heritage and contemporary sophistication, this residence showcases soothing sage-green tones, rich wooden detailing and warm ambient lighting."]]}
  ];
  const TOUR  = [
    {"n":"Living rooms","g":"Living","h":"Where the family gathers","d":"Wall mouldings, cove lighting, floating TV units and seating composed as one — planned around evenings at home.","img":"sandhya-01","alt":"Open living and dining under a lit floral ceiling in the Sandhya Residence, Katpadi","to":"living-room-completed"},
    {"n":"Modular kitchens","g":"Kitchens","h":"The working heart of home","d":"Modular kitchens with efficient storage, integrated lighting and finishes chosen for daily cooking.","img":"mukundhan-08","alt":"Parallel modular kitchen with lit open shelving in the Mukundhan Residence, Keelkattalai","to":"kitchen-completed"},
    {"n":"Bedrooms & wardrobes","g":"Bedrooms","h":"Rest, by design","d":"Upholstered headboards, wall panelling and custom wardrobes built to measure for every room.","img":"sandhya-13","alt":"Bedroom with a maroon upholstered headboard wall and cove lighting in the Sandhya Residence, Katpadi","to":"bedrooms-completed"},
    {"n":"Pooja spaces","g":"Pooja","h":"A sacred place for stillness","d":"Pooja units and mandapams in crafted wood, with lattice shutters, brass details and soft backlight.","img":"sandhya-02","alt":"Carved wooden pooja mandapam with brass lamps in the Sandhya Residence, Katpadi","to":"pooja-area-completed"},
    {"n":"Dining & foyer","g":"Dining","h":"Made for hospitality","d":"Dining corners and entrances with arched detailing, pendant lighting and consoles that welcome guests.","img":"fayyaz-09","alt":"Dining corner with arched detailing and a sage curtain wall in Fayyaz Manzil, Velachery","to":"foyer-area-completed"},
    {"n":"Workspaces","g":"Workspaces","h":"Built around focus & teamwork","d":"Ergonomic workstations, conference seating and integrated storage for a productive office.","img":"sheik-05","alt":"Office workstations with suspended shelving in the Sheik Office, Ranipet","to":"workstations"},
    {"n":"Music studio","g":"Studio","h":"Creativity, at home","d":"A coffered ceiling, instrument displays and a devotional corner in a warm, wood-panelled studio.","img":"senthil-08","alt":"Music studio with a coffered ceiling in the Senthil Residence, Adyar","to":"music-studio"}
  ];

  const IMG = id => DIC_PHOTO(id);      /* photos live in site/images */
  const byId = Object.create(null);
  IDEAS.forEach(it => {
    byId[it.id] = it;
    it._h = [it.t, it.r, it.s, it.d, CATS[it.c]].concat(...it.p.map(p => [p[1], p[2]])).join(' ').toLowerCase();
  });
  const TOTAL_VIEWS = IDEAS.reduce((a, it) => a + it.p.length, 0);
  const ROOMS = [];                       /* [{ name, c, n }] in catalogue order */
  IDEAS.forEach(it => {
    const r = ROOMS.find(x => x.name === it.r);
    if (r) r.n++; else ROOMS.push({ name: it.r, c: it.c, n: 1 });
  });
  const roomBySlug = Object.create(null);
  ROOMS.forEach(r => { roomBySlug[slug(r.name)] = r.name; });
  /* anchors used by the Design Ideas menu on every page */
  const ROOM_ALIAS = { 'pooja': 'Pooja Area', 'master-bedroom': 'Bedrooms', 'home-office': 'Study Corner', 'wardrobe': 'Wardrobes' };

  /* photos: fade in when decoded; if one is ever missing, fall back once, then show a quiet panel */
  document.addEventListener('load', e => {
    const t = e.target;
    if (t && t.tagName === 'IMG' && t.classList.contains('di-img')) t.classList.add('is-ld');
  }, true);
  document.addEventListener('error', e => {
    const t = e.target;
    if (!t || t.tagName !== 'IMG' || !t.classList.contains('di-img') || !t.closest('#ideasView') || t.closest('#iv')) return;   /* only Design Ideas photos; the viewer handles its own fallback */
    const fb = t.dataset.fb;
    if (fb && t.dataset.fbUsed !== '1') { t.dataset.fbUsed = '1'; t.src = fb; return; }
    if (t.parentElement) t.parentElement.classList.add('is-missing');
  }, true);
  const settle = root => $$('img.di-img', root).forEach(im => { if (im.complete && im.naturalWidth) im.classList.add('is-ld'); });

  /* ---------------------------------------------------------
     1 — HERO: wipe stage + index tour
  --------------------------------------------------------- */
  const view      = $('#ideasView');
  const hero      = $('#top');
  const stage     = $('#diStage');
  const slidesBox = $('#diSlides');
  const ghost     = $('#diGhost');
  const ghostWord = $('#diGhostWord');
  const trList    = $('#trList');
  const trPlay    = $('#trPlay');
  const N = TOUR.length;
  let cur = 0, wipeTimer = 0, ghostTimer = 0;
  const holds = new Set();
  function setHold(key, on) {
    if (on) holds.add(key); else holds.delete(key);
    hero.classList.toggle('is-paused', holds.size > 0);
  }

  /* slides: the first is in the markup; the rest are created here and load just before they are needed */
  const slides = [$('.di-slide', slidesBox)];
  TOUR.forEach((t, i) => {
    if (i === 0) return;
    const fig = document.createElement('figure');
    fig.className = 'di-slide';
    const im = document.createElement('img');
    im.alt = t.alt;
    im.decoding = 'async';
    im.dataset.src = IMG(t.img);
    im.dataset.fb = IMG(TOUR[0].img);
    fig.appendChild(im);
    slidesBox.appendChild(fig);
    slides.push(fig);
  });
  const warm = i => {
    const im = $('img', slides[(i + N) % N]);
    if (im && im.dataset.src) { im.src = im.dataset.src; delete im.dataset.src; }
  };

  trList.innerHTML = TOUR.map((t, i) => `
    <li class="tr${i === 0 ? ' is-open' : ''}">
      <button class="tr-trigger" type="button" aria-expanded="${i === 0}" aria-controls="trP${i}">
        <span class="tr-no">${pad(i + 1)}</span>
        <span class="tr-name">${esc(t.n)}</span>
        <span class="tr-ico" aria-hidden="true"></span>
      </button>
      <div class="tr-panel" id="trP${i}">
        <div class="tr-panel-in">
          <h2>${esc(t.h)}</h2>
          <p>${esc(t.d)}</p>
          <a class="tr-go" href="#design-ideas" data-tour="${i}">Explore ${esc(t.n.toLowerCase())}
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg></a>
        </div>
      </div>
    </li>`).join('');
  const trItems = $$('.tr', trList);
  $('#trTotal').textContent = pad(N);

  function time() {
    trItems.forEach(li => li.classList.remove('is-timing'));
    if (reduceMotion) return;
    const li = trItems[cur];
    void li.offsetWidth;                       /* restart the fill */
    li.classList.add('is-timing');
  }
  function go(next, dir, focusless) {
    next = (next + N) % N;
    if (next === cur) return;
    const prev = slides[cur], incoming = slides[next];
    warm(next);
    clearTimeout(wipeTimer);
    slides.forEach(s => s.classList.remove('is-prev', 'wipe-next', 'wipe-prev'));
    prev.classList.remove('is-active');
    prev.classList.add('is-prev');
    incoming.classList.add('is-active');
    if (!reduceMotion) incoming.classList.add(dir < 0 ? 'wipe-prev' : 'wipe-next');
    wipeTimer = setTimeout(() => {
      prev.classList.remove('is-prev');
      incoming.classList.remove('wipe-next', 'wipe-prev');
    }, reduceMotion ? 0 : 1500);

    trItems[cur].classList.remove('is-open', 'is-timing');
    $('.tr-trigger', trItems[cur]).setAttribute('aria-expanded', 'false');
    cur = next;
    trItems[cur].classList.add('is-open');
    $('.tr-trigger', trItems[cur]).setAttribute('aria-expanded', 'true');
    $('#trCur').textContent = pad(cur + 1);

    clearTimeout(ghostTimer);
    ghostWord.classList.add('is-swapping');
    ghostTimer = setTimeout(() => {
      ghostWord.textContent = TOUR[cur].g;
      ghostWord.classList.remove('is-swapping');
    }, reduceMotion ? 0 : 420);

    time();
    setTimeout(() => warm(cur + 1), 1600);
  }
  trList.addEventListener('animationend', e => {
    if (e.animationName === 'tourFill') go(cur + 1, 1);
  });
  trList.addEventListener('click', e => {
    const link = e.target.closest('.tr-go');
    if (link) {
      e.preventDefault();
      const idea = byId[TOUR[+link.dataset.tour].to];
      if (idea) setFilter({ cat: idea.c, room: idea.r, q: '', saved: false });
      toCatalogue();
      return;
    }
    const trg = e.target.closest('.tr-trigger');
    if (!trg) return;
    const i = trItems.indexOf(trg.parentElement);
    go(i, i < cur ? -1 : 1);
  });
  $('#trNext').addEventListener('click', () => go(cur + 1, 1));
  $('#trPrev').addEventListener('click', () => go(cur - 1, -1));
  trPlay.addEventListener('click', () => {
    const paused = trPlay.getAttribute('aria-pressed') !== 'true';
    trPlay.setAttribute('aria-pressed', String(paused));
    trPlay.setAttribute('aria-label', paused ? 'Play tour' : 'Pause tour');
    setHold('user', paused);
  });
  const tourBox = $('#diTour');
  tourBox.addEventListener('pointerenter', () => setHold('hover', true));
  tourBox.addEventListener('pointerleave', () => setHold('hover', false));
  /* keyboard focus pauses the tour; a mouse click on a control does not */
  tourBox.addEventListener('focusin', () => setHold('focus', !!tourBox.querySelector(':focus-visible')));
  tourBox.addEventListener('focusout', e => { if (!tourBox.contains(e.relatedTarget)) setHold('focus', false); });
  new IntersectionObserver(en => setHold('offscreen', !en[0].isIntersecting), { threshold: 0.25 }).observe(hero);
  document.addEventListener('visibilitychange', () => setHold('hidden', document.hidden));
  /* the tour only runs while this page is the one on screen */
  setHold('view', true);

  /* swipe the stage on touch */
  let touchX = null, touchY = null;
  stage.addEventListener('touchstart', e => {
    if (e.target.closest('.di-tour, .di-search, .di-quick')) { touchX = null; return; }
    touchX = e.touches[0].clientX; touchY = e.touches[0].clientY;
  }, { passive: true });
  stage.addEventListener('touchend', e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX, dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) go(cur + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    touchX = touchY = null;
  }, { passive: true });

  /* pointer parallax — rAF-lerped, transform-only */
  if (finePointer && !reduceMotion) {
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const loop = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      slidesBox.style.transform = `translate3d(${(cx * -14).toFixed(2)}px, ${(cy * -9).toFixed(2)}px, 0)`;
      ghost.style.transform     = `translate3d(${(cx * 28).toFixed(2)}px, ${(cy * 14).toFixed(2)}px, 0)`;
      raf = (Math.abs(tx - cx) > 0.0015 || Math.abs(ty - cy) > 0.0015) ? requestAnimationFrame(loop) : 0;
    };
    hero.addEventListener('pointermove', e => {
      const r = stage.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      ty = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { tx = ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
  }

  /* hero search + quick picks hand over to the catalogue */
  const heroQ = $('#heroQ');
  $('#heroSearch').addEventListener('submit', e => {
    e.preventDefault();
    setFilter({ cat: -1, room: '', q: heroQ.value.trim(), saved: false });
    toCatalogue();
  });
  $('#heroQuick').addEventListener('click', e => {
    const b = e.target.closest('button[data-q]');
    if (!b) return;
    heroQ.value = b.dataset.q;
    setFilter({ cat: -1, room: '', q: b.dataset.q, saved: false });
    toCatalogue();
  });
  /* placeholder types a few example searches while idle */
  if (!reduceMotion) {
    const samples = ['sage kitchen', 'pooja unit', 'wardrobe', 'TV unit', 'study corner', 'conference room'];
    const base = heroQ.placeholder;
    let si = 0, ci = 0, del = false, typer = 0;
    const step = () => {
      if (document.activeElement === heroQ || heroQ.value || holds.has('offscreen') || document.hidden) { heroQ.placeholder = base; typer = setTimeout(step, 1200); return; }
      const word = samples[si];
      ci += del ? -1 : 1;
      heroQ.placeholder = 'Try “' + word.slice(0, ci) + '”';
      let wait = del ? 34 : 70;
      if (!del && ci === word.length) { del = true; wait = 1700; }
      else if (del && ci === 0) { del = false; si = (si + 1) % samples.length; wait = 380; }
      typer = setTimeout(step, wait);
    };
    typer = setTimeout(step, 4200);
  }

  /* scroll-linked depth: the stage recedes as the first sheet rises over it */
  const heroCopy = $('#diCopy');
  const rings = $('#diRings');
  const disc = $('#disciplines');
  let depthTicking = false;
  function depth() {
    depthTicking = false;
    if (view.hidden) return;
    const vh = innerHeight, y = scrollY;
    if (y < vh * 1.2) {
      const p = Math.min(1, Math.max(0, y / vh));
      stage.style.transform = `scale(${(1 - p * 0.06).toFixed(4)})`;
      const o = String(Math.max(0, 1 - p * 1.6));
      heroCopy.style.opacity = o;
      tourBox.style.opacity = o;
    }
    const r = disc.getBoundingClientRect();
    if (r.top < vh && r.bottom > 0) rings.style.transform = `translate3d(0, ${(r.top * 0.12).toFixed(1)}px, 0) rotate(${(r.top * 0.01).toFixed(2)}deg)`;
  }
  if (!reduceMotion && DIC_VW() > 918) {
    addEventListener('scroll', () => { if (!depthTicking) { depthTicking = true; requestAnimationFrame(depth); } }, { passive: true });
    depth();
  }

  /* ---------------------------------------------------------
     SCROLL REVEAL
  --------------------------------------------------------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -4% 0px' });
  $$('.rv, [data-io], .stats, .di-disc', view).forEach(el => io.observe(el));
  const bento = $('#diBento');
  new IntersectionObserver((en, obs) => {
    if (!en[0].isIntersecting) return;
    obs.disconnect();
    setTimeout(() => bento.classList.add('is-done'), 1700);     /* stagger done → hovers respond at once */
  }, { threshold: 0.05 }).observe(bento);

  /* ---------------------------------------------------------
     2 — DISCIPLINES + numbers
  --------------------------------------------------------- */
  $('#heroCount').textContent = IDEAS.length;
  $$('.dz', bento).forEach(tile => {
    const c = +tile.dataset.cat;
    const list = IDEAS.filter(it => it.c === c);
    const rooms = ROOMS.filter(r => r.c === c).map(r => r.name);
    $('.js-n', tile).textContent = list.length;
    const show = c === 0 ? 4 : 2;
    $('.js-rooms', tile).textContent = rooms.slice(0, show).join(' · ') + (rooms.length > show ? ' · +' + (rooms.length - show) + ' more' : '');
    tile.setAttribute('aria-label', `${CATS[c]}: ${list.length} ideas`);
    tile.addEventListener('click', () => { setFilter({ cat: c, room: '', q: '', saved: false }); toCatalogue(); });
  });
  settle(bento);

  $('#stIdeas').dataset.to = IDEAS.length;
  $('#stViews').dataset.to = TOTAL_VIEWS;
  $('#stRooms').dataset.to = ROOMS.length;
  $('#stCats').dataset.to  = CATS.length;
  $$('.odo', view).forEach(el => {
    const digits = String(el.dataset.to).split('');
    el.textContent = '';
    digits.forEach((d, k) => {
      const col = document.createElement('span');
      col.className = 'odo-col';
      const strip = document.createElement('span');
      strip.className = 'odo-strip';
      strip.dataset.d = d;
      strip.style.transitionDelay = (k * 0.12 + 0.25) + 's';
      for (let n = 0; n <= 9; n++) { const sp = document.createElement('span'); sp.textContent = n; strip.appendChild(sp); }
      col.setAttribute('aria-hidden', 'true');
      col.appendChild(strip);
      el.appendChild(col);
    });
    const sr = document.createElement('span');   /* the rolling digits are hidden from screen readers; this reads the number */
    sr.className = 'sr'; sr.textContent = el.dataset.to;
    el.appendChild(sr);
  });
  new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();
    $$('.odo-strip', entries[0].target).forEach(st => { st.style.transform = `translateY(-${st.dataset.d}em)`; });
  }, { threshold: 0.4 }).observe($('#diStats'));

  /* ---------------------------------------------------------
     3 — ROOMS MARQUEE
  --------------------------------------------------------- */
  const roomTrack = $('#roomTrack');
  const roomRow = hidden => ROOMS.map(r => `<li${hidden ? ' aria-hidden="true"' : ''}><button class="city" type="button" data-room="${esc(r.name)}"${hidden ? ' tabindex="-1"' : ''}>${esc(r.name)}<span class="city-dot" aria-hidden="true"></span></button></li>`).join('');
  roomTrack.innerHTML = roomRow(false) + roomRow(true);
  roomTrack.addEventListener('click', e => {
    const b = e.target.closest('button[data-room]');
    if (!b) return;
    const room = ROOMS.find(r => r.name === b.dataset.room);
    setFilter({ cat: room.c, room: room.name, q: '', saved: false });
    toCatalogue();
  });

  /* ---------------------------------------------------------
     4 — CATALOGUE
  --------------------------------------------------------- */
  const PAGE = 12;
  const state = { cat: -1, room: '', q: '', saved: false, shown: PAGE };
  let list = IDEAS;
  const grid   = $('#diGrid');
  const catQ   = $('#catQ');
  const rlCats = $('#rlCats');
  const rlRooms = $('#rlRooms');
  const catalogue = $('#design-ideas');

  /* shortlist — kept on this device only */
  const KEY = 'dic:shortlist:v1';
  let saved = new Set();
  try { saved = new Set((JSON.parse(localStorage.getItem(KEY)) || []).filter(id => byId[id])); } catch (err) { saved = new Set(); }
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify([...saved])); } catch (err) { /* private mode: keep it for this visit */ } };

  function compute() {
    const tokens = state.q.toLowerCase().split(/\s+/).filter(Boolean);
    return IDEAS.filter(it =>
      (state.cat < 0 || it.c === state.cat) &&
      (!state.room || it.r === state.room) &&
      (!state.saved || saved.has(it.id)) &&
      tokens.every(t => it._h.includes(t)));
  }
  const HEART = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/></svg>';
  const ARROW = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
  function card(it, i) {
    const n = it.p.length, on = saved.has(it.id);
    const thumbs = it.p.slice(1, 4).map(p => `<span><img src="${IMG(p[0])}" alt="" loading="lazy" decoding="async" width="38" height="38"></span>`).join('');
    return `
    <article class="ic is-enter" style="transition-delay:${Math.min(i, 11) * 55}ms" data-id="${it.id}">
      <div class="ic-media">
        <img class="di-img" src="${IMG(it.p[0][0])}" data-fb="${IMG(IDEAS.find(x => x.c === it.c).p[0][0])}" alt="${esc(it.t)}" loading="lazy" decoding="async" width="720" height="540">
        <span class="ic-shine" aria-hidden="true"></span>
        <span class="ic-badge">${esc(it.s)}</span>
        <span class="ic-views"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="14" rx="3"/><path d="m3.5 16 5-4 4 3 3-2 5 4"/></svg>${n} views</span>
      </div>
      <button class="ic-save" type="button" aria-pressed="${on}" aria-label="${on ? 'Remove' : 'Save'} ${esc(it.t)} ${on ? 'from' : 'to'} your shortlist">${HEART}</button>
      <div class="ic-body">
        <p class="ic-kicker">${esc(CATS[it.c])}<i aria-hidden="true"></i><span>${esc(it.r)}</span></p>
        <h3 class="ic-title"><button class="ic-open" type="button">${esc(it.t)}</button></h3>
        <p class="ic-desc">${esc(it.d)}</p>
        <div class="ic-foot">
          <span class="ic-thumbs" aria-hidden="true">${thumbs}${n > 4 ? `<b>+${n - 4}</b>` : ''}</span>
          <span class="ic-go" aria-hidden="true">Open<i>${ARROW}</i></span>
        </div>
      </div>
    </article>`;
  }
  const PROMO = `
    <article class="ic is-gold is-enter" style="transition-delay:330ms">
      <svg class="ic-mark" viewBox="126 191 420 263" aria-hidden="true"><path d="M220.5 365.5V309.5L330.3 203.1L442.5 308.3M442.5 445V297.4L537 236V451M135 451V328L220.5 365.5M220.5 365.5L280 390V445H220.5ZM324 385V451M442.5 301.8L375.5 338.2V445H442.5"/></svg>
      <p class="ic-kicker">Made to measure</p>
      <h3>Seen something close, <em>but not quite?</em></h3>
      <p>Tell us which idea came nearest. We will redraw it for your room, your storage and your budget.</p>
      <a href="#enquiry">Talk to a designer <i aria-hidden="true">${ARROW}</i></a>
    </article>`;

  function renderRail() {
    rlCats.innerHTML = [-1, ...CATS.keys()].map((c, k) => `
      <button class="rl-cat" type="button" data-cat="${c}" aria-pressed="${state.cat === c}">
        <i>${pad(k)}</i><span>${c < 0 ? 'All ideas' : esc(CATS[c])}</span><b>${c < 0 ? IDEAS.length : IDEAS.filter(it => it.c === c).length}</b>
      </button>`).join('');
    const rooms = ROOMS.filter(r => state.cat < 0 || r.c === state.cat);
    $('#rlRoomCount').textContent = rooms.length;
    rlRooms.innerHTML = `<button class="di-chip" type="button" data-room="" aria-pressed="${!state.room}">All rooms</button>` +
      rooms.map(r => `<button class="di-chip" type="button" data-room="${esc(r.name)}" aria-pressed="${state.room === r.name}">${esc(r.name)}<small>${r.n}</small></button>`).join('');
    $$('#rlTags .di-chip').forEach(b => b.setAttribute('aria-pressed', String(!!state.q && b.dataset.q.toLowerCase() === state.q.toLowerCase())));
    $('#rlSearch').classList.toggle('has-q', !!state.q);
    if (catQ.value.trim() !== state.q) catQ.value = state.q;
    const pressed = $('[aria-pressed="true"]', rlRooms);
    if (pressed && rlRooms.scrollHeight > rlRooms.clientHeight) rlRooms.scrollTop = Math.max(0, pressed.offsetTop - rlRooms.offsetTop - 40);
  }
  function renderBar() {
    $('#pathCat').textContent = state.saved ? 'Your shortlist' : (state.cat < 0 ? 'All ideas' : CATS[state.cat]);
    const pr = $('#pathRoom');
    const tag = state.room || (state.q ? '“' + state.q + '”' : '');
    pr.hidden = !tag;
    pr.textContent = state.room && state.q ? state.room + ' · “' + state.q + '”' : tag;
    const views = list.reduce((a, it) => a + it.p.length, 0);
    $('#catCount').innerHTML = `<b>${list.length}</b> ${list.length === 1 ? 'idea' : 'ideas'} · ${views} views`;
    $('#catReset').hidden = !(state.cat >= 0 || state.room || state.q || state.saved);
    $('#savedToggle').setAttribute('aria-pressed', String(state.saved));
  }
  function renderGrid(append) {
    const from = append ? grid.querySelectorAll('.ic:not(.is-gold)').length : 0;
    const slice = list.slice(from, state.shown);
    let html = slice.map((it, i) => card(it, i)).join('');
    if (!append) {
      if (!list.length) {
        html = state.saved
          ? `<div class="di-empty"><h3>Your shortlist is <em>empty.</em></h3><p>Tap the heart on any idea and it will be kept here, ready to send to a designer.</p><button type="button" data-reset>Browse all ideas</button></div>`
          : `<div class="di-empty"><h3>No ideas match <em>that search.</em></h3><p>Try a broader word such as “kitchen”, “ceiling” or “reception”, or clear the filters to see the whole catalogue.</p><button type="button" data-reset>Show all ideas</button></div>`;
      } else if (list.length > 6 && !state.saved) {
        const parts = slice.map((it, i) => card(it, i));
        parts.splice(5, 0, PROMO);
        html = parts.join('');
      }
      grid.innerHTML = html;
    } else {
      grid.insertAdjacentHTML('beforeend', html);
    }
    settle(grid);
    const fresh = $$('.ic.is-enter', grid);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fresh.forEach(el => el.classList.remove('is-enter'));
      setTimeout(() => fresh.forEach(el => { el.style.transitionDelay = ''; }), 1300);
    }));
    const left = list.length - Math.min(state.shown, list.length);
    $('#diMore').hidden = left <= 0;
    $('#diMoreN').textContent = left > 0 ? '(' + left + ')' : '';
  }
  function setFilter(patch) {
    Object.assign(state, patch);
    if (state.room && !ROOMS.some(r => r.name === state.room && (state.cat < 0 || r.c === state.cat))) state.room = '';
    state.shown = PAGE;
    list = compute();
    renderRail();
    renderBar();
    renderGrid(false);
  }
  function toCatalogue() {
    catalogue.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  rlCats.addEventListener('click', e => {
    const b = e.target.closest('.rl-cat');
    if (b) setFilter({ cat: +b.dataset.cat, room: '', saved: false });
  });
  rlRooms.addEventListener('click', e => {
    const b = e.target.closest('.di-chip');
    if (b) setFilter({ room: b.dataset.room, saved: false });
  });
  $('#rlTags').addEventListener('click', e => {
    const b = e.target.closest('.di-chip');
    if (!b) return;
    const same = state.q.toLowerCase() === b.dataset.q.toLowerCase();
    setFilter({ cat: -1, room: '', q: same ? '' : b.dataset.q, saved: false });
  });
  let qTimer = 0;
  catQ.addEventListener('input', () => {
    clearTimeout(qTimer);
    qTimer = setTimeout(() => setFilter({ q: catQ.value.trim(), saved: false }), 160);
  });
  catQ.addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); });
  $('#catQClear').addEventListener('click', () => { catQ.value = ''; setFilter({ q: '' }); catQ.focus(); });
  const resetAll = () => { heroQ.value = ''; setFilter({ cat: -1, room: '', q: '', saved: false }); };
  $('#catReset').addEventListener('click', resetAll);
  $('#savedToggle').addEventListener('click', () => setFilter({ saved: !state.saved, cat: -1, room: '', q: '' }));
  $('#diMore').addEventListener('click', () => { state.shown += PAGE; renderGrid(true); });

  grid.addEventListener('click', e => {
    if (e.target.closest('[data-reset]')) { resetAll(); return; }
    const art = e.target.closest('.ic[data-id]');
    if (!art) return;
    if (e.target.closest('.ic-save')) { toggleSave(art.dataset.id, true); return; }
    if (e.target.closest('.ic-open')) openIdea(art.dataset.id, 0, $('.ic-open', art));
  });
  /* warm light follows the pointer across a card's photo */
  if (finePointer && !reduceMotion) {
    let shineRaf = 0, shineEv = null;
    grid.addEventListener('pointermove', e => {
      shineEv = e;
      if (shineRaf) return;
      shineRaf = requestAnimationFrame(() => {
        shineRaf = 0;
        const media = shineEv.target.closest && shineEv.target.closest('.ic') && $('.ic-media', shineEv.target.closest('.ic'));
        if (!media) return;
        const r = media.getBoundingClientRect();
        const sh = $('.ic-shine', media);
        sh.style.setProperty('--mx', ((shineEv.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        sh.style.setProperty('--my', ((shineEv.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     SHORTLIST
  --------------------------------------------------------- */
  const toast = $('#diToast');
  let toastTimer = 0;
  function say(text) {
    $('#diToastT').textContent = text;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-on'), 2800);
  }
  toast.addEventListener('click', () => toast.classList.remove('is-on'));
  $('#diToastView').addEventListener('click', e => { e.preventDefault(); setFilter({ saved: true, cat: -1, room: '', q: '' }); toCatalogue(); });

  function syncSaved() {
    const n = saved.size;
    $('#savedN').textContent = n;
    $$('.ic[data-id]', grid).forEach(art => {
      const on = saved.has(art.dataset.id), b = $('.ic-save', art), it = byId[art.dataset.id];
      b.setAttribute('aria-pressed', String(on));
      b.setAttribute('aria-label', `${on ? 'Remove' : 'Save'} ${it.t} ${on ? 'from' : 'to'} your shortlist`);
    });
    const items = [...saved].map(id => byId[id]);
    const box = $('#ctaShort'), field = $('#ideasField');
    if (box) {
      box.hidden = !n;
      box.innerHTML = n ? '<b>Shortlist attached</b>' + items.slice(0, 3).map(it => `<span>${esc(it.t)}</span>`).join('') + (n > 3 ? `<span>+${n - 3} more</span>` : '') : '';
      field.value = items.map(it => it.t).join(' | ');
    }
    if (cv.item) $('#ivSave').setAttribute('aria-pressed', String(saved.has(cv.item.id)));
  }
  function toggleSave(id, announce) {
    const on = !saved.has(id);
    if (on) saved.add(id); else saved.delete(id);
    persist();
    if (state.saved) { list = compute(); renderBar(); renderGrid(false); }
    syncSaved();
    if (announce) say(on ? 'Saved to your shortlist' : 'Removed from your shortlist');
  }

  /* ---------------------------------------------------------
     IDEA VIEWER
  --------------------------------------------------------- */
  const iv = $('#iv');
  const ivA = $('#ivImgA'), ivB = $('#ivImgB');
  const cv = { item: null, k: 0, front: null, token: 0, opener: null, hash: '' };
  const FOCUS = {
    0: 'comfort, storage and everyday movement',
    1: 'productivity, circulation and brand presence',
    2: 'clarity, accessibility, hygiene and patient comfort',
    3: 'merchandising, customer movement and visual hierarchy',
    4: 'arrival, comfort, atmosphere and guest experience',
    5: 'proportion, material durability and architectural detailing'
  };
  function dossier(it, p) {
    const t = (p[1] + ' ' + p[2]).toLowerCase();
    const m = [];
    if (/(quartz|stone|marble|travertine|terrazzo|onyx)/.test(t)) m.push('Stone / mineral finish');
    if (/(wood|walnut|oak|timber|fluted|teak)/.test(t)) m.push('Timber / wood detailing');
    if (/(glass|acrylic|vitrine|glazed)/.test(t)) m.push('Glass / transparent detailing');
    if (/(fabric|velvet|boucl|upholster|soft)/.test(t)) m.push('Soft upholstery');
    if (/(metal|brass|gold|steel)/.test(t)) m.push('Metal accent');
    if (!m.length) m.push('Layered architectural finishes');
    const lit = /(light|lit|lighting|cove|backlit|pendant|daylight|spotlight|chandelier)/.test(t)
      ? 'Lighting is treated as part of the architecture, using focused or indirect illumination to establish depth.'
      : 'The composition relies on material contrast, proportion and clear circulation rather than decorative excess.';
    return {
      read: `${p[1]} is shown as a focused detail within the ${it.r.toLowerCase()} concept. It helps evaluate how the ${it.s.toLowerCase()} approach translates into an actual spatial moment.`,
      elems: m.join(' · '),
      focus: `${lit} Primary design focus: ${FOCUS[it.c]}.`
    };
  }
  function fillTexts() {
    const it = cv.item, p = it.p[cv.k], n = it.p.length, d = dossier(it, p);
    $('#ivCount').textContent = `Reference view ${pad(cv.k + 1)} / ${pad(n)}`;
    $('#ivCapNo').textContent = `Detail ${pad(cv.k + 1)}`;
    $('#ivCapT').textContent = p[1];
    $('#ivCapD').textContent = p[2];
    $('#ivRead').textContent = d.read;
    $('#ivElems').textContent = d.elems;
    $('#ivFocus').textContent = d.focus;
    $$('#ivThumbs .iv-thumb').forEach((b, i) => { if (i === cv.k) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    $$('#ivBars i').forEach((b, i) => b.classList.toggle('is-on', i === cv.k));
  }
  function showPhoto(k, dir, instant) {
    const it = cv.item, n = it.p.length;
    cv.k = (k + n) % n;
    const p = it.p[cv.k];
    const incoming = cv.front === ivA ? ivB : ivA, outgoing = cv.front;
    const token = ++cv.token;
    let done = false;
    iv.classList.add('is-swapping');
    incoming.style.transition = 'none';
    incoming.classList.remove('is-on', 'was-on', 'from-left');
    if (dir < 0) incoming.classList.add('from-left');
    void incoming.offsetWidth;
    incoming.style.transition = instant ? 'none' : '';
    const reveal = () => {
      if (done || token !== cv.token) return;
      done = true;
      if (outgoing) { outgoing.classList.remove('is-on'); outgoing.classList.add('was-on'); }
      incoming.classList.add('is-on');
      cv.front = incoming;
      setTimeout(() => { if (token === cv.token && outgoing) outgoing.classList.remove('was-on'); incoming.style.transition = ''; }, 1150);
      fillTexts();
      requestAnimationFrame(() => requestAnimationFrame(() => { if (token === cv.token) iv.classList.remove('is-swapping'); }));
    };
    incoming.onload = reveal;
    incoming.onerror = () => {
      if (incoming.dataset.tried === p[0]) { reveal(); return; }
      incoming.dataset.tried = p[0];
      incoming.src = IMG(it.p[0][0]);
    };
    incoming.alt = `${it.t} — ${p[1]}`;
    const url = IMG(p[0]);
    if (incoming.getAttribute('src') === url && incoming.complete && incoming.naturalWidth) reveal();
    else incoming.src = url;
    setTimeout(reveal, 2600);                                    /* never leave the stage empty on a slow connection */
    const nx = new Image(); nx.src = IMG(it.p[(cv.k + 1) % n][0]);
  }
  function fillIdea(it, k) {
    cv.item = it;
    const n = it.p.length;
    $('#ivKicker').textContent = `${CATS[it.c]} · ${it.r}`;
    $('#ivTitle').textContent = it.t;
    $('#ivLead').textContent = it.s;
    $('#ivText').textContent = it.d;
    $('#ivFacts').innerHTML = [['Discipline', CATS[it.c]], ['Room', it.r], ['Style', it.s], ['References', n + ' views']]
      .map(f => `<li><b>${f[0]}</b>${esc(f[1])}</li>`).join('');
    $('#ivThumbs').innerHTML = it.p.map((p, i) => `<button class="iv-thumb" type="button" data-k="${i}" aria-label="View ${i + 1}: ${esc(p[1])}"><img src="${IMG(p[0])}" alt="" loading="lazy" decoding="async" width="160" height="120"><b>${pad(i + 1)}</b></button>`).join('');
    $('#ivBars').innerHTML = it.p.map(() => '<i></i>').join('');
    $('#ivSave').setAttribute('aria-pressed', String(saved.has(it.id)));
    $('.pop-body', iv).scrollTop = 0;
    [ivA, ivB].forEach(im => { im.classList.remove('is-on', 'was-on', 'from-left'); });
    cv.front = null;
    showPhoto(k || 0, 1, false);
    try { history.replaceState(null, '', '#idea/' + it.id); } catch (err) { /* file previews may refuse; the viewer still works */ }
  }
  function openIdea(id, k, opener) {
    const it = byId[id];
    if (!it) return;
    if (!iv.open) {
      cv.opener = opener || document.activeElement;
      cv.hash = /^#idea\//.test(location.hash) || !location.hash ? '#/design-ideas' : location.hash;
      iv.classList.remove('is-focus', 'is-closing');
      iv.showModal();
      body.classList.add('pop-open');
      setHold('viewer', true);
    }
    fillIdea(it, k);
  }
  function closeIdea() {
    if (!iv.open) return;
    iv.classList.add('is-closing');
    setTimeout(() => { iv.classList.remove('is-closing'); if (iv.open) iv.close(); }, reduceMotion ? 0 : 260);
  }
  iv.addEventListener('close', () => {
    body.classList.remove('pop-open');
    setHold('viewer', false);
    cv.token++;
    if (!cv.leaving) { try { history.replaceState(null, '', cv.hash || '#/design-ideas'); } catch (err) { /* see above */ } }
    cv.leaving = false;
    if (cv.opener && document.contains(cv.opener)) cv.opener.focus({ preventScroll: true });
  });
  iv.addEventListener('cancel', e => { e.preventDefault(); closeIdea(); });
  iv.addEventListener('click', e => { if (e.target === iv) closeIdea(); });
  $('#ivClose').addEventListener('click', closeIdea);
  $('#ivPrev').addEventListener('click', () => showPhoto(cv.k - 1, -1));
  $('#ivNext').addEventListener('click', () => showPhoto(cv.k + 1, 1));
  $('#ivThumbs').addEventListener('click', e => {
    const b = e.target.closest('.iv-thumb');
    if (b && +b.dataset.k !== cv.k) showPhoto(+b.dataset.k, +b.dataset.k < cv.k ? -1 : 1);
  });
  $('#ivZoom').addEventListener('click', () => {
    const on = iv.classList.toggle('is-focus');
    $('#ivZoom').setAttribute('aria-pressed', String(on));
    $('#ivZoom').setAttribute('aria-label', on ? 'Show the design notes' : 'Show the photograph full size');
  });
  $('#ivSave').addEventListener('click', () => toggleSave(cv.item.id, false));
  const stepIdea = d => {
    const pool = list.includes(cv.item) ? list : IDEAS;
    const i = pool.indexOf(cv.item);
    fillIdea(pool[(i + d + pool.length) % pool.length], 0);
  };
  $('#ivPrevIdea').addEventListener('click', () => stepIdea(-1));
  $('#ivNextIdea').addEventListener('click', () => stepIdea(1));
  iv.addEventListener('keydown', e => {
    if (e.target.closest('input, select, textarea')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); showPhoto(cv.k + 1, 1); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); showPhoto(cv.k - 1, -1); }
  });
  let ivX = null, ivY = null;
  const ivMedia = $('#ivMedia');
  ivMedia.addEventListener('touchstart', e => { ivX = e.touches[0].clientX; ivY = e.touches[0].clientY; }, { passive: true });
  ivMedia.addEventListener('touchend', e => {
    if (ivX === null) return;
    const dx = e.changedTouches[0].clientX - ivX, dy = e.changedTouches[0].clientY - ivY;
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.4) showPhoto(cv.k + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    ivX = ivY = null;
  }, { passive: true });

  /* "Get this design": shortlist it, pre-select the enquiry type, go to the form */
  const form = $('#enquiry');
  function toEnquiry() {
    form.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    setTimeout(() => $('input', form).focus({ preventScroll: true }), reduceMotion ? 0 : 650);
  }
  $('#ivCta').addEventListener('click', e => {
    e.preventDefault();
    const it = cv.item;
    if (!saved.has(it.id)) toggleSave(it.id, false);
    const sel = form.elements.space;
    const want = it.c === 1 ? 'Modular Kitchens' : /Wardrobe/.test(it.r) ? 'Wardrobes & Storage' : it.c === 4 ? 'Commercial Interiors' : 'Turnkey Home Interiors';
    Array.from(sel.options).forEach(o => { if (o.textContent.trim() === want) sel.value = o.value; });
    closeIdea();
    setTimeout(toEnquiry, reduceMotion ? 0 : 300);
  });
  grid.addEventListener('click', e => { if (e.target.closest('.is-gold a')) { e.preventDefault(); toEnquiry(); } });

  /* ---------------------------------------------------------
     PAGE API — called by the site router
     #/design-ideas        the page
     #ideas-<room>         the catalogue, filtered to a room (Design Ideas menu)
     #ideas-<discipline>   the catalogue, filtered to a discipline
     #idea/<id>            one idea, opened in the viewer
  --------------------------------------------------------- */
  const catBySlug = Object.create(null);
  CATS.forEach((c, i) => { catBySlug[slug(c)] = i; });
  function parse(hash) {
    let h = hash || '';
    try { h = decodeURIComponent(h); } catch (err) { /* keep raw */ }
    if (h.indexOf('#idea/') === 0) { const it = byId[h.slice(6)]; return it ? { idea: it } : null; }
    if (h.indexOf('#ideas-') === 0) {
      const key = h.slice(7);
      const room = ROOMS.find(r => r.name === (ROOM_ALIAS[key] || roomBySlug[key]));
      if (room) return { room };
      if (key in catBySlug) return { cat: catBySlug[key] };
    }
    return null;
  }
  function steer(hash, smooth) {
    const p = parse(hash);
    if (!p) return null;
    if (p.idea) setFilter({ cat: p.idea.c, room: p.idea.r, q: '', saved: false });
    else if (p.room) setFilter({ cat: p.room.c, room: p.room.name, q: '', saved: false });
    else setFilter({ cat: p.cat, room: '', q: '', saved: false });
    if (!p.idea) catalogue.scrollIntoView({ behavior: smooth && !reduceMotion ? 'smooth' : 'auto', block: 'start' });
    return p;
  }
  /* wait for the logo entry if the site opened straight on this page */
  const afterIntro = fn => { if (window.__plDone || !document.getElementById('pl')) fn(); else addEventListener('pl:done', fn, { once: true }); };
  let showToken = 0;
  window.DIC_IDEAS = {
    show(hash) {
      const token = ++showToken;
      view.classList.remove('di-on');
      warm(0);
      const p = steer(hash, false);
      settle(view);
      afterIntro(() => {
        if (token !== showToken || view.hidden) return;
        requestAnimationFrame(() => requestAnimationFrame(() => view.classList.add('di-on')));
        if (p && p.idea) openIdea(p.idea.id, 0, null);
        setTimeout(() => { if (token === showToken && !view.hidden) { setHold('view', false); time(); warm(1); } }, reduceMotion ? 0 : 1400);
      });
    },
    go(hash) {
      if (iv.open) return;
      const p = steer(hash, true);
      if (p && p.idea) openIdea(p.idea.id, 0, null);
      else if (!p) scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    },
    hide() {
      showToken++;
      setHold('view', true);
      view.classList.remove('di-on');
      if (iv.open) { cv.leaving = true; iv.close(); }
    }
  };
  /* a menu link to the room already in the address bar would not fire a hash change */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#ideas-"]');
    if (a && !view.hidden && location.hash === a.getAttribute('href')) { e.preventDefault(); window.DIC_IDEAS.go(location.hash); }
  });

  /* the shortlist travels with the enquiry (the form itself is handled by the main script) */
  $('.cta-send', form).insertAdjacentHTML('beforebegin', '<div class="cta-short" id="ctaShort" hidden></div><input type="hidden" name="ideas" id="ideasField">');


  /* ---------------------------------------------------------
     4 — FIND YOUR STYLE
  --------------------------------------------------------- */
  const SF_STYLES = [["Warm", "Minimal.", "Pale oak, soft linen and warm white walls. Quiet rooms with nothing extra, lit low and kind.", [["Oat linen", "#E8DDCB"], ["Pale oak", "#C9A97C"], ["Warm white", "#F4EFE6"], ["Clay", "#B98A6A"], ["Smoked walnut", "#5B4636"]], ["Oak veneer", "Linen", "Lime plaster", "Brushed brass"], ["oak", "wood", "warm", "linen", "walnut", "storage"]], ["Soft", "Contemporary.", "Honed stone, rounded edges and layered neutrals that feel calm the moment you walk in.", [["Travertine", "#D9CBB3"], ["Mushroom", "#A89886"], ["Chalk", "#EFEBE4"], ["Taupe", "#8C7B6B"], ["Graphite", "#3D3936"]], ["Travertine", "Bouclé", "Microcement", "Smoked glass"], ["marble", "stone", "quartz", "onyx", "seamless"]], ["Quiet", "Luxe.", "Tone-on-tone luxury: velvet, satin brass and soft cove light. Rich, without ever being loud.", [["Champagne", "#E6D3AE"], ["Satin brass", "#B8925A"], ["Ivory", "#F3EDE1"], ["Mink", "#8E7765"], ["Espresso", "#3B2E26"]], ["Velvet", "Satin brass", "Walnut", "Silk-finish paint"], ["brass", "velvet", "cove", "upholstered", "luxury"]], ["Japandi", "Stillness.", "Japanese restraint meets Scandinavian warmth: low furniture, paper light and honest timber.", [["Rice paper", "#EFE9DD"], ["Ash", "#CDBFA6"], ["Sage stone", "#A5A58D"], ["Charcoal", "#45433F"], ["Ink", "#22211F"]], ["Ash timber", "Paper shades", "Jute", "Matte ceramic"], ["low", "timber", "acoustic", "minimal", "wood"]], ["Mid-century", "Modern.", "Tapered legs, walnut panelling and confident colour from the golden age of design.", [["Walnut", "#6B4A33"], ["Mustard", "#C99A2E"], ["Teal", "#2F6763"], ["Cream", "#EDE3CF"], ["Rust", "#A4532F"]], ["Walnut veneer", "Wool", "Terrazzo", "Brass"], ["walnut", "fluted", "louver", "wood", "media"]], ["Modern", "Classic.", "Book-matched marble, crisp mouldings and deep tones for rooms that make a statement.", [["Calacatta", "#EEEAE3"], ["Nero marble", "#1F1E1D"], ["Burgundy", "#6D2A2A"], ["Gold vein", "#C1A06A"], ["Dove grey", "#B9B4AC"]], ["Book-matched marble", "Lacquer", "Moulded panels", "Polished brass"], ["marble", "backdrop", "boardroom", "console", "stone"]], ["Art Deco", "Luxe.", "Geometry, fluting and polished brass, with emerald and onyx tones that glow after dark.", [["Emerald", "#1F4D3F"], ["Polished brass", "#C9A04C"], ["Onyx", "#161514"], ["Blush", "#D9A99A"], ["Ivory", "#F1E9DA"]], ["Fluted panels", "Polished brass", "Velvet", "Onyx"], ["brass", "fluted", "onyx", "bar", "lounge"]], ["Industrial", "Edge.", "Concrete, blackened steel and warm leather, with exposed lines and loft-scale lighting.", [["Concrete", "#9A968F"], ["Black steel", "#262626"], ["Cognac", "#8A5530"], ["Brick", "#9D5B45"], ["Smoke", "#CFCBC4"]], ["Microcement", "Black steel", "Leather", "Reclaimed wood"], ["steel", "track", "workstation", "raceway", "acoustic"]], ["Scandi", "Light.", "Bleached wood, white walls and soft textiles that bounce daylight into every corner.", [["Snow", "#F5F3EE"], ["Birch", "#DCC9A8"], ["Mist blue", "#B9C6CC"], ["Oat", "#E2D7C3"], ["Slate", "#5E6468"]], ["Birch ply", "Wool", "White oak", "Linen"], ["study", "kids", "white", "light", "bookshelves"]], ["Coastal", "Calm.", "Sand-washed stone, sea-glass blues and breezy linen for rooms that breathe.", [["Sand", "#E3D6BF"], ["Sea glass", "#A9C2BE"], ["Shell", "#F4EFE7"], ["Driftwood", "#9E8A73"], ["Deep sea", "#2F4B55"]], ["Limestone", "Rattan", "Linen", "Terrazzo"], ["balcony", "deck", "living", "vanities", "biophilic"]], ["Parisian", "Light.", "Tall mouldings, herringbone floors and slim brass details in a light-filled palette.", [["Porcelain", "#F2EEE8"], ["Powder rose", "#E3C3BA"], ["Antique brass", "#B08D57"], ["Herringbone oak", "#C3A27A"], ["French grey", "#8E8C88"]], ["Herringbone oak", "Wall mouldings", "Antique brass", "Cane"], ["dining", "brass", "headboard", "mirror", "console"]], ["Pure", "Minimal.", "Seamless surfaces, hidden storage and one strong line of light. Everything else is space.", [["Pure white", "#F7F6F3"], ["Fog", "#DAD8D3"], ["Stone grey", "#A9A6A0"], ["Graphite", "#4A4946"], ["Black", "#1B1B1A"]], ["Matte lacquer", "Corian", "Microcement", "Concealed light"], ["seamless", "corian", "concealed", "hidden", "linear"]], ["Chettinad", "Revival.", "Burma teak, Athangudi-inspired tiles and carved doorways: Tamil Nadu craft for modern living.", [["Burma teak", "#7A4B2A"], ["Athangudi red", "#A63C2F"], ["Ochre", "#C98E2F"], ["Lime white", "#EFE7D8"], ["Temple green", "#3F5B45"]], ["Burma teak", "Athangudi tiles", "Brass", "Lime plaster"], ["teak", "pooja", "carved", "vastu", "wood"]], ["Indian", "Contemporary.", "Kota stone, handloom texture and jaali light patterns, rooted in craft and drawn clean.", [["Kota stone", "#8E8F7E"], ["Terracotta", "#B4683F"], ["Indigo", "#2E3F63"], ["Handloom", "#EDE3D0"], ["Turmeric", "#D19A2C"]], ["Kota stone", "Jaali screens", "Handloom", "Terracotta"], ["jaali", "screen", "stone", "onyx", "carved"]], ["Royal", "Heritage.", "Jewel tones, brass bells and backlit onyx: celebration spaces with a sense of occasion.", [["Maroon", "#5E1F24"], ["Antique gold", "#B8913F"], ["Jade", "#3E6B5A"], ["Ivory silk", "#F0E6D2"], ["Rosewood", "#4A2C24"]], ["Brass inlay", "Rosewood", "Silk", "Backlit onyx"], ["banquet", "brass", "chandelier", "onyx", "pooja"]], ["Modern", "Vernacular.", "Earth plaster, cane and stone floors: the calm logic of traditional homes, simplified.", [["Earth plaster", "#C9B49A"], ["Cane", "#D8BE8B"], ["Mud brown", "#7B5E46"], ["Lime", "#EDE6D8"], ["Kadappa", "#2B2B29"]], ["Lime plaster", "Cane", "Kadappa stone", "Clay tile"], ["utility", "decking", "natural", "wood", "living"]]];
  const SF_SPACE_CAT = [0, 1, 2, 3, 4];
  const sfQuiz = $('#sfQuiz'), sfCard = $('#sfCard');
  let sfKey = '', sfTimer = 0;
  function sfPick() {
    const v = n => +(sfQuiz.elements[n].value || 0);
    const space = v('sfSpace'), feel = v('sfFeel'), fin = v('sfFin');
    return { space, idx: feel * 4 + fin };
  }
  function sfMatches(cat, words) {
    return IDEAS.filter(it => it.c === cat)
      .map(it => ({ it, s: words.reduce((a, w) => a + (it._h.indexOf(w) >= 0 ? 1 : 0), 0) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 3).map(x => x.it);
  }
  function sfPaint(p) {
    const st = SF_STYLES[p.idx], cat = SF_SPACE_CAT[p.space];
    $('#sfCode').textContent = pad(p.idx + 1) + ' / ' + SF_STYLES.length;
    $('#sfName').textContent = st[0];
    $('#sfName2').textContent = st[1];
    $('#sfDesc').textContent = st[2];
    $('#sfPal').innerHTML = st[3].map((c, i) => `<li class="sw" style="--c:${c[1]};--i:${i}"><i></i><b>${esc(c[0])}</b><small>${c[1]}</small></li>`).join('');
    $('#sfMat').innerHTML = st[4].map(m => `<li>${esc(m)}</li>`).join('');
    $('#sfThumbs').innerHTML = sfMatches(cat, st[5]).map((it, i) => `
      <button class="sf-th" type="button" data-id="${it.id}" style="--i:${i}">
        <span><img class="di-img" src="${IMG(it.p[0][0])}" alt="" loading="lazy" decoding="async" width="480" height="360"></span>
        <b>${esc(it.t)}</b>
      </button>`).join('');
    settle($('#sfThumbs'));
    $('#sfMoreT').textContent = CATS[cat];
    $('#sfCtaT').textContent = 'Talk to a designer about ' + st[0] + ' ' + st[1].replace('.', '');
  }
  function sfUpdate(first) {
    const p = sfPick(), key = p.space + '-' + p.idx;
    if (key === sfKey) return;
    sfKey = key;
    if (first || reduceMotion) { sfPaint(p); return; }
    clearTimeout(sfTimer);
    sfCard.classList.add('is-out');
    sfTimer = setTimeout(() => {
      sfPaint(p);
      sfCard.classList.remove('is-out');
      sfCard.classList.add('is-pre');
      void sfCard.offsetWidth;
      sfCard.classList.remove('is-pre');
    }, 380);
  }
  sfQuiz.addEventListener('change', () => sfUpdate(false));
  sfQuiz.addEventListener('submit', e => e.preventDefault());
  $('#sfThumbs').addEventListener('click', e => {
    const b = e.target.closest('.sf-th');
    if (b) openIdea(b.dataset.id, 0, b);
  });
  $('#sfMore').addEventListener('click', () => {
    setFilter({ cat: SF_SPACE_CAT[sfPick().space], room: '', q: '', saved: false });
    toCatalogue();
  });
  /* the chosen direction travels with the enquiry */
  $('.cta-send', form).insertAdjacentHTML('beforebegin', '<p class="cta-style" id="ctaStyle" hidden>Style direction <span></span></p><input type="hidden" name="style" id="styleField">');
  $('#sfCta').addEventListener('click', e => {
    e.preventDefault();
    const p = sfPick(), st = SF_STYLES[p.idx], name = st[0] + ' ' + st[1].replace('.', '');
    $('#styleField').value = name;
    $('#ctaStyle span').textContent = name;
    $('#ctaStyle').hidden = false;
    const want = p.space === 4 ? 'Commercial Interiors' : p.space === 1 ? 'Modular Kitchens' : 'Turnkey Home Interiors';
    Array.from(form.elements.space.options).forEach(o => { if (o.textContent.trim() === want) form.elements.space.value = o.value; });
    toEnquiry();
  });
  sfUpdate(true);

  /* ---------------------------------------------------------
     FIRST PAINT
  --------------------------------------------------------- */
  list = compute();
  renderRail();
  renderBar();
  renderGrid(false);
  syncSaved();
})();
