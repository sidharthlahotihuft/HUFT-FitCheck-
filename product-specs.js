/* HUFT product spec charts — back length / chest girth / neck, per product, per size.
   Read directly from the size-chart image on each product slide in the PD/collection decks.
   These are finished-garment measurements, NOT the dog's measurements.

   verified:true  = the numbers below were read off the chart image and then re-read a
                    second time against the source before being committed.
   src            = deck + slide + the chart image hash, so any number can be traced back.
   appliesTo      = every product in the deck that uses this exact chart image (not a guess —
                    taken from the image hash used on each product's slide).

   Coverage is tracked in SPEC_COVERAGE at the bottom. */

const PRODUCT_SPECS = {

  /* ================= RAINCOAT — all 5 models re-verified against deck charts ========= */
  "Raincoat": {
    "Magical Mist": {
      verified:true, src:"Magical mist raincoat-2025 #3 (1aa4d2e7)",
      sizes:["S","M","L","XL","2XL","3XL","4XL","5XL","6XL","7XL"],
      back: [29,33,38,43,50,57,66,77,86,93],
      girth:[40,50,55,60,65,77,88,104,110,125],
      neck: [31,38,40,42,47,50,56,64,66,70],
      /* 7XL is on the spec chart (flagged column) but has no SKU in the Odoo catalog yet. */
      notInCatalog:["7XL"],
      appliesTo:["Magical Mist Raincoat With Harness Opening"]
    },
    "RainBuddie": {
      verified:true, src:"RainBuddie raincoat 25 #3 (ccd7a187)",
      sizes:["S","M","L","XL","2XL","3XL","4XL","5XL"],
      back: [27,30,35,40,46,52,61,77],
      girth:[39,45,49,55,60,70,83,100],      /* girth round @ tape adjuster, middle stage */
      neck: [35,38,40,42,47,50,56,64],
      /* SOURCE DISCREPANCY — do not use until the product team confirms.
         The chart's "GIRTH ROUND MINIMUM" row (44,47,51,58,62,70,76,84) is LARGER than
         its own "middle stage" row at S–2XL, which is self-contradictory. Max row is
         (71,74,79,82,87,91,96,110). Middle stage is used above as it matches the
         catalog and the sales-validated sizes; min/max left out deliberately. */
      sourceIssue:"girth min row exceeds middle-stage row at S–2XL",
      appliesTo:["RainBuddie Dog Raincoat"]
    },
    "DD DewDrop": {
      verified:true, src:"DD Raincoat 2025 #3 (0a0d2346)",
      sizes:["S","M","L","XL","2XL","3XL","4XL","5XL","6XL"],
      back: [31,35,40,45,53,60,70,80,88],
      girth:[42,52,57,63,68,80,91,107,112],
      neck: [27,31,33,36,41,48,56,64,66],
      appliesTo:["Dash Dog DewDrop Raincoat For Dogs"]
    },
    "Rain Dancers": {
      verified:true, src:"PD deck of OPP raincoat #3 (b70abb1c)",
      sizes:["S","M","L","XL","2XL","3XL","4XL","5XL"],
      back: [31,36,40,45,52,62,72,80],
      girth:[44,52,60,64,67,77,92,110],      /* actual girth, proper velcro overlap */
      girthMin:[38,50,58,61,63,70,90,108],
      girthMax:[48,58,66,72,74,80,102,120],
      neck: [35,40,43,46,51,58,62,72],
      neckMin:[32,36,40,42,46,50,56,66],
      neckMax:[42,44,46,52,56,62,70,78],
      appliesTo:["RAIN DANCERS RAINCOAT"]
    },
    "RainTail Wrap": {
      verified:true, src:"RainTail Wrap raincoat-Olive #3 (958935ff)",
      sizes:["S","M","L","XL","2XL","3XL","4XL","5XL","6XL"],
      back: [27,30,35,40,46,52,61,77,86],
      girth:[39,45,49,55,60,70,83,100,110],  /* girth round @ tape adjuster, middle stage */
      neck: [35,38,40,42,47,50,56,64,68],
      /* Same SOURCE DISCREPANCY as RainBuddie: "GIRTH ROUND MINIMUM"
         (44,47,51,58,62,70,76,84,94) exceeds the middle-stage row at S–2XL.
         Max row is (71,74,79,82,87,91,96,110,120). Left out pending confirmation. */
      sourceIssue:"girth min row exceeds middle-stage row at S–2XL",
      appliesTo:["RainTail Wrap Raincoat For Dogs"]
    }
  },

  /* ================= T-SHIRT ================= */
  "T-Shirt": {
    "HUFT 2025 tee block": {
      verified:true, src:"HUFT t-shirts 2025 #3 (c8b7d323)",
      sizes:["XS","S","M","L","XL","2XL","3XL","4XL","5XL"],
      back: [26,31,36,40,45,52,60,70,77],
      girth:[33.5,38.5,45,49,54.5,60,70,83,100],
      neck: [23,27,31,33,36,41,48,56,72],
      weightKg:["0.8-2","2-3.2","3.2-4.8","4.8-7.0","7.0-11.0","11-16","22-30","30-38","40-55"],
      appliesTo:["Awesome Blossom Printed T-Shirt For Small Dogs","Best Dog Striped T-Shirt For Dogs",
                 "Cherry Pop Printed T-Shirt For Small Dogs","Cuddle Bug Striped T-Shirt For Dogs",
                 "Dapper Doggo Striped T-shirt For Dogs","Doodle Days Printed T-Shirt For Small Dogs",
                 "Forest Frolic Printed T-Shirt For Small Dogs","Pawfect Striped T-shirt For Dogs"]
      /* NOTE: "I Woof You" and "Jungle Joy" in this same deck use a DIFFERENT chart
         (f40c921f) — not yet read. Do not assume they share this block. */
    }
  },

  /* ================= SWEATER ================= */
  "Sweater": {
    "Winter 2025 sweater block": {
      verified:true, src:"Winter 2025 - PRODUCT DECK #20 (0f406da2)",
      sizes:["XS","S","M","L","XL","2XL","3XL","4XL"],
      back: [20,25,30,35,40,47,55,65],
      girth:[34.5,39.5,46,52,58,64,74,87],
      neck: [20,24,28,32,36,41,48,56],
      appliesTo:["Polar Bear Striped Sweater For Dogs","Blossom Knit Sweater For Dogs",
                 "Classic Love Sweater For Small Dogs","Jolly Jumper Sweater For Dogs",
                 "Reindeer Cheer Sweater For Dogs","Rudolph's Red-Nose Sweater For Small Dogs",
                 "Snuggle Bear Sweater For Small Dogs","Snuggle Season Sweater For Dogs",
                 "Sweetheart Stripe Sweater For Dogs"]
    },
    "Winter 2024 sweater block": {
      verified:true, src:"HUFT winter 2024 #11 (7249a099)",
      sizes:["XS","S","M","L","XL","2XL","3XL","4XL"],
      back: [20,25,30,35,40,47,55,65],       /* same back ladder as 2025 */
      girth:[30.5,35.5,42,48,54,60,70,83],   /* but a NARROWER girth — 4 cm tighter throughout */
      neck: [20,24,28,32,36,41,48,56],
      weightKg:["0.8-2","2-3.2","3.2-4.8","4.8-7.0","7.0-11.0","11-16","22-30","30-38"],
      /* This chart carries HUFT's own breed recommendation per size — an independent
         cross-check against the breed KB. Spellings are as printed on the chart. */
      breedRec:{XS:"Minis, Mini Chihuahua, 2 month olds", S:"Maltese, Yorkshire, Pekingese, Chihuahua",
                M:"Shih Tzu, Pekingese, Pomeranian", L:"Poodle, Shih Tzu, Pug, Schnauzer",
                XL:"Cocker Spaniel, Tibetan Terrier", "2XL":"Cocker Spaniel, Laufhunds",
                "3XL":"Shar Pei, Boxer", "4XL":"Labrador Retriever, Husky, Spinone"},
      appliesTo:["Merry Bright Dog Sweater","My Li'l Rudolph Dog Sweater","Snow Dashers Dog Sweater",
                 "Snug Stripes Blue Red Dog Sweater","Snug Stripes Turquoise Orange Dog Sweater"]
    },
    "Berry Merry": {
      verified:true, src:"Winter 2025 - PRODUCT DECK #30 (ddd8da13)",
      sizes:["XS","S","M","L","XL","2XL","3XL","4XL"],
      back: [20,25,30,35,40,47,55,65],
      girth:[30.5,35.5,42,48,54,60,70,83],
      neck: [20,24,28,32,36,41,48,56],
      bottom:[26.5,33,38,44,50,55,64,77],
      appliesTo:["Berry Merry Sweater For Dogs","Frosty Flowers Sweater For Small Dogs",
                 "Winter Spice Sweater For Dogs"]
    },
    "TLC Sunny Days": {
      verified:true, src:"Winter 25-TLC #3 (b659a918)",
      sizes:["XS","S","M","L","XL","2XL","3XL","4XL"],
      back: [20,25,30,35,40,47,55,65],
      girth:[30.5,35.5,42,48,54,60,70,83],
      neck: [20,24,28,32,36,41,48,56],
      bottom:[26.5,33,38,44,50,55,64,77],
      appliesTo:["TLC Sunny Days Sweater For Dogs","TLC Sunset Glow Sweater For Dogs"]
    },
    "TLC Cherry Cola": {
      verified:true, src:"Winter 25-TLC #5 (aeeaddc3)",
      sizes:["XS","S","M","L","XL","2XL","3XL","4XL"],
      back: [20,25,30,35,40,47,55,65],
      girth:[34.5,39.5,46,52,58,64,74,87],
      neck: [20,24,28,32,36,41,48,56],
      bottom:[31,36,42,48,54,59,68,81],
      appliesTo:["TLC Cherry Cola Sweater For Dogs","TLC Pumpkin Patch Sweater For Dogs"]
    },
    "AW23 Cable Knit": {
      verified:true, src:"AUTUMN_WINTER _23 #106 (3cad69a3)",
      sizes:["XS","S","M","L","XL","2XL","3XL","4XL"],
      back: [20,25,30,35,40,47,55,65],
      girth:[30.5,35.5,42,48,54,60,70,83],
      neck: [20,24,28,32,36,41,48,56],
      /* this chart has no BOTTOM row */
      appliesTo:["AW23 Cable Knit Sweater For Dogs","AW23 Merry Moose Sweater For Dogs",
                 "AW23 Radiant Rudolph Sweater For Dogs","AW23 Snowy Sweethearts Sweater For Dogs",
                 "AW23 Winter Miracle Sweater For Dogs"]
    }
  },

  /* ================= KURTA ================= */
  "Kurta": {
    "Dapper Doggo / Royal Elegance block": {
      verified:true, src:"Festive Collection_Diwali 2024 #34 (a1f78397)",
      sizes:["S","M","L","XL","2XL","3XL","4XL","5XL"],
      back: [26,30,36,40,47,54,64,70],
      girth:[41,48,53,59,64,74,87,104],
      neck: [27,31,33,37,41,46,51,66],
      bottom:[37,44,49,55,59,69,81,98],
      /* weight + breed rows are blank for S and 5XL on this chart */
      weightKg:[null,"3.2-4.8","4.8-7.0","7.0-11.0","11-16","22-30","30-38",null],
      breedRec:{M:"Maltese, Yorkshire, Pekingese, Chihuahua", L:"Shih Tzu, Pekingese, Pomeranian",
                XL:"Poodle, Shih Tzu, Pug, Schnauzer", "2XL":"Cocker Spaniel, Tibetan Terrier",
                "3XL":"Cocker Spaniel, Laufhunds", "4XL":"Shar Pei, Boxer",
                "5XL":"Labrador Retriever, Husky, Spinone"},
      /* One chart serves a kurta AND a sherwani — cross-listed under Sherwani too.
         This is the chart the app's existing Kurta size ladder was built from. */
      alsoCategory:"Sherwani",
      appliesTo:["Dapper Doggo Kurta For Dogs","Royal Elegance Sherwani For Dogs"]
    },
    "Jaipuri block-print kurta": {
      verified:true, src:"Winter 2025 - PRODUCT DECK #247 (1b22f6d3)",
      sizes:["S","M","L","XL","2XL","3XL","4XL","5XL"],
      back: [29,33,38,43,50,57,66,77],
      girth:[40,46,50,56,62,76,86,94],
      neck: [31,38,42,45,50,52,56,64],
      appliesTo:["Jaipuri Gul Block-Printed Kurta for Dogs","Jaipuri Phool Block-Printed Kurta for Dogs"]
    }
  },

  /* ================= SHERWANI ================= */
  "Sherwani": {
    "Petals & Pyaar Brocade": {
      verified:true, src:"Dil se Desi Collection 2025 #4 (466b1709)",
      sizes:["S","M","L","XL","2XL","3XL","4XL","5XL"],
      back: [31,36,40,45,52,62,72,78],
      girth:[44,52,60,64,67,74,92,110],      /* actual girth, proper velcro overlap */
      girthMin:[38,50,57,61,63,70,88,104],
      girthMax:[48,58,66,70,73,80,98,116],
      neck: [35,40,43,46,51,58,62,72],
      neckMin:[32,36,39,42,46,52,56,62],
      neckMax:[42,44,49,52,57,64,68,72],
      appliesTo:["Petals & Pyaar Brocade Sherwani For Dogs"]
    },
    "Royal Elegance": {
      verified:true, src:"Festive Collection_Diwali 2024 #34 (a1f78397)",
      sizes:["S","M","L","XL","2XL","3XL","4XL","5XL"],
      back: [26,30,36,40,47,54,64,70],
      girth:[41,48,53,59,64,74,87,104],
      neck: [27,31,33,37,41,46,51,66],
      bottom:[37,44,49,55,59,69,81,98],
      /* Same chart as Kurta / "Dapper Doggo / Royal Elegance block" — one chart image
         is used on both products' slides. Duplicated here so a Sherwani lookup finds it. */
      sharedWith:"Kurta / Dapper Doggo / Royal Elegance block",
      appliesTo:["Royal Elegance Sherwani For Dogs"]
    }
  },

  /* ================= BANDANA (accessory — neck only, no back/girth) ================= */
  "Bandana": {
    "Shahi Sherwani Bandana": {
      verified:true, src:"Festive Collection_Diwali 2024 #9 (b0c03427)",
      sizes:["S","M","L"],
      length:[22,24,26],
      width:[17,19,23],
      neckMin:[32,38,43],
      neckMax:[46,55,64],
      strapWidth:[2,2,2],
      /* Not body apparel: no back length or chest girth. Fits on neck range alone.
         Was wrongly counted in the 70 apparel-chart total. */
      appliesTo:["Shahi Sherwani Bandana for Dogs"]
    }
  }
};

/* 70 distinct apparel size-charts were located across the 29 decks.
   read = transcribed AND re-verified against the source image. */
const SPEC_COVERAGE = {
  "Raincoat":   {read:5, total:8},
  "Sweater":    {read:6, total:6},   /* COMPLETE */
  "T-Shirt":    {read:1, total:14},
  "Kurta":      {read:2, total:9},   /* +1: a1f78397 was filed under Sherwani by the classifier */
  "Sherwani":   {read:2, total:2},   /* COMPLETE — 3rd chart was a bandana, moved out */
  "Bandana":    {read:1, total:1},   /* accessory, neck only — not part of the apparel matcher */
  "Sweatshirt": {read:0, total:9},
  "Jacket":     {read:0, total:10},
  "Dress":      {read:0, total:10},
  "Shirt":      {read:0, total:2}
};
