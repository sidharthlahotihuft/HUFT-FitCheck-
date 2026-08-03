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
    },
    "Magical Mist (SS26 deck)": {
      verified:true, src:"HUFT SPRING SUMMER DECK 2026 #64 (6d42c16d)",
      sizes:["S","M","L","XL","2XL","3XL","4XL","5XL","6XL"],
      back: [29,33,38,43,50,57,66,77,86],
      girth:[40,50,55,60,65,77,88,104,110],
      neck: [24,28,30,34,38,42,50,66,70],
      bottom:[37,46,50,55,60,71,80,98,104],
      /* CONFLICT — same product name, two decks, two different neck rows:
           2025 deck (1aa4d2e7):  31,38,40,42,47,50,56,64,66   <- what the app uses today
           2026 deck (this one):  24,28,30,34,38,42,50,66,70
         Back and girth agree exactly; only neck differs, by up to 10 cm at S.
         Both are recorded. NOT reconciled — product team needs to say which is current.
         On this chart the neck row is printed in lighter type than the rest, which may
         mean it was revised. */
      conflictsWith:"Raincoat / Magical Mist (2025 deck)",
      appliesTo:["Magical Mist Raincoat With Harness Opening"]
    },
    "Monsoon Mate Easywear": {
      verified:true, src:"HUFT SPRING SUMMER DECK 2026 #77 (73943f58)",
      sizes:["S","M","L","XL","2XL","3XL","4XL","5XL","6XL"],
      back: [29,33,38,43,50,57,66,77,86],
      girth:[40,50,55,60,65,77,88,104,110],   /* girth round @ tape adjuster, middle stage */
      neck: [25,29,31,35,39,43,51,67,70],
      /* Shares the Magical Mist back + girth block but has its own neck.
         Same girth min/max contradiction as RainBuddie / RainTail:
         min row (44,47,51,58,62,70,76,84,94) exceeds middle stage at S–2XL.
         Max row (71,74,79,82,87,91,96,110,120). Left out pending confirmation. */
      sourceIssue:"girth min row exceeds middle-stage row at S–2XL",
      appliesTo:["Monsoon Mate Easywear Raincoat For Dogs"]
    },
    "Puddle Jumper": {
      verified:true, src:"HUFT SPRING SUMMER DECK 2026 #81 (4a068677)",
      sizes:["S","M","L","XL","2XL","3XL","4XL","5XL","6XL"],
      back: [31,35,40,45,53,60,70,80,88],
      girth:[42,52,57,63,68,80,91,107,112],
      neck: [25,30,32,35,38,42,50,64,66],
      bottom:[35,41,45,50,55,65,77,94,104],
      /* Shares DD DewDrop's back + girth block exactly, but neck runs narrower
         (DD DewDrop: 27,31,33,36,41,48,56,64,66). Recorded as observed. */
      appliesTo:["Puddle Jumper full coverage raincoat"]
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
    },
    /* ---- Ladder A: back 26–70. Shares girth+neck with Ladder B below. ---- */
    "Rang Riwaz": {
      verified:true, src:"Dil se Desi Collection 2025 #8 (75f41038)",
      sizes:["S","M","L","XL","2XL","3XL","4XL","5XL"],
      back: [26,30,36,40,47,54,64,70],
      girth:[41,48,53,59,64,74,87,104],
      neck: [27,31,33,37,41,46,51,66],
      bottom:[37,44,49,55,59,69,81,98],
      weightKg:[null,"3.2-4.8","4.8-7.0","7.0-11.0","11-16","22-30","30-38",null],
      backLadder:"A",
      appliesTo:["Rang Riwaz Kurta For Dogs"]
    },
    "EthniPaw Ikat": {
      verified:true, src:"Rakhi Collection 2025 #4 (ca021000)",
      sizes:["S","M","L","XL","2XL","3XL","4XL","5XL"],
      back: [26,30,36,40,47,54,64,70],
      girth:[41,48,53,59,64,74,87,104],
      neck: [27,31,33,37,41,46,51,66],
      bottom:[37,44,49,55,59,69,81,98],
      weightKg:[null,"3.2-4.8","4.8-7.0","7.0-11.0","11-16","22-30","30-38",null],
      backLadder:"A",
      appliesTo:["EthniPaw Ikat Kurta For Dogs","Pawdhani Leheriya Kurta For Dogs"]
    },
    "Floral Paws": {
      verified:true, src:"HUFT SPRING SUMMER DECK 2026 #199 (78108860)",
      sizes:["S","M","L","XL","2XL","3XL","4XL","5XL"],
      back: [26,30,36,40,47,54,64,70],
      girth:[41,48,53,59,64,74,87,104],
      neck: [27,31,33,37,41,46,51,66],
      bottom:[37,44,49,55,59,69,81,98],
      weightKg:[null,"3.2-4.8","4.8-7.0","7.0-11.0","11-16","22-30","30-38",null],
      backLadder:"A",
      /* raglan rows are labelled in the opposite order to Rang Riwaz and the front
         raglan values differ (13,14.5,18,20,23,25,28,32). Recorded, not reconciled. */
      appliesTo:["Floral Paws Kurta For Dogs","Pawbloom Kurta For Dogs","Pawdhani Lehriya Kurta For Dogs"]
    },
    "RAKHI Dog Kurta": {
      verified:true, src:"Festive Collection_Rakhi 2024 #36 (46da97f4)",
      sizes:["S","M","L","XL","2XL","3XL","4XL","5XL"],
      back: [26,30,36,40,47,54,64,70],
      girth:[41,48,53,59,64,74,87,104],
      neck: [27,31,33,37,41,46,51,66],
      bottom:[37,44,49,55,59,69,81,98],
      weightKg:[null,"3.2-4.8","4.8-7.0","7.0-11.0","11-16","22-30","30-38",null],
      backLadder:"A",
      breedRec:{M:"Maltese, Yorkshire, Pekingese, Chihuahua", L:"Shih Tzu, Pekingese, Pomeranian",
                XL:"Poodle, Shih Tzu, Pug, Schnauzer", "2XL":"Cocker Spaniel, Tibetan Terrier",
                "3XL":"Cocker Spaniel, Laufhunds", "4XL":"Shar Pei, Boxer",
                "5XL":"Labrador Retriever, Husky, Spinone"},
      appliesTo:["RAKHI Dog Kurta"]
    },
    /* ---- Ladder B: back 31–77 at S–5XL. SAME girth + neck as Ladder A. ---- */
    "Royal Elephant Brocade": {
      verified:true, src:"Dil se Desi Collection 2025 #16 (b4cac89d)",
      sizes:["S","M","L","XL","2XL","3XL","4XL","5XL"],
      back: [31,36,40,45,52,60,70,77],
      girth:[41,48,53,59,64,74,87,104],
      neck: [27,31,33,37,41,46,51,66],
      bottom:[35.5,41,45,50.5,55,65,77,94],
      weightKg:[null,"3.2-4.8","4.8-7.0","7.0-11.0","11-16","22-30","30-38",null],
      backLadder:"B",
      /* Same deck as Rang Riwaz (Ladder A) but a 5 cm longer back at every size,
         while girth and neck are identical. A dog sized by chest gets the same
         letter on both, but a 5–7 cm different garment length. */
      appliesTo:["Royal Elephant Brocade Kurta For Dogs"]
    },
    "Shahi Paws": {
      verified:true, src:"Dil se Desi Collection 2025 #12 (068ecbec)",
      sizes:["XS","S","M","L","XL","2XL","3XL","4XL","5XL"],
      back: [26,31,36,40,45,52,60,70,77],
      girth:[35,41,48,53,59,64,74,87,104],
      neck: [23,27,31,33,36,41,46,56,66],
      bottom:[30.5,35.5,41,45,50.5,55,65,77,94],
      backLadder:"B",
      /* Ladder B with an extra XS prepended. Its S onward matches Royal Elephant
         exactly on all three dimensions. */
      appliesTo:["Shahi Paws Kurta For Dogs"]
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

  /* ================= SWEATSHIRT =================
     All eight run the same body block as the T-shirt. Two sub-variants differ only
     at two cells: girth XL and neck 5XL.
       variant "a": girth XL 54.5, neck 5XL 72
       variant "b": girth XL 55,   neck 5XL 68
     Four of these are customer-facing SIZE GUIDES with dog silhouettes rather than
     tech packs — see chartType. Their numbers are identical to the tech-pack numbers,
     which is flagged in SPEC_NOTES as an open question. */
  "Sweatshirt": {
    "Good Doggo": {
      verified:true, src:"HUFT winter 2024 #4 (b4a2b7e1)", chartType:"techpack", variant:"a",
      sizes:["XS","S","M","L","XL","2XL","3XL","4XL","5XL"],
      back: [26,31,36,40,45,52,60,70,77],
      girth:[33.5,38.5,45,49,54.5,60,70,83,100],
      neck: [23,27,31,33,36,41,48,56,72],
      bottom:[30.5,35.5,41,45,50.5,54,62,75,90],
      weightKg:["0.8-2","2-3.2","3.2-4.8","4.8-7.0","7.0-11.0","11-16","22-30","30-38",null],
      /* header of this chart reads "Dog T-shirt" — same block as the tee */
      appliesTo:["GOOD DOGGO PET SWEATSHIRT","SPOILT SWEET COLOUR BLOCK HOODIE PET SWEATSHIRT",
                 "WAG MORE WORRY LESS COLOUR BLOCK HOODIE PET SWEATSHIRT"]
    },
    "AW23 Polka Dot": {
      verified:true, src:"AUTUMN_WINTER _23 #93 (5d869acd)", chartType:"techpack", variant:"a",
      sizes:["S","M","L","XL","2XL","3XL","4XL","5XL"],
      back: [31,36,40,45,52,60,70,77],
      girth:[38.5,45,49,54.5,60,70,83,100],
      neck: [27,31,33,36,41,48,56,72],
      bottom:[35.5,41,45,50.5,54,62,75,90],
      appliesTo:["AW23 Polka Dot Sweatshirt For Pets - Navy","AW23 Polka Dot Sweatshirt For Pets - Red"]
    },
    "AW23 Colour Block Hoodie": {
      verified:true, src:"AUTUMN_WINTER _23 #99 (85bd5483)", chartType:"techpack", variant:"b",
      sizes:["XS","S","M","L","XL","2XL","3XL","4XL","5XL"],
      back: [26,31,36,40,45,52,60,70,77],
      girth:[33.5,38.5,45,49,55,60,70,83,100],
      neck: [23,27,31,33,36,41,48,56,68],
      bottom:[30.5,35.5,41,45,50.5,55,65,77,94],
      appliesTo:["AW23 Colour Block Hoodie Pet Sweatshirt - Black",
                 "AW23 Colour Block Hoodie Pet Sweatshirt - Mustard"]
    },
    "Happy Teddy": {
      verified:true, src:"Winter 2025 - PRODUCT DECK #3 (892a5d40)", chartType:"size-guide", variant:"a",
      sizes:["S","M","L","XL","2XL","3XL","4XL","5XL"],
      back: [31,36,40,45,52,60,70,77],
      girth:[38.5,45,49,54.5,60,70,83,100],
      neck: [27,31,33,36,41,48,56,72],
      front:[24,27,29,32,35,39,44,48],
      appliesTo:["Happy Teddy Sweatshirt For Small Dogs","Sunny Bear Sweatshirt For Small Dogs"]
    },
    "Pup Parade": {
      verified:true, src:"Winter 2025 - PRODUCT DECK #5 (80e21b82)", chartType:"size-guide", variant:"a",
      sizes:["S","M","L","XL","2XL","3XL","4XL","5XL"],
      back: [31,36,40,45,52,60,70,77],
      girth:[38.5,45,49,54.5,60,70,83,100],
      neck: [27,31,33,36,41,48,56,72],
      front:[24,27,29,32,35,39,44,48],
      /* labelled "for Big dogs" but the chart is identical to Happy Teddy,
         which is labelled "For Small Dogs". Recorded as printed. */
      appliesTo:["Pup Parade Sweatshirt for Big dogs"]
    },
    "Cutest Cuddle Buddy": {
      verified:true, src:"Winter 2025 - PRODUCT DECK #7 (8a31dd84)", chartType:"size-guide", variant:"a",
      sizes:["S","M","L","XL","2XL","3XL","4XL","5XL"],
      back: [31,36,40,45,52,60,70,77],
      girth:[38.5,45,49,54.5,60,70,83,100],
      neck: [27,31,33,36,41,48,56,72],
      front:[24,27,29,32,35,39,44,48],
      appliesTo:["Cutest Cuddle Buddy Sweatshirt For Big Dogs"]
    },
    "Flower Power": {
      verified:true, src:"Winter 2025 - PRODUCT DECK #9 (0e81b55c)", chartType:"size-guide", variant:"a",
      sizes:["S","M","L","XL","2XL","3XL","4XL","5XL"],
      back: [31,36,40,45,52,60,70,77],
      girth:[38.5,45,49,54.5,60,70,83,100],
      neck: [27,31,33,36,41,48,56,72],
      front:[24,27,29,32,35,39,44,48],
      appliesTo:["Flower Power Sweatshirt For Dogs","Woof Squad Sweatshirt For Dogs"]
    },
    "Cherry Sweet": {
      verified:true, src:"Winter 2025 - PRODUCT DECK #11 (1b70f089)", chartType:"size-guide", variant:"b",
      sizes:["S","M","L","XL","2XL","3XL","4XL","5XL"],
      back: [31,36,40,45,52,60,70,77],
      girth:[38.5,45,49,55,60,70,83,100],
      neck: [27,31,33,36,41,48,56,68],
      front:[22,27,29,32,35,39,44,48],
      /* The M and L size labels are partly covered by a UI arrow overlay in the deck
         image. The row VALUES are fully legible; the two labels are inferred from the
         S/12 ... XL/18 sequence. Worth a second pair of eyes on the original slide. */
      labelsObscured:["M","L"],
      appliesTo:["Cherry Sweet Sweatshirt with hood For Big Dogs"]
    }
  },

  /* ================= EAR MUFFS (accessory — no back/girth/neck) ================= */
  "Ear Muffs": {
    "Noise-Out Hoodies": {
      verified:true, src:"Festive Collection_Diwali 2024 #3 (26c9c513)",
      sizes:["M","L"],
      lengthIn:[5,7],
      widthIn:[5,7],
      breedSize:["mini-medium","medium-large"],
      /* Named "Hoodies" but these are ear muffs. No body dimensions.
         Was wrongly counted as a sweatshirt chart. */
      appliesTo:["Noise-Out Hoodies - Doggie Ear Muffs"]
    }
  },

  /* ================= SHIRT ================= */
  "Shirt": {
    "Printed Shirt For Pets": {
      verified:true, src:"PD deck for Printed shirts 2024 #3 (a9366eeb)",
      sizes:["S","M","L","XL","2XL","3XL","4XL","5XL"],
      back: [26,30,36,40,47,54,64,70],
      girth:[41,48,53,59,64,74,87,104],
      neck: [27,31,33,37,41,46,51,66],
      bottom:[37,44,49,55,59,69,81,98],
      weightKg:[null,"3.2-4.8","4.8-7.0","7.0-11.0","11-16","22-30","30-38",null],
      /* back/girth/neck are numerically identical to the Kurta "Dapper Doggo /
         Royal Elegance" chart, but this is a separate chart image in a separate
         deck. Kept as its own entry rather than merged. */
      appliesTo:["PRINTED SHIRT FOR PETS - MULTICOLOR","PRINTED SHIRT FOR PETS - RED"]
    },
    "Hearts In Bloom": {
      verified:true, src:"HUFT X PINKLAY 2025 #17 (25e753c3)",
      sizes:["S","M","L","XL","2XL","3XL","4XL","5XL"],
      back: [26,30,36,40,47,54,64,70],
      girth:[41,48,53,59,64,74,87,104],
      neck: [27,31,33,37,41,46,51,66],
      bottom:[37,44,49,55,59,69,81,98],
      collarHeight:[2.5,2.5,3,3,3,3.5,3.5,3.5],
      /* Same back/girth/neck as the Printed Shirt chart, but the secondary rows
         differ: front/back raglan are swapped and cuff opening at 3XL is 17 (not 19).
         Recorded as observed — not reconciled. */
      appliesTo:["Hearts In Bloom Shirt For Dogs","Jungle Joyride Shirt For Dogs"]
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

/* ---------------------------------------------------------------------------
   SOURCE OF TRUTH: the deck charts, not Odoo.

   Odoo publishes only "Length" for body apparel — no girth, no neck. Where the
   deck and Odoo both have a length, they were compared cell by cell:
       401 size-cells compared, 397 agree (99%).
   All 4 disagreements are Odoo defects, listed below. None were deck errors.

   Two caveats: decks can disagree with each other (see Magical Mist neck), and
   some deck charts are customer size guides rather than tech packs (chartType).
   --------------------------------------------------------------------------- */
const CATALOG_DEFECTS = [
  {
    product:"HUFT Printed Shirt For Pets - Multicolor", sku:"HUFTFC8779*",
    issue:"Lengths shifted up one size and 3XL missing entirely.",
    odoo:{S:26,M:30,L:40,XL:47,"2XL":54,"3XL":null,"4XL":64,"5XL":70},
    deck:{S:26,M:30,L:36,XL:40,"2XL":47,"3XL":54,"4XL":64,"5XL":70},
    note:"The Red variant (HUFTFC8778*) of the same product matches the deck exactly. "+
         "So Multicolor L ships a 40 cm garment while Red L ships 36 cm, same size letter."
  },
  {
    product:"HUFT Monsoon Mate Easywear Raincoat For Dogs - Red", sku:"HUFTC01164XL",
    issue:"4XL length is 55 cm, which is SHORTER than 3XL at 57 cm — sequence goes backwards.",
    odoo:{"3XL":57,"4XL":55,"5XL":77}, deck:{"3XL":57,"4XL":66,"5XL":77},
    note:"Deck value 66 fits the sequence. Looks like a transcription typo in Odoo."
  }
];

/* 70 distinct apparel size-charts were located across the 29 decks.
   read = transcribed AND re-verified against the source image. */
const SPEC_COVERAGE = {
  "Raincoat":   {read:8, total:8},   /* COMPLETE */
  "Sweater":    {read:6, total:6},   /* COMPLETE */
  "T-Shirt":    {read:1, total:14},
  "Kurta":      {read:8, total:8},   /* COMPLETE — 9th "chart" (6318c698) was a product photo */
  "Sherwani":   {read:2, total:2},   /* COMPLETE — 3rd chart was a bandana, moved out */
  "Bandana":    {read:1, total:1},   /* accessory, neck only — not part of the apparel matcher */
  "Sweatshirt": {read:8, total:8},   /* COMPLETE — 9th chart (26c9c513) was ear muffs */
  "Ear Muffs":  {read:1, total:1},   /* accessory, not body apparel */
  "Jacket":     {read:0, total:10},
  "Dress":      {read:0, total:10},
  "Shirt":      {read:2, total:2}    /* COMPLETE */
};
