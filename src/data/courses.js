// src/data/courses.js

export const COURSES = [
  {
    id: "mynediad",
    title: { en: "Mynediad (Entry Level)", cy: "Mynediad (Lefel Mynediad)" },
    description: { en: "Complete beginners. Foundations of language.", cy: "Dechreuwyr pur. Sylfeini'r iaith." },
    units: [
      // BLOCK 1: Units 1–8
      { id: "m-u1", section: "block1", title: { en: "Unit 1: Helô, sut dych chi?", cy: "Uned 1: Helô, sut dych chi?" }, criteria: { sourceScope: ["mynediad-master.csv"], unit: "1" } },
      { id: "m-u2", section: "block1", title: { en: "Unit 2: Wyt ti’n hoffi coffi?", cy: "Uned 2: Wyt ti’n hoffi coffi?" }, criteria: { sourceScope: ["mynediad-master.csv"], unit: "2" } },
      { id: "m-u3", section: "block1", title: { en: "Unit 3: Dych chi eisiau paned?", cy: "Uned 3: Dych chi eisiau paned?" }, criteria: { sourceScope: ["mynediad-master.csv"], unit: "3" } },
      { id: "m-u4", section: "block1", title: { en: "Unit 4: Mynd a dod (Soft Mut)", cy: "Uned 4: Mynd a dod" }, criteria: { sourceScope: ["mynediad-master.csv"], unit: "4" } },
      { id: "m-u5", section: "block1", title: { en: "Unit 5: Beth wnest ti ddoe?", cy: "Uned 5: Beth wnest ti ddoe?" }, criteria: { sourceScope: ["mynediad-master.csv"], unit: "5" } },
      { id: "m-u6", section: "block1", title: { en: "Unit 6: Sut mae’r tywydd?", cy: "Uned 6: Sut mae’r tywydd?" }, criteria: { sourceScope: ["mynediad-master.csv"], unit: "6" } },
      { id: "m-u7", section: "block1", title: { en: "Unit 7: Ydy hi’n gweithio?", cy: "Uned 7: Ydy hi’n gweithio?" }, criteria: { sourceScope: ["mynediad-master.csv"], unit: "7" } },
      { id: "m-u8", section: "block1", title: { en: "Unit 8: Adolygu ac ymestyn", cy: "Uned 8: Adolygu ac ymestyn" }, criteria: { sourceScope: ["mynediad-master.csv"], unit: "8" } },
      { 
        id: "m-r1", 
        section: "block1", 
        isCumulative: true, 
        title: { en: "Review Units 1–8", cy: "Adolygu Unedau 1–8" }, 
        criteria: { 
          sourceScope: ["mynediad-master.csv"], 
          unit: ["1","2","3","4","5","6","7","8"] 
        } 
      },

      // BLOCK 2: Units 9–15
      { id: "m-u9", section: "block2", title: { en: "Unit 9: Prynon ni fara", cy: "Uned 9: Prynon ni fara" }, criteria: { sourceScope: ["mynediad-master.csv"], unit: "9" } },
      { id: "m-u10", section: "block2", title: { en: "Unit 10: Es i i’r dre", cy: "Uned 10: Es i i’r dre" }, criteria: { sourceScope: ["mynediad-master.csv"], unit: "10" } },
      { id: "m-u11", section: "block2", title: { en: "Unit 11: Ces i dost i frecwast", cy: "Uned 11: Ces i dost i frecwast" }, criteria: { sourceScope: ["mynediad-master.csv"], unit: "11" } },
      { id: "m-u12", section: "block2", title: { en: "Unit 12: Mae car gyda fi", cy: "Uned 12: Mae car gyda fi" }, criteria: { sourceScope: ["mynediad-master.csv"], unit: "12" } },
      { id: "m-u13", section: "block2", title: { en: "Unit 13: Roedd hi’n braf", cy: "Uned 13: Roedd hi’n braf" }, criteria: { sourceScope: ["mynediad-master.csv"], unit: "13" } },
      { id: "m-u14", section: "block2", title: { en: "Unit 14: Ble ro’ch chi’n byw... (Nasal)", cy: "Uned 14: Ble ro’ch chi’n byw..." }, criteria: { sourceScope: ["mynediad-master.csv"], unit: "14" } },
      { id: "m-u15", section: "block2", title: { en: "Unit 15: Adolygu ac Ymestyn", cy: "Uned 15: Adolygu ac Ymestyn" }, criteria: { sourceScope: ["mynediad-master.csv"], unit: "15" } },
      { 
        id: "m-r2", 
        section: "block2", 
        isCumulative: true, 
        title: { en: "Review Units 1–15", cy: "Adolygu Unedau 1–15" }, 
        criteria: { 
          sourceScope: ["mynediad-master.csv"], 
          unit: ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15"] 
        } 
      },

      // BLOCK 3: Units 16–28
      { id: "m-u16", section: "block3", title: { en: "Unit 16: Rhifau, Amser ac Arian", cy: "Uned 16: Rhifau, Amser ac Arian" }, criteria: { sourceScope: ["mynediad-master.csv"], unit: "16" } },
      { id: "m-u17", section: "block3", title: { en: "Unit 17: Bydd hi’n braf yfory", cy: "Uned 17: Bydd hi’n braf yfory" }, criteria: { sourceScope: ["mynediad-master.csv"], unit: "17" } },
      { id: "m-u18", section: "block3", title: { en: "Unit 18: Bydda i’n mynd", cy: "Uned 18: Bydda i’n mynd" }, criteria: { sourceScope: ["mynediad-master.csv"], unit: "18" } },
      { id: "m-u19", section: "block3", title: { en: "Unit 19: Fy (Possessives)", cy: "Uned 19: Fy" }, criteria: { sourceScope: ["mynediad-master.csv"], unit: "19" } },
      { id: "m-u20", section: "block3", title: { en: "Unit 20: Dy/Eich", cy: "Uned 20: Dy/Eich" }, criteria: { sourceScope: ["mynediad-master.csv"], unit: "20" } },
      { id: "m-u21", section: "block3", title: { en: "Unit 21: Dewch yma! (Imperatives)", cy: "Uned 21: Dewch yma!" }, criteria: { sourceScope: ["mynediad-master.csv"], unit: "21" } },
      { id: "m-u22", section: "block3", title: { en: "Unit 22: Yn y gwaith", cy: "Uned 22: Yn y gwaith" }, criteria: { sourceScope: ["mynediad-master.csv"], unit: "22" } },
      { id: "m-u23", section: "block3", title: { en: "Unit 23: Rhaid i fi", cy: "Uned 23: Rhaid i fi" }, criteria: { sourceScope: ["mynediad-master.csv"], unit: "23" } },
      { id: "m-u24", section: "block3", title: { en: "Unit 24: Cyn ac ar ôl", cy: "Uned 24: Cyn ac ar ôl" }, criteria: { sourceScope: ["mynediad-master.csv"], unit: "24" } },
      { id: "m-u25", section: "block3", title: { en: "Unit 25: Mae bwyd yn y caffi", cy: "Uned 25: Mae bwyd yn y caffi" }, criteria: { sourceScope: ["mynediad-master.csv"], unit: "25" } },
      { id: "m-u26", section: "block3", title: { en: "Unit 26: Ei/Ein/Eu", cy: "Uned 26: Ei/Ein/Eu" }, criteria: { sourceScope: ["mynediad-master.csv"], unit: "26" } },
      { id: "m-u27", section: "block3", title: { en: "Unit 27: Pobl y Cwm", cy: "Uned 27: Pobl y Cwm" }, criteria: { sourceScope: ["mynediad-master.csv"], unit: "27" } },
      { id: "m-u28", section: "block3", title: { en: "Unit 28: Adolygu ac edrych ymlaen", cy: "Uned 28: Adolygu ac edrych ymlaen" }, criteria: { sourceScope: ["mynediad-master.csv"], unit: "28" } },
      { 
        id: "m-r3", 
        section: "block3", 
        isCumulative: true, 
        title: { en: "Review Units 1–28", cy: "Adolygu Unedau 1–28" }, 
        criteria: { 
          sourceScope: ["mynediad-master.csv"], 
          unit: ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28"] 
        } 
      }
    ]

  },
  {
    id: "sylfaen",
    title: { en: "Sylfaen (Foundation)", cy: "Sylfaen" },
    description: { en: "Building confidence. Past tense & prepositions.", cy: "Magu hyder. Amser gorffennol ac arddodiaid." },
    units: [
      {
        id: "s-u1",
        title: { en: "Unit 1: The Article", cy: "Uned 1: Y Fannod" },
        criteria: {
          category: "Article"
        }
      }
    ]
  }
];
