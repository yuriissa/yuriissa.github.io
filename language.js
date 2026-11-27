/* Yuri Issa bilingual text layer — preserves the original layout. */
(function(){
  const path = location.pathname.split("/").pop() || "index.html";
  const page = path === "projects.html" ? "projects" : path === "designs.html" ? "designs" : path === "articles.html" ? "articles" : "index";
  const navArabic = ["الرئيسية","المشاريع","الأرشيف","المعرض","تواصل"];
  const translations = {
    index: {
      ".eyebrow":"مرحبًا بكم في موقع يوري عيسى",
      ".hero-copy p":"مساحة شخصية للأفكار والإبداع والتكنولوجيا والمشروعات.",
      ".hero-copy .glow-btn":"اكتشف المزيد",
      ".section-heading h2":"استكشف عالمي",
      ".section-heading .view-all":"عرض الكل",
      ".feature:nth-child(1) h3":"نبذة عني",
      ".feature:nth-child(1) p":"قصتي وخلفيتي.",
      ".feature:nth-child(2) h3":"المشاريع",
      ".feature:nth-child(2) p":"أعمالي وإبداعاتي.",
      ".feature:nth-child(3) h3":"الأرشيف",
      ".feature:nth-child(3) p":"صور وذكريات ولحظات بصرية.",
      ".feature:nth-child(4) h3":"المعرض",
      ".feature:nth-child(4) p":"الصور والمحتوى المرئي.",
      ".values .value:nth-child(1) > span:last-child":{html:"الأمان<br>والثقة"},
      ".values .value:nth-child(2) > span:last-child":{html:"الابتكار<br>والإبداع"},
      ".values .value:nth-child(3) > span:last-child":{html:"التكنولوجيا<br>والتقدم"},
      ".values .value:nth-child(4) > span:last-child":{html:"المعرفة<br>والمشاركة"},
      "#about .kicker":"01 / نبذة عني",
      "#about h2":"لمحة عني",
      "#about > p":"الفضول هو ما يقود الطريق. هذه مساحتي الشخصية لأعرّف بنفسي، وأجمع ما أبدعه، وأشارك الأفكار والتجارب التي ترسم رحلتي.",
      "#projects .kicker":"02 / المشاريع",
      "#projects h2":"المشاريع والإبداعات",
      "#projects > p":"مجموعة من المشاريع والأعمال الإبداعية.",
      "#projects .info-card:nth-child(1) h3":"مشاريعي الشخصية",
      "#projects .info-card:nth-child(1) p":"مجموعة من المشاريع الشخصية والأعمال الإبداعية.",
      "#projects .info-card:nth-child(1) a":"عرض المشاريع",
      "#projects .info-card:nth-child(2) h3":"تصميماتي",
      "#projects .info-card:nth-child(2) p":"إبداعات بصرية وتصميمات وأفكار فنية.",
      "#projects .info-card:nth-child(2) a":"عرض التصميمات",
      "#projects .info-card:nth-child(3) h3":"مقالات وأفكار",
      "#projects .info-card:nth-child(3) p":"أفكار ومعارف وموضوعات تستحق المشاركة.",
      "#projects .info-card:nth-child(3) a":"عرض المقالات",
      "#archive .kicker":"03 / الأرشيف",
      "#archive h2":"أرشيفي البصري",
      "#archive > p":"مجموعة من الصور والذكريات واللحظات البصرية التي تستحق الاحتفاظ بها.",
      "#gallery .kicker":"04 / المعرض",
      "#gallery h2":"المعرض",
      "#gallery > p":"مجموعة مستقبلية من الصور والتصميمات والذكريات البصرية.",
      "#contact .kicker":"05 / التواصل",
      "#contact h2":"لنتواصل",
      "#contact > p":"كل فكرة تبدأ من مكان ما. شكرًا لزيارتك موقع يوري عيسى.",
      ".contact-links .contact-link:nth-child(1)":"فيسبوك",
      ".contact-links .contact-link:nth-child(2)":"واتساب",
      ".contact-links .contact-link:nth-child(3)":"تيليغرام",
      ".contact-links .contact-link:nth-child(4)":"وي تشات"
    },
    projects: {
      ".page-intro .kicker":"02 / المشاريع",
      ".page-intro h1":"مشاريعي الشخصية",
      ".page-intro p":"مجموعة من المشاريع الرقمية والأدوات العملية والتجارب الإبداعية.",
      ".page-content .info-card h3":"WorkTime",
      ".page-content .info-card p":"مشروع لتسجيل ساعات العمل والساعات الإضافية، صُمم لتسهيل إدارة سجلات الوقت.",
      ".page-content .info-card a":"عرض المشروع",
      ".page-note":"ستُضاف المزيد من المشاريع والتجارب إلى هذه المجموعة بمرور الوقت."
    },
    designs: {
      ".page-intro .kicker":"03 / التصميمات",
      ".page-intro h1":"تصميماتي",
      ".page-intro p":"إبداعات بصرية وتصميمات وشعارات وواجهات وأفكار فنية.",
      ".page-note":"يجري إعداد هذا القسم. ستظهر هنا التصميمات والأعمال المرئية عند إضافتها."
    },
    articles: {
      ".page-intro .kicker":"04 / المقالات",
      ".page-intro h1":"مقالات وأفكار",
      ".page-intro p":"أفكار ومعارف واكتشافات مفيدة وموضوعات تستحق المشاركة.",
      ".page-note":"ستتوسع مجموعة القراءة تدريجيًا، مع عرض كل مقال في صفحة قراءة مستقلة."
    }
  };
  const map = translations[page] || {};
  const original = new Map();
  const selectors = new Set([...Object.keys(map),".nav-label",".lang-current",".hero h1",".site-footer > div:first-child"]);
  selectors.forEach(sel=>document.querySelectorAll(sel).forEach((el,i)=>original.set(el,el.innerHTML)));
  const setLeading=(el,value)=>{
    const node=[...el.childNodes].find(n=>n.nodeType===Node.TEXT_NODE);
    if(node) node.textContent=value+" ";
  };
  function apply(lang){
    original.forEach((html,el)=>{el.innerHTML=html;el.classList.remove("arabic-copy");el.removeAttribute("dir");});
    const arabic=lang==="ar";
    document.documentElement.lang=arabic?"ar":"en";
    document.querySelectorAll(".nav-label").forEach((el,i)=>{if(arabic)el.textContent=navArabic[i];});
    const current=document.querySelector(".lang-current");
    if(current)current.textContent=arabic?"AR":"EN";
    if(arabic){
      Object.entries(map).forEach(([sel,value])=>{
        document.querySelectorAll(sel).forEach(el=>{
          if(value && typeof value==="object" && value.html!==undefined)el.innerHTML=value.html;
          else if(sel===".hero-copy .glow-btn" || sel===".section-heading .view-all" || sel.includes(".contact-link") || sel.includes(" a")) {
            const node=[...el.childNodes].find(n=>n.nodeType===Node.TEXT_NODE && n.textContent.trim());
            if(node)node.textContent=" "+value+" ";
            else el.textContent=value;
          } else el.textContent=value;
          if(!sel.includes(".glow-btn") && !sel.includes(".view-all") && !sel.includes(".contact-link"))el.classList.add("arabic-copy");
        });
      });
      if(page==="index"){
        const h=document.querySelector(".hero h1");
        if(h)setLeading(h,"مرحبًا، أنا");
      }
      const foot=document.querySelector(".site-footer > div:first-child");
      if(foot){
        const nodes=[...foot.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE);
        if(nodes.length)nodes[nodes.length-1].textContent=" © 2026 · جميع الحقوق محفوظة";
      }
    }
    document.querySelectorAll(".language-menu button").forEach(btn=>btn.setAttribute("aria-pressed",String(btn.dataset.language===lang)));
    const toggle=document.querySelector(".lang");
    if(toggle)toggle.setAttribute("aria-expanded","false");
    const menu=document.querySelector(".language-menu");
    if(menu)menu.hidden=true;
  }
  let saved="en";
  try{saved=localStorage.getItem("yuri-issa-language")||"en";}catch(e){}
  apply(saved==="ar"?"ar":"en");
  const toggle=document.querySelector(".lang");
  const menu=document.querySelector(".language-menu");
  if(toggle && menu){
    toggle.addEventListener("click",()=>{
      menu.hidden=!menu.hidden;
      toggle.setAttribute("aria-expanded",String(!menu.hidden));
    });
    menu.querySelectorAll("[data-language]").forEach(btn=>btn.addEventListener("click",()=>{
      const lang=btn.dataset.language;
      try{localStorage.setItem("yuri-issa-language",lang);}catch(e){}
      apply(lang);
    }));
    document.addEventListener("click",event=>{
      if(!event.target.closest(".lang-wrap")){
        menu.hidden=true;
        toggle.setAttribute("aria-expanded","false");
      }
    });
  }
})();